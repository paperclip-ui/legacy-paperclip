import {
  ColorPresentationRequest,
  CompletionRequest,
  CompletionResolveRequest,
  Connection,
  DefinitionRequest,
  DocumentColorParams,
  DocumentColorRequest,
  DocumentLinkRequest
} from "vscode-languageserver";
import { PaperclipLanguageService } from "paperclip-language-service";
import { PCEngineInitialized } from "paperclip-designer/lib/server/services/pc-engine";
import { fixFileUrlCasing } from "../../utils";
import { DocumentManager } from "./connection";

export class LanguageRequestResolver {
  private _service: PaperclipLanguageService;
  private _listening: boolean;
  constructor(
    private _connection: Connection,
    private _documents: DocumentManager
  ) {}

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

  private _onColorPresentationRequest() {
    return [];
  }

  private _onDocumentColorRequest(params: DocumentColorParams) {
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
  }

  private _onCompletionResolveRequest() {
    return null;
  }

  private _onCompletionRequest() {
    return [];
  }

  private _onDefinitionRequest() {
    return [];
  }
  private _onDocumentLinkRequest() {
    return [];
  }
}
