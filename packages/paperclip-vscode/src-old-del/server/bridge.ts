import {
  Connection,
  ColorPresentationRequest,
  ColorPresentationParams,
  DocumentColorRequest,
  DocumentColorParams,
  DocumentLinkRequest,
  DocumentLink,
  DocumentLinkParams,
  DefinitionRequest,
  DefinitionLink,
  DefinitionParams,
  CompletionRequest,
  CompletionParams,
  CompletionResolveRequest
} from "vscode-languageserver";
import {
  EngineDelegateEvent,
  EngineDelegateEventKind,
  EngineErrorEvent,
  EngineErrorKind,
  ChangedSheetsEvent,
  GraphErrorEvent,
  DiffedEvent,
  SourceLocation,
  RuntimeErrorEvent,
  EvaluatedEvent,
  LoadedEvent
} from "paperclip";

import * as parseColor from "color";
import * as fs from "fs";
import * as url from "url";
import {
  Color,
  Range,
  ColorPresentation,
  ColorInformation,
  DiagnosticSeverity,
  TextEdit,
  Diagnostic
} from "vscode-languageserver";
import {
  TextDocument,
  TextDocumentContentChangeEvent
} from "vscode-languageserver-textdocument";
import { LanguageServices } from "./services";
import { stripFileProtocol } from "paperclip";
import { EngineDelegate } from "paperclip";
import { fixFileUrlCasing } from "../utils";
import { DiagnosticKind } from "paperclip-utils";

type KeyValue<TValue> = {
  [identifier: string]: TValue;
};

export class VSCServiceBridge {
  private _documents: KeyValue<TextDocument> = {};
  private _contentChanges: Record<string, string> = {};
  private _waitingForCalm = false;
  private _updateSkips: Record<string, number> = {};

  constructor(
    private _engine: EngineDelegate,
    private _service: LanguageServices,
    readonly connection: Connection,
    private _enhanceCalm: () => void
  ) {
    _engine.onEvent(this._onEngineDelegateEvent);
    connection.onRequest(CompletionRequest.type, this._onCompletionRequest);
    connection.onRequest(
      CompletionResolveRequest.type,
      this._onCompletionResolveRequest
    );

    connection.onRequest(DefinitionRequest.type, this._onDefinitionRequest);
    connection.onRequest(DocumentLinkRequest.type, this._onDocumentLinkRequest);
  }

  private _onDocumentLinkRequest = (params: DocumentLinkParams) => {
    const uri = fixFileUrlCasing(params.textDocument.uri);
    const document = this._documents[uri];
    const service = this._service.getService(uri);
    return (
      service &&
      (service.getLinks(uri).map(({ uri, location: { start, end } }) => ({
        target: uri,
        range: {
          start: document.positionAt(start),
          end: document.positionAt(end)
        }
      })) as DocumentLink[])
    );
  };

  private _onDefinitionRequest = (params: DefinitionParams) => {
    const uri = fixFileUrlCasing(params.textDocument.uri);
    const document = this._documents[uri];
    const service = this._service.getService(uri);
    const info =
      service &&
      (service
        .getDefinitions(document.uri)
        .filter(info => {
          const offset = document.offsetAt(params.position);
          return (
            offset >= info.instanceLocation.start &&
            offset <= info.instanceLocation.end
          );
        })
        .map(
          ({
            sourceUri,
            instanceLocation: { start: instanceStart, end: instanceEnd },
            sourceLocation: { start: sourceStart, end: sourceEnd },
            sourceDefinitionLocation: {
              start: definitionStart,
              end: definitionEnd
            }
          }) => {
            const sourceDocument =
              this._documents[sourceUri] ||
              TextDocument.create(
                sourceUri,
                "paperclip",
                null,
                fs.readFileSync(stripFileProtocol(sourceUri), "utf8")
              );

            return {
              targetUri: sourceDocument.uri,
              targetRange: {
                start: sourceDocument.positionAt(definitionStart),
                end: sourceDocument.positionAt(definitionEnd)
              },
              targetSelectionRange: {
                start: sourceDocument.positionAt(sourceStart),
                end: sourceDocument.positionAt(sourceEnd)
              },
              originSelectionRange: {
                start: document.positionAt(instanceStart),
                end: document.positionAt(instanceEnd)
              }
            };
          }
        ) as DefinitionLink[]);
    return info;
  };

