import { stripFileProtocol } from "paperclip-utils";
import * as fs from "fs";
import * as qs from "querystring";
import * as vscode from "vscode";
import * as url from "url";
import {
  Uri,
  window,
  commands,
  TextEditor,
  Range,
  WebviewPanel,
  ExtensionContext,
  ViewColumn,
  workspace,
  Selection,
  env,
  TextDocumentChangeEvent,
  TextEdit,
  WorkspaceEdit
} from "vscode";
import { isPaperclipFile } from "./utils";
import * as path from "path";
import { EventEmitter } from "events";
import { LanguageClient } from "vscode-languageclient";
import {
  $$ACTION_NOTIFICATION,
  Action,
  ActionType,
  Goosefraba,
  goosefraba
} from "../common/actions";

const VIEW_TYPE = "paperclip-preview";

import * as ve from "paperclip-designer";
import { LocationChanged } from "paperclip-designer";
import { fixFileUrlCasing } from "../utils";

enum OpenLivePreviewOptions {
  Yes = "Yes",
  Always = "Always",
  No = "No"
}

type PreviewLocation = {
  pathname: string;
  query: Partial<{
    canvasFile: string;
    embedded: boolean;
    id: string;
    expanded: boolean;
    frame: number;
  }>;
};

type LivePreviewState = {
  location: PreviewLocation;
  sticky: boolean;
};

