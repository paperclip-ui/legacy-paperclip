import {
  TextDocuments,
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
  DefinitionParams
} from "vscode-languageserver";
import {
  Engine,
  EngineEvent,
  EngineEventKind,
  EngineErrorEvent,
  EngineErrorKind,
  GraphErrorEvent,
  SourceLocation,
  RuntimeErrorEvent,
  EvaluatedEvent
} from "paperclip";

import {throttle} from "lodash";

import * as parseColor from "color";
import * as fs from "fs";
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
  EngineEventNotification,
  NotificationType,
  LoadParams
} from "../common/notifications";
import { TextDocument, TextDocumentContentChangeEvent } from "vscode-languageserver-textdocument";
import { LanguageServices } from "./services";

const PERSIST_ENGINE_THROTTLE_MS = 100;

type KeyValue<TValue> = {
  [identifier: string]: TValue
}

export class VSCServiceBridge {
  private _newEngineContent: KeyValue<boolean> = {};
  private _newEnginePreviewContent: KeyValue<TextDocumentContentChangeEvent> = {};
  private _documents: KeyValue<TextDocument> = {};

  constructor(
    private _engine: Engine,
    private _service: LanguageServices,
    readonly connection: Connection
  ) {
    // this._textDocumentInfo = new TextDocumentInfoDictionary(engine, service);
    _engine.onEvent(this._onEngineEvent);
    connection.onRequest(
      ColorPresentationRequest.type,
      this._onColorPresentationRequest
    );
    connection.onRequest(
      DocumentColorRequest.type,
      this._onDocumentColorRequest
    );
    connection.onRequest(DefinitionRequest.type, this._onDefinitionRequest);
    connection.onRequest(DocumentLinkRequest.type, this._onDocumentLinkRequest);

    connection.onNotification(NotificationType.LOAD, ({ uri }: LoadParams) => {
      _engine.load(uri);
    });

    connection.onNotification(
      NotificationType.UNLOAD,
      ({ uri }: LoadParams) => {
        // TODO
        // engine.unload(uri);
      }
    );

    connection.onDidOpenTextDocument(({textDocument}) => {
      this._documents[textDocument.uri] = TextDocument.create(textDocument.uri, textDocument.languageId, textDocument.version, textDocument.text);
      this._engine.updateVirtualFileContent(textDocument.uri, textDocument.text);
    });
    connection.onDidCloseTextDocument(params => {
      delete this._documents[params.textDocument.uri];
    });

    connection.onDidChangeTextDocument(params => {
      this._updateTextContent(params.textDocument.uri, params.contentChanges);
    });
  }

  private _onDocumentLinkRequest = (params: DocumentLinkParams) => {
    const document = this._documents[params.textDocument.uri];
    const service = this._service.getService(document.uri);
    return (
      service &&
      (service
        .getLinks(document.uri)
        .map(({ uri, location: { start, end } }) => ({
          target: uri,
          range: {
            start: document.positionAt(start),
            end: document.positionAt(end)
          }
        })) as DocumentLink[])
    );
  };

  private _onDefinitionRequest = (params: DefinitionParams) => {
    const document = this._documents[params.textDocument.uri];
    const service = this._service.getService(document.uri);
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
                fs.readFileSync(sourceUri.replace("file://", ""), "utf8")
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

  private _onDocumentColorRequest = (params: DocumentColorParams) => {
    const document = this._documents[params.textDocument.uri];
    const service = this._service.getService(document.uri);
    return (
      service &&
      (service
        .getColors(document.uri)
        .map(({ color, location }) => {
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

    let document = this._documents[params.textDocument.uri];
    
    const {textEdit}  = presentation;
    const source = TextDocument.applyEdits(document, [textEdit]);

  
    // update virtual file content to show preview
    this._previewEngineContent(params.textDocument.uri, {text: source });

    return [presentation];
  };

  private _updateTextContent = (uri: string, events: TextDocumentContentChangeEvent[]) => {
    const newDocument = TextDocument.update(this._documents[uri], events, this._documents[uri].version + 1);
    this._documents[uri] = newDocument;
    this._newEngineContent[uri] = true;
    this._deferPersistEditTextContent();
  }

  private _previewEngineContent = (uri: string, event: TextDocumentContentChangeEvent) => {

    // TODO - include this change
    this._newEnginePreviewContent[uri] = event;
    this._deferPreviewEngineContent();
  }

  private _deferPersistEditTextContent = throttle(() => {
    const newEngineContent = this._newEngineContent;
    this._newEngineContent = {};
    for (const uri in newEngineContent) {
      this._engine.updateVirtualFileContent(uri, this._documents[uri].getText());
    }
  }, PERSIST_ENGINE_THROTTLE_MS);

  private _deferPreviewEngineContent = throttle(() => {
    const newEngineContent = this._newEnginePreviewContent;
    this._newEnginePreviewContent = {};
    for (const uri in newEngineContent) {
      const event = newEngineContent[uri];
      this._engine.updateVirtualFileContent(uri, event.text);
    }
  }, PERSIST_ENGINE_THROTTLE_MS);

  private _onEngineEvent = (event: EngineEvent) => {
    switch (event.kind) {
      case EngineEventKind.Error: {
        return this._onEngineErrorEvent(event);
      }
      case EngineEventKind.Evaluated: {
        return this._onEngineEvaluatedEvent(event);
      }
    }
  };

  private _onEngineEvaluatedEvent(event: EvaluatedEvent) {
    // reset error diagnostics
    this.connection.sendDiagnostics({
      uri: event.uri,
      diagnostics: []
    });

    this.connection.sendNotification(
      ...new EngineEventNotification(event).getArgs()
    );
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

  private _handleGraphError({
    uri,
    info: { message, location }
  }: GraphErrorEvent) {
    this._sendError(uri, message, location);
  }
  private _handleRuntimeError({ uri, message, location }: RuntimeErrorEvent) {
    this._sendError(uri, message, location);
  }

  private _sendError(uri: string, message: string, location: SourceLocation) {
    const textDocument = this._documents[uri];
    if (!textDocument) {
      return;
    }

    const diagnostics: Diagnostic[] = [
      createErrorDiagnostic(message, textDocument, location)
    ];

    this.connection.sendDiagnostics({
      uri: textDocument.uri,
      diagnostics
    });
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

const createErrorDiagnostic = (
  message: string,
  textDocument: TextDocument,
  location: SourceLocation
) => {
  return {
    severity: DiagnosticSeverity.Error,
    range: {
      start: textDocument.positionAt(location.start),
      end: textDocument.positionAt(location.end)
    },
    message: `${message}`,
    source: "ex"
  };
};
