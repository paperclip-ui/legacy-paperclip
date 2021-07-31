import { ExprSource } from "paperclip-utils";
import { WorkspaceFolder } from "vscode-languageserver";

export class RevealSourceRequested {
  static TYPE = "RevealSourceRequested";
  readonly type = RevealSourceRequested.TYPE;
  constructor(readonly source: ExprSource) {}
  toJSON() {
    return { type: this.type, source: this.source };
  }
}

export class Initialized {
  static TYPE = "PaperclipLanguageServerConnection/Initialized";
  readonly type = Initialized.TYPE;
  constructor(readonly workspaceFolders: WorkspaceFolder[]) {}
}

export class TextDocumentChanged {
  static TYPE = "PaperclipLanguageServerConnection/TextDocumentChanged";
  readonly type = TextDocumentChanged.TYPE;
  constructor(readonly uri: string, readonly content: string) {}
}

export class TextDocumentOpened {
  static TYPE = "PaperclipLanguageServerConnection/TextDocumentOpened";
  readonly type = TextDocumentChanged.TYPE;
  constructor(readonly uri: string, readonly content: string) {}
}

export class UpdatedTextDocuments {
  static TYPE = "PaperclipDesignServer/UpdatedTextDocuments";
  readonly type = TextDocumentChanged.TYPE;
  constructor() {}
}