export const activate = (
  client: LanguageClient,
  context: ExtensionContext
): void => {
  const _previews: LivePreview[] = [];

  let _showedOpenLivePreviewPrompt = false;
  let _devServerPort: number;

  const dispatchClient = (action: ve.ExternalAction | Goosefraba) => {
    client.sendNotification($$ACTION_NOTIFICATION, action);
  };

  const showTextDocument = async (uri: string) => {
    const sourceEditor = window.visibleTextEditors.find(
      editor =>
        fixFileUrlCasing(String(editor.document.uri)) === fixFileUrlCasing(uri)
    );

    if (sourceEditor) {
      return await window.showTextDocument(
        sourceEditor.document,
        sourceEditor.viewColumn,
        false
      );
    } else {
      const doc = await workspace.openTextDocument(Uri.parse(uri));
      return await window.showTextDocument(doc, ViewColumn.One, false);
    }
  };

  const execCommand = async (targetUri: string, command: string) => {
    await showTextDocument(targetUri);
    await commands.executeCommand(command);
  };

  const getStickyWindow = () => {
    return _previews.find(preview => preview.sticky);
  };

  /**
   * This really just provides a lower barrier to entry -- prompts once with
   * info about the command, then disappear
   */

  const askToDisplayLivePreview = async (editor: TextEditor) => {
    if (_showedOpenLivePreviewPrompt) {
      return false;
    }

    _showedOpenLivePreviewPrompt = true;

    const option = await window.showInformationMessage(
      `Would you like to open a live preview? Command: "Paperclip: Open Live Preview" is also available. `,
      OpenLivePreviewOptions.Always,
      OpenLivePreviewOptions.Yes,
      OpenLivePreviewOptions.No
    );

    if (option === OpenLivePreviewOptions.Yes) {
      openLivePreview(editor, false);
    } else if (option === OpenLivePreviewOptions.Always) {
      openLivePreview(editor, true);
    }

    return true;
  };

  const onTextEditorChange = async (editor: TextEditor) => {
    if (!editor) {
      return;
    }
    const uri = fixFileUrlCasing(String(editor.document.uri));
    const stickyWindow = getStickyWindow();
    if (isPaperclipFile(uri)) {
      if (stickyWindow) {
        stickyWindow.setTargetUri(uri);
      } else if (!_previews.length) {
        askToDisplayLivePreview(editor);
      }
    }
  };

  setTimeout(() => {
    window.onDidChangeActiveTextEditor(onTextEditorChange);
    if (window.activeTextEditor) {
      onTextEditorChange(window.activeTextEditor);
    }
  }, 500);

  const handlePreviewCommand = (sticky: boolean) => () => {
    if (window.activeTextEditor) {
      if (isPaperclipFile(String(window.activeTextEditor.document.uri))) {
        openLivePreview(window.activeTextEditor, sticky);
      } else {
        window.showErrorMessage(
          `Only Paperclip (.pc) are supported in Live Preview`
        );
      }
    }
  };

  commands.registerCommand(
    "paperclip.openPreview",
    handlePreviewCommand(false)
  );
  commands.registerCommand(
    "paperclip.openStickyPreview",
    handlePreviewCommand(true)
  );

  commands.registerCommand("paperclip.giveFeedback", () => {
    env.openExternal(Uri.parse("https://github.com/crcn/paperclip/issues"));
  });

  const enhanceCalm = () => {
    setTimeout(() => {
      dispatchClient(goosefraba(null));
    }, 100);
  };

  client.onNotification($$ACTION_NOTIFICATION, (action: Action) => {
    switch (action.type) {
      case ActionType.DEV_SERVER_INITIALIZED: {
        _devServerPort = action.payload.port;
        _previews.forEach(preview => {
          preview.setDevServerPort(_devServerPort);
        });
        break;
      }
      case ActionType.ENHANCE_CALM_REQUESTED: {
        return enhanceCalm();
      }
      case ActionType.DEV_SERVER_CHANGED: {
        if (action.payload.type === ve.ServerActionType.CRASHED) {
          window.showWarningMessage(
            "Paperclip crashed - you'll need to reload this window."
          );
        } else if (
          action.payload.type ===
          ve.ServerActionType.REVEAL_EXPRESSION_SOURCE_REQUESTED
        ) {
          handleRevealExpressionSourceRequested(action.payload);
        } else if (
          action.payload.type === ve.ServerActionType.PC_SOURCE_EDITED
        ) {
          handlePCSourceEdited(action.payload);
        } else if (
          action.payload.type === ve.ServerActionType.INSTANCE_CHANGED
        ) {
          // oh boy 🙈
          switch (action.payload.payload.action.type) {
            case ve.ActionType.ERROR_BANNER_CLICKED: {
              handleErrorBannerClicked(action.payload.payload.action);
              break;
            }
            case ve.ActionType.GLOBAL_Z_KEY_DOWN: {
              handleUndo(action.payload);
              break;
            }
            case ve.ActionType.GLOBAL_Y_KEY_DOWN: {
              handleRedo(action.payload);
              break;
            }
            case ve.ActionType.GLOBAL_SAVE_KEY_DOWN: {
              handleSave(action.payload);
              break;
            }
            case ve.ActionType.PASTED: {
              handlePasted(action.payload, action.payload.payload.action);
              break;
            }
            case ve.ActionType.LOCATION_CHANGED: {
              handlePreviewLocationChanged(action.payload.payload.action);
              break;
            }
          }
        }
        return;
      }
    }
  });

  const handleUndo = ({ payload: { targetPCFileUri } }: ve.InstanceChanged) => {
    execCommand(targetPCFileUri, "undo");
  };
  const handleRedo = ({ payload: { targetPCFileUri } }: ve.InstanceChanged) => {
    execCommand(targetPCFileUri, "redo");
  };
  const handleSave = async ({
    payload: { targetPCFileUri }
  }: ve.InstanceChanged) => {
    (await showTextDocument(targetPCFileUri)).document.save();
  };
  const handlePasted = async (
    { payload: { targetPCFileUri } }: ve.InstanceChanged,
    { payload: { clipboardData } }: ve.Pasted
  ) => {
    const editor = await showTextDocument(targetPCFileUri);

    const start = editor.document.positionAt(editor.document.getText().length);
    const plainText = clipboardData.find(data => data.type === "text/plain");

    if (!plainText) {
      return;
    }

    const tedit = new TextEdit(new Range(start, start), plainText.content);

    const wsEdit = new WorkspaceEdit();
    wsEdit.set(Uri.parse(targetPCFileUri), [tedit]);
    await workspace.applyEdit(wsEdit);
  };

  const handlePreviewLocationChanged = (action: ve.LocationChanged) => {
    _previews.forEach(preview => {
      if (preview.location.query.id === action.payload.query.id) {
        preview.handlePreviewLocationChanged(action);
      }
    });
  };

  const openDoc = async (uri: string) => {
    return (
      workspace.textDocuments.find(doc => String(doc.uri) === uri) ||
      (await workspace.openTextDocument(stripFileProtocol(uri)))
    );
  };

  const handleRevealExpressionSourceRequested = async ({
    payload: { textSource }
  }: ve.RevealExpressionSourceRequested) => {
    // shouldn't happen, but might if text isn't loaded
    if (!textSource) {
      return;
    }

    // TODO - no globals here
    const textDocument = await openDoc(textSource.uri);

    const editor =
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

  const handleErrorBannerClicked = async ({
    payload: error
  }: ve.ErrorBannerClicked) => {
    const doc = await openDoc(error.uri);
    await window.showTextDocument(doc, ViewColumn.One);
  };
};

const handlePCSourceEdited = async ({
  payload: changesByUri
}: ve.PCSourceEdited) => {
  for (const uri in changesByUri) {
    const changes = changesByUri[uri];
    const filePath = url.fileURLToPath(uri);
    const doc = await vscode.workspace.openTextDocument(filePath);
    const tedits = changes.map(change => {
      return new vscode.TextEdit(
        new vscode.Range(
          doc.positionAt(change.start),
          doc.positionAt(change.end)
        ),
        change.value
      );
    });
    const wsEdit = new vscode.WorkspaceEdit();
    wsEdit.set(vscode.Uri.parse(uri), tedits);
    await vscode.workspace.applyEdit(wsEdit);
  }
};
