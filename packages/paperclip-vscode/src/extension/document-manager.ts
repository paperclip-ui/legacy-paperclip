import { LiveWindowManager } from "./preview/live-window-manager";
import {
  Selection,
  TextEdit,
  TextEditor,
  Range,
  TextDocumentChangeEvent,
  ViewColumn,
  window,
  workspace,
  TextDocument,
  WorkspaceEdit,
  Uri,
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
import * as Automerge from "automerge";

enum OpenLivePreviewOptions {
  Yes = "Yes",
  Always = "Always",
  No = "No",
}

export class DocumentManager {
  private _showedOpenLivePreviewPrompt: boolean;
  private _editorClient: EditorClient;
  private _remoteDocs: Record<string, pce.CRDTTextDocument> = {};
  private _editing: Record<string, boolean> = {};

  constructor(
    private _windows: LiveWindowManager,
    private _client: PaperclipLanguageClient
  ) {
    console.log("DocumentManager::constructor");
    this._client.onRevealSourceRequest(this._onRevealSourceRequested);
    this._client.onDesignServerStarted(this._onDesignServerStarted);
    workspace.onDidChangeTextDocument(this._onTextDocumentChange);
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

    if (!isPaperclipResourceFile(uri) || this._remoteDocs[uri]) {
      return;
    }

    const source = (this._remoteDocs[uri] = await this._editorClient
      .getDocuments()
      .open(uri)
      .then((doc) => doc.getSource()));

    // pce.CRDTTextDocument.load(source.toData());

    // need to replace design server text completely since VS Code
    // may store unsaved changes
    source.setText(e.getText().split(""), 0, source.getText().length);

    source.onSync((patch) => {
      // don't bother syncing if the docs are identical
      if (source.getText() === e.getText()) {
        return;
      }

      // If not identical, then patch text editor doc to match CRDT doc since that is
      // the source of truth
      this._editing[e.uri.toString()] = true;
      applyTextEditsFromPatch(e, patch, async (edit) => {
        const wsEdit = new WorkspaceEdit();
        wsEdit.set(Uri.parse(uri), [edit]);
        await workspace.applyEdit(wsEdit);
      }).then(() => {
        this._editing[e.uri.toString()] = false;
      });
    });
  };

  private _onTextDocumentChange = async (event: TextDocumentChangeEvent) => {
    const uri = event.document.uri.toString();
    if (!isPaperclipResourceFile(uri)) {
      return;
    }
    const source = this._remoteDocs[uri];

    // This will happen on sync, so make sure we're not executing OTs on a doc
    // where the transforms originally came from
    if (event.document.getText() === source.getText() || this._editing[uri]) {
      return;
    }

    const edits: pce.TextEdit[] = event.contentChanges.map((change) => {
      return {
        chars: change.text.split(""),
        index: change.rangeOffset,
        deleteCount: change.rangeLength,
      };
    });

    source.applyEdits(edits);
    console.log("DocumentManager::_onDocumentChange");
  };

  private _onDesignServerStarted = (info: DesignServerStartedInfo) => {
    this._editorClient = new EditorClient(
      wsAdapter(new ws.WebSocket(`ws://localhost:${info.httpPort}/ws`))
    );

    workspace.onDidOpenTextDocument(this._onDidOpenTextDocument);
    workspace.textDocuments.forEach(this._onDidOpenTextDocument);
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
}

const applyTextEditsFromPatch = async (
  doc: TextDocument,
  patch: Automerge.Patch,
  next: (edit: TextEdit) => Promise<any>
) => {
  const syncEdits: TextEdit[] = [];

  const op = patch.diffs.props.text[Object.keys(patch.diffs.props.text)[0]];

  console.log(op);
  if (op.type === "text") {
    for (const edit of op.edits) {
      if (edit.action === "multi-insert") {
        await next(
          new TextEdit(
            new Range(doc.positionAt(edit.index), doc.positionAt(edit.index)),
            edit.values.join("")
          )
        );
      } else if (edit.action === "remove") {
        await next(
          new TextEdit(
            new Range(
              doc.positionAt(edit.index),
              doc.positionAt(edit.index + edit.count)
            ),
            ""
          )
        );
      } else {
        throw new Error(`Dunno how to handle`);
      }
    }
  }
  return syncEdits;
};
