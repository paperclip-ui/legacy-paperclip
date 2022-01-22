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
  CompletionParams,
} from "vscode-languageserver";
import * as fs from "fs";
import { TextDocument } from "vscode-languageserver-textdocument";
import { PaperclipLanguageService } from "@paperclip-ui/language-service";
import { fixFileUrlCasing } from "../../utils";
import { DocumentManager } from "./documents";
import * as parseColor from "color";
import { Observable } from "@paperclip-ui/common";
import { stripFileProtocol } from "@paperclip-ui/utils";
import { PaperclipDesignServer } from "./design-server";
import { DesignServerStartedInfo } from "../../channels";
import { LintInfo } from "@paperclip-ui/language-service/src/error-service";

export class LanguageRequestResolver {
  private _service: PaperclipLanguageService;
  private _listening: boolean;
  readonly events: Observable;

  constructor(
    private _designServer: PaperclipDesignServer,
    private _connection: Connection,
    private _documents: DocumentManager
  ) {
    this._designServer.onStarted(this._onDesignServerStarted);
    this.events = new Observable();
    this._listen();
  }

  private _onDesignServerStarted = (options: DesignServerStartedInfo) => {
    this._service = new PaperclipLanguageService(
      this._designServer.getEngine()
    );
    this._service.onLinted(this._onLinted);
  };

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

  private _onLinted = (info: LintInfo) => {
    const { uri, content, diagnostics } = info;
    let textDocument = this._documents.getDocument(uri);
    textDocument = TextDocument.create(uri, "paperclip", 0, content);
    this._connection.sendDiagnostics({
      uri: uri,
      diagnostics: diagnostics.map((diagnostic) => {
        return {
          ...diagnostic,
          range: {
            start: textDocument.positionAt(diagnostic.range.start.pos),
            end: textDocument.positionAt(diagnostic.range.end.pos),
          },
        };
      }),
    });
  };

  private _onColorPresentationRequest = async (
    params: ColorPresentationParams
  ) => {
    const presentation = getColorPresentation(params.color, params.range);
    const uri = fixFileUrlCasing(params.textDocument.uri);

    const { textEdit } = presentation;
    this._documents.appleDocumentEdits(uri, [textEdit]);

    return [presentation];
  };

  private _onDocumentColorRequest = async (params: DocumentColorParams) => {
    const uri = fixFileUrlCasing(params.textDocument.uri);
    const document = this._documents.getDocument(uri);
    return this._service.getDocumentColors(uri).map(({ value, start, end }) => {
      return {
        range: {
          start: document.positionAt(start),
          end: document.positionAt(end),
        },
        color: value,
      };
    });
  };

  private _onCompletionResolveRequest = async (item) => {
    return item;
  };

  private _onCompletionRequest = async (params: CompletionParams) => {
    const uri = fixFileUrlCasing(params.textDocument.uri);
    const document = this._documents.getDocument(uri);
    const items = this._service.getAutoCompletionSuggestions(
      uri,
      document.offsetAt(params.position)
    );

    return items;
  };

  private _onDefinitionRequest = async (params: DefinitionParams) => {
    const uri = fixFileUrlCasing(params.textDocument.uri);
    const document = this._documents.getDocument(uri);

    const info = this._service
      .getDefinitions(uri)
      .filter((info) => {
        const offset = document.offsetAt(params.position);
        return (
          offset >= info.instanceRange.start.pos &&
          offset <= info.instanceRange.end.pos
        );
      })
      .map(
        ({
          sourceUri,
          instanceRange: {
            start: { pos: instanceStart },
            end: { pos: instanceEnd },
          },
          sourceRange: {
            start: { pos: sourceStart },
            end: { pos: sourceEnd },
          },
          sourceDefinitionRange: {
            start: { pos: definitionStart },
            end: { pos: definitionEnd },
          },
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
              end: sourceDocument.positionAt(definitionEnd),
            },
            targetSelectionRange: {
              start: sourceDocument.positionAt(sourceStart),
              end: sourceDocument.positionAt(sourceEnd),
            },
            originSelectionRange: {
              start: document.positionAt(instanceStart),
              end: document.positionAt(instanceEnd),
            },
          };
        }
      ) as DefinitionLink[];
    return info;
  };
  private _onDocumentLinkRequest = async (params: DocumentLinkParams) => {
    const uri = fixFileUrlCasing(params.textDocument.uri);
    const document = this._documents.getDocument(uri);
    return this._service
      .getLinks(uri)
      .map(({ uri, range: { start, end } }) => ({
        target: uri,
        range: {
          start: document.positionAt(start.pos),
          end: document.positionAt(end.pos),
        },
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
