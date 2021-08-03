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
    connection.onRequest(
      CompletionResolveRequest.type,
      this._onCompletionResolveRequest
    );
  }

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
