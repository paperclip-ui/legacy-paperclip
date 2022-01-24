import { LiveWindowManager } from "./preview/live-window-manager";
import {
  Selection,
  TextEdit,
  TextEditor,
  TextDocumentChangeEvent,
  ViewColumn,
  window,
  workspace,
  TextDocument,
} from "vscode";
import { fixFileUrlCasing } from "./utils";
import {
  ExprSource,
  isPaperclipResourceFile,
  stripFileProtocol,
} from "@paperclip-ui/utils";
import { PaperclipLanguageClient } from "./language";
import { DesignServerStartedInfo } from "./channels";
import * as pce from "@paperclip-ui/editor-engine/lib/core/crdt-document";
import { EditorClient } from "@paperclip-ui/editor-engine/lib/client/client";
import { wsAdapter } from "@paperclip-ui/common";
import * as ws from "ws";

enum OpenLivePreviewOptions {
  Yes = "Yes",
  Always = "Always",
  No = "No",
}

export class DocumentManager {
  private _showedOpenLivePreviewPrompt: boolean;
  private _editorClient: EditorClient;

  constructor(
    private _windows: LiveWindowManager,
    private _client: PaperclipLanguageClient
  ) {
    console.log("DocumentManager::constructor");
    this._client.onRevealSourceRequest(this._onRevealSourceRequested);
    this._client.onDesignServerStarted(this._onDesignServerStarted);
    workspace.onDidChangeTextDocument(this._onTextDocumentChange);
    workspace.onDidOpenTextDocument(this._onDidOpenTextDocument);
    workspace.textDocuments.forEach(this._onDidOpenTextDocument);
  }

  activate() {
    window.onDidChangeActiveTextEditor(this._onActiveTextEditorChange);
    if (window.activeTextEditor) {
      this._onActiveTextEditorChange(window.activeTextEditor);
    }
  }

  private _onActiveTextEditorChange = (editor: TextEditor) => {
    if (!editor) {
      return;
    }
    const uri = fixFileUrlCasing(String(editor.document.uri));

    if (
      !this._windows.setStickyWindowUri(uri) &&
      this._windows.getLength() === 0
    ) {
      this._askToDisplayLivePreview(uri);
    }
  };

  private _askToDisplayLivePreview = async (uri: string) => {
    if (this._showedOpenLivePreviewPrompt) {
      return false;
    }

    this._showedOpenLivePreviewPrompt = true;

    const option = await window.showInformationMessage(
      `Would you like to open a live preview? Command: "Paperclip: Open Live Preview" is also available. `,
      OpenLivePreviewOptions.Always,
      OpenLivePreviewOptions.Yes,
      OpenLivePreviewOptions.No
    );

    if (option === OpenLivePreviewOptions.Yes) {
      this._windows.open(uri, false);
    } else if (option === OpenLivePreviewOptions.Always) {
      this._windows.open(uri, true);
    }
  };

  private _onDidOpenTextDocument = async (e: TextDocument) => {
    const uri = e.uri.toString();

    if (!isPaperclipResourceFile(e.uri.toString())) {
      return;
    }

    const source = await this._editorClient
      .getDocuments()
      .open(uri)
      .then((doc) => doc.getSource());

    console.log(e.uri.toString());
  };

  private _onTextDocumentChange = async (event: TextDocumentChangeEvent) => {
    const uri = event.document.uri.toString();
    if (isPaperclipResourceFile(uri)) {
      const doc = await this._editorClient.getDocuments().open(uri);
      const source = await doc.getSource();

      const edits: pce.TextEdit[] = event.contentChanges.map((change) => {
        return {
          chars: change.text.split(""),
          index: change.rangeOffset,
          deleteCount: change.rangeLength,
        };
      });

      source.applyEdits(edits);
      console.log("DocumentManager::_onDocumentChange");
    }
  };

  private _onDesignServerStarted = (info: DesignServerStartedInfo) => {
    this._editorClient = new EditorClient(
      wsAdapter(new ws.WebSocket(`ws://localhost:${info.httpPort}/ws`))
    );

    this._editorClient
      .getDocuments()
      .onDocumentSourceChanged(this._onDesignServerDocumentChange);
  };

  private _onDesignServerDocumentChange = async ({ uri, changes }) => {
    // const doc = await this._editorClient.getDocuments().open(uri);
    // const source = await doc.getSource();
    // const vscodeDoc = await this._openDoc(uri);
    // const changes = diff.parsePatch(
    //   diff.createPatch("a.pc", vscodeDoc.getText(), source.getText())
    // );
  };

  private _onRevealSourceRequested = async ({ textSource }: ExprSource) => {
    console.log("On Reveal Source request");
    // shouldn't happen, but might if text isn't loaded
    if (!textSource) {
      return;
    }

    const textDocument = await this._openDoc(textSource.uri);

    const editor: TextEditor =
      window.visibleTextEditors.find(
        (editor) =>
          editor.document &&
          fixFileUrlCasing(String(editor.document.uri)) ===
            fixFileUrlCasing(textSource.uri)
      ) || (await window.showTextDocument(textDocument, ViewColumn.One));
    editor.selection = new Selection(
      textDocument.positionAt(textSource.range.start.pos),
      textDocument.positionAt(textSource.range.end.pos)
    );
    editor.revealRange(editor.selection);
  };

  private _openDoc = async (uri: string) => {
    return (
      workspace.textDocuments.find((doc) => String(doc.uri) === uri) ||
      (await workspace.openTextDocument(stripFileProtocol(uri)))
    );
  };

  // private _onPCSourceEdited = async ({
  //   changes: changesByUri
  // }: PCSourceEdited) => {
  //   for (const uri in changesByUri) {
  //     const changes = changesByUri[uri];
  //     const filePath = URL.fileURLToPath(uri);
  //     const doc = await workspace.openTextDocument(filePath);
  //     const tedits = changes.map(change => {
  //       return new TextEdit(
  //         new Range(doc.positionAt(change.start), doc.positionAt(change.end)),
  //         change.value
  //       );
  //     });
  //     const wsEdit = new WorkspaceEdit();
  //     wsEdit.set(Uri.parse(uri), tedits);
  //     await workspace.applyEdit(wsEdit);
  //   }
  // };
}