  private _onCompletionRequest = (params: CompletionParams) => {
    const uri = fixFileUrlCasing(params.textDocument.uri);
    const document = this._documents[uri];

    const doc = document.getText();
    const text = doc.substr(0, document.offsetAt(params.position));

    const ret = this._service.getService(uri).getCompletionItems(uri, text);

    return ret;
  };

  private _onCompletionResolveRequest = item => {
    return this._service.getService(item.data.uri).resolveCompletionItem(item);
  };

  private _onEngineDelegateEvent = (event: EngineDelegateEvent) => {
    switch (event.kind) {
      case EngineDelegateEventKind.Error: {
        this._onEngineErrorEvent(event);
        break;
      }
      case EngineDelegateEventKind.Loaded:
      case EngineDelegateEventKind.Diffed:
      case EngineDelegateEventKind.ChangedSheets:
      case EngineDelegateEventKind.Evaluated: {
        this._onEngineEvaluatedEvent(event);
        break;
      }
    }
  };

  private _onEngineEvaluatedEvent(
    event: DiffedEvent | EvaluatedEvent | LoadedEvent | ChangedSheetsEvent
  ) {
    setTimeout(() => {
      this.connection.sendDiagnostics({
        uri: event.uri,
        diagnostics: this._lint(event.uri, true)
      });
    });
  }

  private _onEngineErrorEvent(event: EngineErrorEvent) {
    try {
      switch (event.errorKind) {
        case EngineErrorKind.Graph: {
          return this._handleGraphError(event);
        }
        case EngineErrorKind.Runtime: {
          return this._handleRuntimeError(event);
        }
      }
    } catch (e) {
      console.error(e.stack);
    }
  }

  private _handleGraphError({ uri }: GraphErrorEvent) {
    this._sendLints(uri);
  }
  private _handleRuntimeError({ uri }: RuntimeErrorEvent) {
    this._sendLints(uri);
  }

  private _sendLints(uri: string) {
    let textDocument = this._documents[uri];

    if (!textDocument) {
      textDocument = TextDocument.create(
        uri,
        "paperclip",
        0,
        fs.readFileSync(url.fileURLToPath(uri), "utf8")
      );
    }

    // fix wasm loop
    setTimeout(() => {
      this.connection.sendDiagnostics({
        uri,
        diagnostics: this._lint(uri)
      });
    });
  }

  private _lint(uri: string, createDocument = false): Diagnostic[] {
    let textDocument = this._documents[uri];

    if (!textDocument && createDocument) {
      textDocument = TextDocument.create(
        uri,
        "paperclip",
        0,
        fs.readFileSync(url.fileURLToPath(uri), "utf8")
      );
    }

    if (!textDocument) {
      return [];
    }

    return this._engine
      .lint(uri)
      .map(diag => {
        switch (diag.diagnosticKind) {
          case DiagnosticKind.EngineError: {
            if (diag.errorKind === EngineErrorKind.Graph) {
              return createDiagnostic(
                DiagnosticSeverity.Error,
                diag.info.message,
                textDocument,
                diag.info.location
              );
            } else if (diag.errorKind === EngineErrorKind.Runtime) {
              return createDiagnostic(
                DiagnosticSeverity.Error,
                diag.message,
                textDocument,
                diag.location
              );
            }
            return null;
          }
          case DiagnosticKind.LintWarning: {
            return createDiagnostic(
              DiagnosticSeverity.Warning,
              diag.message,
              textDocument,
              diag.source.textSource!.location
            );
          }
        }
      })
      .filter(Boolean);
  }
}
