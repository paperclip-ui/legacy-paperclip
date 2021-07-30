import { LiveWindowManager } from "./preview/live-window-manager";
import { Selection, TextEditor, ViewColumn, window, workspace } from "vscode";
import { fixFileUrlCasing } from "./utils";
import { eventHandlers, Observer } from "paperclip-common";
import { RevealSourceRequested } from "./language/server/events";
import { stripFileProtocol } from "paperclip-utils";

enum OpenLivePreviewOptions {
  Yes = "Yes",
  Always = "Always",
  No = "No"
}

export class DocumentManager implements Observer {
  private _showedOpenLivePreviewPrompt: boolean;

  constructor(private _windows: LiveWindowManager) {}

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

  private _onRevealSourceRequested = async ({
    source: { textSource }
  }: RevealSourceRequested) => {
    // shouldn't happen, but might if text isn't loaded
    if (!textSource) {
      return;
    }

    // TODO - no globals here
    const textDocument = await this._openDoc(textSource.uri);

    const editor: TextEditor =
      window.visibleTextEditors.find(
        editor =>
          editor.document &&
          fixFileUrlCasing(String(editor.document.uri)) ===
            fixFileUrlCasing(textSource.uri)
      ) || (await window.showTextDocument(textDocument, ViewColumn.One));
    editor.selection = new Selection(
      textDocument.positionAt(textSource.location.start),
      textDocument.positionAt(textSource.location.end)
    );
    editor.revealRange(editor.selection);
  };

  private _openDoc = async (uri: string) => {
    return (
      workspace.textDocuments.find(doc => String(doc.uri) === uri) ||
      (await workspace.openTextDocument(stripFileProtocol(uri)))
    );
  };

  handleEvent = eventHandlers({
    [RevealSourceRequested.TYPE]: this._onRevealSourceRequested
  });
}
