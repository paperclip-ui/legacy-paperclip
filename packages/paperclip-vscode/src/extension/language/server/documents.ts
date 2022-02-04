import { TextEdit } from "vscode-languageserver";
import { Observable } from "@paperclip-ui/common";
import { TextDocument } from "vscode-languageserver-textdocument";
import { PaperclipDesignServer } from "./design-server";

export class DocumentManager {
  private _documents: Record<string, TextDocument>;
  readonly events: Observable;
  constructor(private _designServer: PaperclipDesignServer) {
    this._documents = {};
    this.events = new Observable();
  }
  getDocument(uri: string) {
    return this._documents[uri];
  }
  updateDocument(uri: string, document: TextDocument) {
    const exists = this._documents[uri] != null;
    this._documents[uri] = document;
  }
  appleDocumentEdits(uri: string, edits: TextEdit[]) {
    const text = TextDocument.applyEdits(this._documents[uri], edits);
    this._designServer
      .getCurrentProject()
      .getEngine()
      .updateVirtualFileContent(uri, text);
  }
  removeDocument(uri: string) {
    delete this._documents[uri];
  }
}
