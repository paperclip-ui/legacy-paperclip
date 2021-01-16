import {
  EngineDelegateEvent,
  EngineDelegateEventKind,
  EngineErrorEvent,
  stripFileProtocol,
} from "paperclip-utils";
import { PCMutation } from "paperclip-source-writer";
import * as fs from "fs";
import * as qs from "querystring";
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
  TextDocument,
  TextDocumentChangeEvent,
  TextEdit,
  WorkspaceEdit,
} from "vscode";
import { isPaperclipFile } from "./utils";
import * as path from "path";
import { EventEmitter } from "events";
import { LanguageClient } from "vscode-languageclient";
import { $$ACTION_NOTIFICATION, Action, ActionType } from "../common/actions";

const VIEW_TYPE = "paperclip-preview";

import * as ve from "paperclip-visual-editor";
import { LocationChanged } from "paperclip-visual-editor";

enum OpenLivePreviewOptions {
  Yes = "Yes",
  Always = "Always",
  No = "No",
}

type PreviewLocation = {
  pathname: string;
  query: Partial<{
    currentFileUri: string;
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
  context: ExtensionContext,
  onPCMutations: (mutation: PCMutation[]) => void
): void => {
  const _previews: LivePreview[] = [];

  let _showedOpenLivePreviewPrompt = false;
  let _devServerPort: number;

  const openLivePreview = async (editor: TextEditor, sticky: boolean) => {
    const paperclipUri = String(editor.document.uri);

    // NOTE - don't get in the way of opening the live preview since
    // there's really no way to tell whether an existing tab is open which will
    // happen when the app loads with existing live preview tabs.

    const panel = window.createWebviewPanel(
      VIEW_TYPE,
      sticky ? "sticky preview" : `⚡️ ${path.basename(paperclipUri)}`,
      ViewColumn.Beside,
      {
        enableScripts: true,
      }
    );

    registerLivePreview(
      new LivePreview(
        _devServerPort,
        panel,
        {
          query: {
            currentFileUri: paperclipUri,
          },
        },
        sticky
      )
    );
  };
  const dispatchClient = (action: ve.ExternalAction) => {
    client.sendNotification($$ACTION_NOTIFICATION, action);
  };

  const showTextDocument = async (uri: string) => {
    const sourceEditor = window.visibleTextEditors.find(
      (editor) => String(editor.document.uri) === uri
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

  const registerLivePreview = (preview: LivePreview) => {
    _previews.push(preview);
    const listeners = [
      preview.onDidDispose(() => {
        const index = _previews.indexOf(preview);
        if (index !== -1) {
          _previews.splice(index, 1);
          for (const listener of listeners) {
            listener();
          }
        }
      }),
    ];
  };

  const getStickyWindow = () => {
    return _previews.find((preview) => preview.sticky);
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
    const uri = String(editor.document.uri);
    const stickyWindow = getStickyWindow();
    if (isPaperclipFile(uri)) {
      if (stickyWindow) {
        stickyWindow.setTargetUri(uri);
      } else if (!_previews.length) {
        askToDisplayLivePreview(editor);
      }
    }
  };

  const onTextDocumentChange = async ({
    document,
  }: TextDocumentChangeEvent) => {
    dispatchClient(
      ve.contentChanged({
        fileUri: document.uri.toString(),
        content: document.getText(),
      })
    );
  };

  window.registerWebviewPanelSerializer(VIEW_TYPE, {
    async deserializeWebviewPanel(
      panel: WebviewPanel,
      { location, sticky }: LivePreviewState
    ) {
      registerLivePreview(
        new LivePreview(_devServerPort, panel, location, sticky)
      );
    },
  });

  const onDidOpenTextDocument = (document: TextDocument) => {
    dispatchClient(
      ve.contentChanged({
        fileUri: document.uri.toString(),
        content: document.getText(),
      })
    );
  };

  setTimeout(() => {
    window.onDidChangeActiveTextEditor(onTextEditorChange);
    workspace.onDidChangeTextDocument(onTextDocumentChange);
    workspace.onDidOpenTextDocument(onDidOpenTextDocument);
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

  client.onNotification($$ACTION_NOTIFICATION, (action: Action) => {
    switch (action.type) {
      case ActionType.DEV_SERVER_INITIALIZED: {
        _devServerPort = action.payload.port;
        _previews.forEach((preview) => {
          preview.setDevServerPort(_devServerPort);
        });
        break;
      }
      case ActionType.DEV_SERVER_CHANGED: {
        if (action.payload.type === ve.ServerActionType.CRASHED) {
          window.showWarningMessage(
            "Paperclip crashed - you'll need to reload this window."
          );
        } else if (
          action.payload.type === ve.ServerActionType.INSTANCE_CHANGED
        ) {
          // oh boy 🙈
          switch (action.payload.payload.action.type) {
            case ve.ActionType.PC_VIRT_OBJECT_EDITED: {
              onPCMutations(action.payload.payload.action.payload.mutations);
              break;
            }
            case ve.ActionType.META_CLICKED: {
              handleMetaClicked(action.payload.payload.action);
              break;
            }
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
    payload: { targetPCFileUri },
  }: ve.InstanceChanged) => {
    (await showTextDocument(targetPCFileUri)).document.save();
  };
  const handlePasted = async (
    { payload: { targetPCFileUri } }: ve.InstanceChanged,
    { payload: { clipboardData } }: ve.Pasted
  ) => {
    const editor = await showTextDocument(targetPCFileUri);

    const start = editor.document.positionAt(editor.document.getText().length);
    const plainText = clipboardData.find((data) => data.type === "text/plain");

    if (!plainText) {
      return;
    }

    const tedit = new TextEdit(new Range(start, start), plainText.content);

    const wsEdit = new WorkspaceEdit();
    wsEdit.set(Uri.parse(targetPCFileUri), [tedit]);
    await workspace.applyEdit(wsEdit);
  };

  const handlePreviewLocationChanged = (action: ve.LocationChanged) => {
    _previews.forEach((preview) => {
      if (preview.location.query.id === action.payload.query.id) {
        preview.handlePreviewLocationChanged(action);
      }
    });
  };

  const openDoc = async (uri: string) => {
    return (
      workspace.textDocuments.find((doc) => String(doc.uri) === uri) ||
      (await workspace.openTextDocument(stripFileProtocol(uri)))
    );
  };

  const handleMetaClicked = async ({ payload: { source } }: ve.MetaClicked) => {
    // TODO - no globals here
    const textDocument = await openDoc(source.uri);

    const editor =
      window.visibleTextEditors.find(
        (editor) =>
          editor.document && String(editor.document.uri) === source.uri
      ) || (await window.showTextDocument(textDocument, ViewColumn.One));
    editor.selection = new Selection(
      textDocument.positionAt(source.location.start),
      textDocument.positionAt(source.location.end)
    );
    editor.revealRange(editor.selection);
  };

  const handleErrorBannerClicked = async ({
    payload: error,
  }: ve.ErrorBannerClicked) => {
    const doc = await openDoc(error.uri);
    await window.showTextDocument(doc, ViewColumn.One);
  };
};

class LivePreview {
  private _em: EventEmitter;
  readonly location: PreviewLocation;

  constructor(
    private _devServerPort: number,
    readonly panel: WebviewPanel,
    location: Partial<PreviewLocation>,
    readonly sticky: boolean
  ) {
    const id = `${Date.now()}.${Math.random()}`;

    this.location = {
      pathname: location.pathname || "/canvas",
      query: {
        id,
        embedded: true,
        ...location.query,
      },
    };

    this._em = new EventEmitter();
    this._render();
    panel.onDidDispose(this._onPanelDispose);
    let prevVisible = panel.visible;
    panel.onDidChangeViewState(() => {
      if (prevVisible === panel.visible) {
        return;
      }
      prevVisible = panel.visible;
      // Need to re-render when the panel becomes visible
      if (panel.visible) {
        this._render();
      }
    });
  }
  focus() {
    this.panel.reveal(this.panel.viewColumn, false);
  }
  setTargetUri(value: string, rerender = true) {
    if (this.location.query.currentFile === value) {
      return;
    }
    this.panel.title = `⚡️ ${
      this.sticky ? "sticky preview" : path.basename(value)
    }`;
    this.location.query.currentFile = value;

    if (rerender) {
      this._render();
    }
  }
  getState(): LivePreviewState {
    return {
      location: this.location,
      sticky: this.sticky,
    };
  }
  private _render() {
    // force reload
    this.panel.webview.html = "";
    this.panel.webview.html = this._getHTML();
  }
  private _onPanelDispose = () => {
    this.dispose();
  };
  public onDidDispose(listener: () => void) {
    this._em.on("didDispose", listener);
    return () => {
      this._em.removeListener("didDispose", listener);
    };
  }
  public handlePreviewLocationChanged(action: LocationChanged) {
    this.panel.webview.postMessage(action);
  }
  public async setDevServerPort(port: number) {
    this._devServerPort = port;
    this._render();
  }
  private _getHTML() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <style>
        html, body { 
          margin: 0;
          padding: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }
        body {
          /* ensure that bg is white, even for themes */
          background: white;
          margin: 0;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      </style>

      <script>
        const vscode = acquireVsCodeApi();
        const initialState = ${JSON.stringify(this.getState())};
        vscode.setState(initialState);
        window.onmessage = ({ data }) => {
          if (data && data.type === "LOCATION_CHANGED") {
            vscode.setState({
              ...initialState,
              location: data.payload
            })
          }
        }
      </script>
    </head>
    <body>
      <iframe id="app" src="http://localhost:${this._devServerPort}${
      this.location.pathname
    }?${qs.stringify(this.location.query)}"></iframe>
    </body>
    </html>`;
  }
  dispose() {
    this._em.emit("didDispose");
    try {
      this.panel.dispose();
    } catch (e) {
      console.warn(e);
    }
  }
}
