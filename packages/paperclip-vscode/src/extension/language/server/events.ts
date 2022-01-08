import { ExprSource } from "@paperclip-ui/utils";
import { WorkspaceFolder } from "vscode-languageserver";
import { Project } from "@tandem-ui/workspace/lib/server";
import { ContentChange } from "@paperclip-ui/source-writer";

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

export class PCSourceEdited {
  static TYPE = "PaperclipDesignServer/PCSourceEdited";
  readonly type = PCSourceEdited.TYPE;
  constructor(readonly changes: Record<string, ContentChange[]>) {}
  toJSON() {
    return { type: this.type, changes: this.changes };
  }
}

export class TextDocumentPreview {
  static TYPE = "PaperclipLanguageServerConnection/TextDocumentPreview";
  readonly type = TextDocumentPreview.TYPE;
  constructor(readonly uri: string, readonly content: string) {}
}

export class TextDocumentOpened {
  static TYPE = "PaperclipLanguageServerConnection/TextDocumentOpened";
  readonly type = TextDocumentChanged.TYPE;
  constructor(readonly uri: string, readonly content: string) {}
}

export class ProjectStarted {
  static TYPE = "PaperclipDesignServer/ProjectStarted";
  readonly type = ProjectStarted.TYPE;
  constructor(readonly project: Project) {}
}

export class DesignServerStarted {
  static TYPE = "PaperclipDesignServer/DesignServerStarted";
  readonly type = DesignServerStarted.TYPE;
  constructor(
    readonly httpPort: number,
    readonly projectId: string,
    readonly project: Project
  ) {}
  toJSON() {
    return {
      httpPort: this.httpPort,
      type: this.type,
      projectId: this.projectId
    };
  }
}

export class UpdatedTextDocuments {
  static TYPE = "PaperclipDesignServer/UpdatedTextDocuments";
  readonly type = TextDocumentChanged.TYPE;
}

export class PCContentChanged {
  static TYPE = "PaperclipDesignServer/PCContentChanged";
  readonly type = PCContentChanged.TYPE;
  readonly url: string;
  readonly content: string;
}

export class DesignServerUpdating {
  static TYPE = "PaperclipDesignServer/DesignServerUpdating";
  readonly type = DesignServerUpdating.TYPE;
}

export class DesignServerUpdated {
  static TYPE = "PaperclipDesignServer/DesignServerUpdated";
  readonly type = DesignServerUpdated.TYPE;
}
