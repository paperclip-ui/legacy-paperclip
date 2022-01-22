import { TextEdit } from "vscode-languageserver";
import { Observable } from "@paperclip-ui/common";
import { TextDocument } from "vscode-languageserver-textdocument";

export class DocumentManager {
  private _documents: Record<string, TextDocument>;
  readonly events: Observable;
  constructor() {
    this._documents = {};
    this.events = new Observable();
  }
  getDocument(uri: string) {
    return this._documents[uri];
  }
  updateDocument(uri: string, document: TextDocument) {
    const exists = this._documents[uri] != null;

    this._documents[uri] = document;

    // TODO - sync with client host

    // if (exists) {
    //   this.events.dispatch(new TextDocumentChanged(uri, document.getText()));
    // } else {
    //   this.events.dispatch(new TextDocumentOpened(uri, document.getText()));
    // }
  }
  appleDocumentEdits(uri: string, edits: TextEdit[]) {
    const text = TextDocument.applyEdits(this._documents[uri], edits);
    // this.events.dispatch(new TextDocumentChanged(uri, text));
  }
  removeDocument(uri: string) {
    delete this._documents[uri];
  }
}
