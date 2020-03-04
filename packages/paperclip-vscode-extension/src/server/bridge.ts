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
  TextDocument,
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
import { LanguageServices } from "./services";

const PERSIST_ENGINE_THROTTLE_MS = 100;

export class VSCServiceBridge {
  private _newEngineContent: {
    [identifier: string]: string
  } = {};

  constructor(
    private _engine: Engine,
    private _service: LanguageServices,
    readonly connection: Connection,
    readonly documents: TextDocuments<TextDocument>
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

    documents.onDidChangeContent(event => {
      const doc: TextDocument = event.document;
      _engine.updateVirtualFileContent(doc.uri, doc.getText());
    });
  }

  private _onDocumentLinkRequest = (params: DocumentLinkParams) => {
    const document = this.documents.get(params.textDocument.uri);
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
    const document = this.documents.get(params.textDocument.uri);
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
              this.documents.get(sourceUri) ||
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
    const document = this.documents.get(params.textDocument.uri);
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

    const document = this.documents.get(params.textDocument.uri);
    let source = document.getText();
    
    const {textEdit:{newText, range}}  = presentation;
    source = source.substr(0, document.offsetAt(range.start)) + newText + source.substr(document.offsetAt(range.end));
  
    // update virtual file content to show preview
    this._updateEngineContent(params.textDocument.uri, source);

    return [presentation];
  };

  private _updateEngineContent = (uri: string, content: string) => {
    this._newEngineContent[uri] = content;
    this._deferPersistEngineContent();
  }

  private _deferPersistEngineContent = throttle(() => {
    const newEngineContent = this._newEngineContent;
    this._newEngineContent = {};
    for (const uri in newEngineContent) {
      this._engine.updateVirtualFileContent(uri, newEngineContent[uri]);
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
    const textDocument = this.documents.get(uri);
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
