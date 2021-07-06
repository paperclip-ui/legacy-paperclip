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
import { DiagnosticKind } from "../../../paperclip-utils";

type KeyValue<TValue> = {
  [identifier: string]: TValue;
};

export class VSCServiceBridge {
  private _documents: KeyValue<TextDocument> = {};
  private _contentChanges: Record<string, string> = {};
  private _waitingForCalm = false;

  constructor(
    private _engine: EngineDelegate,
    private _service: LanguageServices,
    readonly connection: Connection,
    private _enhanceCalm: () => void
  ) {
    _engine.onEvent(this._onEngineDelegateEvent);
    connection.onRequest(
      ColorPresentationRequest.type,
      this._onColorPresentationRequest
    );
    connection.onRequest(
      DocumentColorRequest.type,
      this._onDocumentColorRequest
    );
    connection.onRequest(CompletionRequest.type, this._onCompletionRequest);
    connection.onRequest(
      CompletionResolveRequest.type,
      this._onCompletionResolveRequest
    );

    connection.onRequest(DefinitionRequest.type, this._onDefinitionRequest);
    connection.onRequest(DocumentLinkRequest.type, this._onDocumentLinkRequest);

    connection.onDidOpenTextDocument(({ textDocument }) => {
      const uri = fixFileUrlCasing(textDocument.uri);
      this._documents[uri] = TextDocument.create(
        uri,
        textDocument.languageId,
        textDocument.version,
        textDocument.text
      );

      this._engine.updateVirtualFileContent(uri, textDocument.text);
    });
    connection.onDidCloseTextDocument(params => {
      const uri = fixFileUrlCasing(params.textDocument.uri);
      delete this._documents[uri];
    });

    connection.onDidChangeTextDocument(params => {
      const uri = fixFileUrlCasing(params.textDocument.uri);
      this._updateTextContent(uri, params.contentChanges);
    });
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

  goAheadNowYaHear() {
    this._waitingForCalm = false;
    this._maybePersistContentChanges();
  }

  private _deferUpdateEngineContent = (uri: string, content: string) => {
    this._contentChanges[uri] = content;
    this._maybePersistContentChanges();
  };

  private _maybePersistContentChanges = () => {
    if (this._waitingForCalm) {
      return;
    }

    if (Object.keys(this._contentChanges).length === 0) {
      this._waitingForCalm = false;
      return;
    }
    const contentChanges = this._contentChanges;
    this._contentChanges = {};
    this._waitingForCalm = true;

    // Engine is synchronous, so we may end up with a flood of events
    // that become a bottleneck. The _correct_ area would be put to this
    // in the engine, but that would require async work that could defer
    // performance elsewhere (e.g: transmitting data between worker & parent). So
    // Cheap way is ask the client to help enhance calm
    this._enhanceCalm();

    for (const uri in contentChanges) {
      this._engine.updateVirtualFileContent(
        fixFileUrlCasing(uri),
        contentChanges[uri]
      );
    }
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

  private _onDocumentColorRequest = (params: DocumentColorParams) => {
    const uri = fixFileUrlCasing(params.textDocument.uri);
    const document = this._documents[uri];
    const service = this._service.getService(uri);
    return (
      service &&
      (service
        .getColors(document.uri)
        .map(({ color, location }) => {
          // Skip for now.
          if (/var\(.*?\)/.test(color)) {
            return;
          }

          try {
            const {
              color: [red, green, blue],
              valpha: alpha
            } = parseColor(color);

            return {
              range: {
                start: document.positionAt(location.start),
                end: document.positionAt(location.end)
              },
              color: {
                red: red / 255,
                green: green / 255,
                blue: blue / 255,
                alpha
              }
            };
          } catch (e) {
            console.error(e.stack);
          }
        })
        .filter(Boolean) as ColorInformation[])
    );
  };

  private _onColorPresentationRequest = (params: ColorPresentationParams) => {
    const presentation = getColorPresentation(params.color, params.range);
    const uri = fixFileUrlCasing(params.textDocument.uri);

    const document = this._documents[uri];

    const { textEdit } = presentation;
    const source = TextDocument.applyEdits(document, [textEdit]);

    // update virtual file content to show preview
    // this._previewEngineContent(params.textDocument.uri, { text: source });
    this._deferUpdateEngineContent(uri, source);

    return [presentation];
  };

  private _updateTextContent = (
    uri: string,
    events: TextDocumentContentChangeEvent[]
  ) => {
    const newDocument = TextDocument.update(
      this._documents[uri],
      events,
      this._documents[uri].version + 1
    );
    this._documents[uri] = newDocument;
    this._deferUpdateEngineContent(uri, newDocument.getText());
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

    this._maybePersistContentChanges();
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

// from https://github.com/microsoft/vscode-css-languageservice/blob/a652e5da7ebb86677bff750c9ca0cf4740adacee/src/services/cssNavigation.ts#L196
const getColorPresentation = (
  { red, green, blue, alpha }: Color,
  range: Range
): ColorPresentation => {
  const info = parseColor.rgb(
    Math.round(red * 255),
    Math.round(green * 255),
    Math.round(blue * 255),
    alpha
  );
  const label = info.toString();
  return { label, textEdit: TextEdit.replace(range, label) };
};

const createDiagnostic = (
  severity: DiagnosticSeverity,
  message: string,
  textDocument: TextDocument,
  location: SourceLocation
) => {
  return {
    severity,
    range: {
      start: textDocument.positionAt(location.start),
      end: textDocument.positionAt(location.end)
    },
    message: `${message}`,
    source: "ex"
  };
};
