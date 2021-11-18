import {
  ColorPresentationRequest,
  CompletionRequest,
  CompletionResolveRequest,
  DocumentLink,
  Connection,
  DefinitionRequest,
  DocumentColorParams,
  DocumentColorRequest,
  TextEdit,
  Range,
  Color,
  DefinitionLink,
  ColorPresentation,
  DocumentLinkRequest,
  ColorPresentationParams,
  DefinitionParams,
  DocumentLinkParams,
  CompletionParams
} from "vscode-languageserver";
import * as fs from "fs";
import { TextDocument } from "vscode-languageserver-textdocument";
import { PaperclipLanguageService } from "paperclip-language-service";
import { PCEngineInitialized } from "paperclip-designer/lib/server/services/pc-engine";
import { fixFileUrlCasing } from "../../utils";
import { DocumentManager } from "./connection";
import * as parseColor from "color";
import { BaseEvent, Observable } from "paperclip-common";
import { stripFileProtocol } from "paperclip-utils";
import { DesignServerUpdated, DesignServerUpdating } from "./events";
import { SourceLinted } from "paperclip-language-service";
import * as url from "url";

export class LanguageRequestResolver {
  private _service: PaperclipLanguageService;
  private _listening: boolean;
  private _engineReady: Promise<any>;
  private _resolveEngineReady: (value?: any) => void;
  readonly events: Observable;

  constructor(
    private _connection: Connection,
    private _documents: DocumentManager
  ) {
    this.events = new Observable();
  }

  handleEvent(event) {
    if (event.type === PCEngineInitialized.TYPE) {
      this._service = new PaperclipLanguageService(
        (event as PCEngineInitialized).engine
      );
      this._listen();
    } else if (event.type === DesignServerUpdating.TYPE) {
      this._engineReady =
        this._engineReady ||
        new Promise(resolve => {
          this._resolveEngineReady = resolve;
        });
    } else if (event.type === DesignServerUpdated.TYPE) {
      this._resolveEngineReady();
      this._engineReady = undefined;
    }
  }

  private _listen() {
    if (this._listening) {
      return;
    }

    this._service.events.observe({
      handleEvent: this._onServiceEvent
    });

    this._listening = true;

    this._connection.onRequest(
      ColorPresentationRequest.type,
      this._onColorPresentationRequest
    );
    this._connection.onRequest(
      DocumentColorRequest.type,
      this._onDocumentColorRequest
    );
    this._connection.onRequest(
      CompletionRequest.type,
      this._onCompletionRequest
    );
    this._connection.onRequest(
      CompletionResolveRequest.type,
      this._onCompletionResolveRequest
    );

    this._connection.onRequest(
      DefinitionRequest.type,
      this._onDefinitionRequest
    );
    this._connection.onRequest(
      DocumentLinkRequest.type,
      this._onDocumentLinkRequest
    );
  }

  private _onServiceEvent = (event: BaseEvent) => {
    if (event.type === SourceLinted.TYPE) {
      const { uri, content, diagnostics } = event as SourceLinted;
      let textDocument = this._documents.getDocument(uri);
      textDocument = TextDocument.create(uri, "paperclip", 0, content);
      this._connection.sendDiagnostics({
        uri: uri,
        diagnostics: diagnostics.map(diagnostic => {
          return {
            ...diagnostic,
            range: {
              start: textDocument.positionAt(diagnostic.location.start),
              end: textDocument.positionAt(diagnostic.location.end)
            }
          };
        })
      });
    }
  };

  private _onColorPresentationRequest = async (
    params: ColorPresentationParams
  ) => {
    await this._engineReady;
    const presentation = getColorPresentation(params.color, params.range);
    const uri = fixFileUrlCasing(params.textDocument.uri);

    const { textEdit } = presentation;
    this._documents.appleDocumentEdits(uri, [textEdit]);

    return [presentation];
  };

  private _onDocumentColorRequest = async (params: DocumentColorParams) => {
    await this._engineReady;
    const uri = fixFileUrlCasing(params.textDocument.uri);
    const document = this._documents.getDocument(uri);
    return this._service.getDocumentColors(uri).map(({ value, location }) => {
      return {
        range: {
          start: document.positionAt(location.start),
          end: document.positionAt(location.end)
        },
        color: value
      };
    });
  };

  private _onCompletionResolveRequest = async item => {
    await this._engineReady;
    return item;
  };

  private _onCompletionRequest = async (params: CompletionParams) => {
    await this._engineReady;

    const uri = fixFileUrlCasing(params.textDocument.uri);
    const document = this._documents.getDocument(uri);
    const items = this._service.getAutoCompletionSuggestions(
      uri,
      document.offsetAt(params.position)
    );

    return items;
  };

  private _onDefinitionRequest = async (params: DefinitionParams) => {
    await this._engineReady;
    const uri = fixFileUrlCasing(params.textDocument.uri);
    const document = this._documents.getDocument(uri);

    const info = this._service
      .getDefinitions(uri)
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
            this._documents.getDocument(sourceUri) ||
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
      ) as DefinitionLink[];
    return info;
  };
  private _onDocumentLinkRequest = async (params: DocumentLinkParams) => {
    await this._engineReady;
    const uri = fixFileUrlCasing(params.textDocument.uri);
    const document = this._documents.getDocument(uri);
    return this._service
      .getLinks(uri)
      .map(({ uri, location: { start, end } }) => ({
        target: uri,
        range: {
          start: document.positionAt(start),
          end: document.positionAt(end)
        }
      })) as DocumentLink[];
  };
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