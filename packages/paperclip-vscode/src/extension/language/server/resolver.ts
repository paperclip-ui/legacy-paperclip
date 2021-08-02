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
  DocumentLinkParams
} from "vscode-languageserver";
import * as fs from "fs";
import { TextDocument } from "vscode-languageserver-textdocument";
import { PaperclipLanguageService } from "paperclip-language-service";
import { PCEngineInitialized } from "paperclip-designer/lib/server/services/pc-engine";
import { fixFileUrlCasing } from "../../utils";
import { DocumentManager } from "./connection";
import * as parseColor from "color";
import { Observable } from "paperclip-common";
import { stripFileProtocol } from "paperclip-utils";

export class LanguageRequestResolver {
  private _service: PaperclipLanguageService;
  private _listening: boolean;
  readonly events: Observable;

  constructor(
    private _connection: Connection,
    private _documents: DocumentManager
  ) {
    console.log("LNK;");
    this.events = new Observable();
  }

  handleEvent(event) {
    if (event.type === PCEngineInitialized.TYPE) {
      this._service = new PaperclipLanguageService(
        (event as PCEngineInitialized).engine
      );
      this._listen();
    }
  }

  private _listen() {
    if (this._listening) {
      return;
    }

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

  private _onColorPresentationRequest = (params: ColorPresentationParams) => {
    const presentation = getColorPresentation(params.color, params.range);
    const uri = fixFileUrlCasing(params.textDocument.uri);

    const { textEdit } = presentation;
    this._documents.appleDocumentEdits(uri, [textEdit]);

    // update virtual file content to show preview
    // this._previewEngineContent(params.textDocument.uri, { text: source });

    return [presentation];
  };

  private _onDocumentColorRequest = (params: DocumentColorParams) => {
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

  private _onCompletionResolveRequest = () => {
    return null;
  };

  private _onCompletionRequest = () => {
    return [];
  };

  private _onDefinitionRequest = (params: DefinitionParams) => {
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
  private _onDocumentLinkRequest = (params: DocumentLinkParams) => {
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
