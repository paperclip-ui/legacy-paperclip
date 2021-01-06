import {
  EngineDelegateEvent,
  EngineDelegateEventKind,
  EngineErrorEvent,
  stripFileProtocol
} from "paperclip-utils";
import { PCMutation } from "paperclip-source-writer";
import * as fs from "fs";
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
  WorkspaceEdit
} from "vscode";
import { isPaperclipFile } from "./utils";
import * as path from "path";
import { EventEmitter } from "events";
import { LanguageClient } from "vscode-languageclient";
import {
  NotificationType,
  Load,
  Unload,
  LoadedParams,
  ErrorLoadingParams
} from "../common/notifications";
import {
  $$ACTION_NOTIFICATION,
  Action,
  ActionType,
  DevServerChanged
} from "../common/actions";

const VIEW_TYPE = "paperclip-preview";

const RENDERER_MODULE_NAME = "paperclip-visual-editor";
import * as ve from "paperclip-visual-editor";
import { InstanceChanged } from "paperclip-visual-editor";

enum OpenLivePreviewOptions {
  Yes = "Yes",
  Always = "Always",
  No = "No"
}

type LivePreviewState = {
  targetUri: string;
  sticky: boolean;
  closeWithFile: boolean;
};

export const activate = (
  client: LanguageClient,
  context: ExtensionContext,
  onPCMutations: (mutation: PCMutation[]) => void
): void => {
  const { extensionPath } = context;

  const _previews: LivePreview[] = [];

  let _showedOpenLivePreviewPrompt = false;
  let _devServerPort: number;

  const openLivePreview = async (
    editor: TextEditor,
    sticky: boolean,
    closeWithFile: boolean
  ) => {
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
        localResourceRoots: [
          Uri.file(extensionPath),
          Uri.file(workspace.rootPath),
          Uri.file(resolveSync(RENDERER_MODULE_NAME, extensionPath))
        ]
      }
    );

    registerLivePreview(
      new LivePreview(
        _devServerPort,
        client,
        panel,
        extensionPath,
        paperclipUri,
        sticky,
        closeWithFile
      )
    );
  };
  const dispatchClient = (action: ve.ExternalAction) => {
    client.sendNotification($$ACTION_NOTIFICATION, action);
  };

  const showTextDocument = async (uri: string) => {
    const sourceEditor = window.visibleTextEditors.find(
      editor => String(editor.document.uri) === uri
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
      })
    ];
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
      openLivePreview(editor, false, false);
    } else if (option === OpenLivePreviewOptions.Always) {
      openLivePreview(editor, true, false);
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
    document
  }: TextDocumentChangeEvent) => {
    dispatchClient(
      ve.contentChanged({
        fileUri: document.uri.toString(),
        content: document.getText()
      })
    );
  };

  window.registerWebviewPanelSerializer(VIEW_TYPE, {
    async deserializeWebviewPanel(
      panel: WebviewPanel,
      { targetUri, sticky, closeWithFile }: LivePreviewState
    ) {
      registerLivePreview(
        new LivePreview(
          _devServerPort,
          client,
          panel,
          extensionPath,
          targetUri,
          sticky,
          closeWithFile
        )
      );
    }
  });

  const onDidOpenTextDocument = (document: TextDocument) => {
    dispatchClient(
      ve.contentChanged({
        fileUri: document.uri.toString(),
        content: document.getText()
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
        openLivePreview(window.activeTextEditor, sticky, false);
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

  // There can only be one listener, so do that & handle across all previews
  client.onNotification(NotificationType.ENGINE_EVENT, event => {
    _previews.forEach(preview => {
      preview.$$handleEngineDelegateEvent(event);
    });
  });

  client.onNotification($$ACTION_NOTIFICATION, (action: Action) => {
    switch (action.type) {
      case ActionType.DEV_SERVER_INITIALIZED: {
        _devServerPort = action.payload.port;
        _previews.forEach(preview => {
          preview.setDevServerPort(_devServerPort);
        });
        break;
      }
      case ActionType.DEV_SERVER_CHANGED: {
        if (action.payload.type === ve.ServerActionType.INSTANCE_CHANGED) {
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

  const openDoc = async (uri: string) => {
    return (
      workspace.textDocuments.find(doc => String(doc.uri) === uri) ||
      (await workspace.openTextDocument(stripFileProtocol(uri)))
    );
  };

  const handleMetaClicked = async ({ payload: { source } }: ve.MetaClicked) => {
    // TODO - no globals here
    const textDocument = await openDoc(source.uri);

    const editor =
      window.visibleTextEditors.find(
        editor => editor.document && String(editor.document.uri) === source.uri
      ) || (await window.showTextDocument(textDocument, ViewColumn.One));
    editor.selection = new Selection(
      textDocument.positionAt(source.location.start),
      textDocument.positionAt(source.location.end)
    );
    editor.revealRange(editor.selection);
  };

  const handleErrorBannerClicked = async ({
    payload: error
  }: ve.ErrorBannerClicked) => {
    const doc = await openDoc(error.uri);
    await window.showTextDocument(doc, ViewColumn.One);
  };

  // There can only be one listener, so do that & handle across all previews
  client.onNotification(NotificationType.ERROR_LOADING, event => {
    _previews.forEach(preview => {
      preview.$$handleErrorLoading(event);
    });
  });

  // There can only be one listener, so do that & handle across all previews
  client.onNotification(NotificationType.LOADED, event => {
    _previews.forEach(preview => {
      preview.$$handleLoaded(event);
    });
  });
};

class LivePreview {
  private _em: EventEmitter;
  private _dependencies: string[] = [];
  private _needsReloading: boolean;
  private _previewInitialized: () => void;
  private _readyPromise: Promise<any>;
  private _initPromise: Promise<any>;
  private _targetUri: string;

  constructor(
    private _devServerPort: number,
    private _client: LanguageClient,
    readonly panel: WebviewPanel,
    private readonly _extensionPath: string,
    targetUri: string,
    readonly sticky: boolean,
    readonly closeWithFile: boolean
  ) {
    this._em = new EventEmitter();
    this._targetUri = targetUri;
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

        // panel content is disposed of, so eliminate the extra work
      } else {
        this._client.sendNotification(
          ...new Unload({ uri: targetUri }).getArgs()
        );
      }
    });
  }
  focus() {
    this.panel.reveal(this.panel.viewColumn, false);
  }
  getTargetUri() {
    return this._targetUri;
  }
  setTargetUri(value: string) {
    if (this._targetUri === value) {
      return;
    }
    this.panel.title = `⚡️ ${
      this.sticky ? "sticky preview" : path.basename(value)
    }`;
    this._targetUri = value;
    this._render();
  }
  getState(): LivePreviewState {
    return {
      targetUri: this._targetUri,
      sticky: this.sticky,
      closeWithFile: this.closeWithFile
    };
  }
  private _createInitPromise() {
    this._initPromise = new Promise(resolve => {
      this._previewInitialized = resolve as any;
    });
  }
  private _render() {
    this._needsReloading = false;

    // force reload
    this.panel.webview.html = "";
    this.panel.webview.html = this._getHTML();
    this._createInitPromise();

    this._client.sendNotification(
      ...new Load({ uri: this._targetUri }).getArgs()
    );
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
  public async $$handleErrorLoading({ uri, error }: ErrorLoadingParams) {
    if (uri === this._targetUri) {
      await this._readyPromise;
      this._needsReloading = true;
      this.panel.webview.postMessage({
        type: "ERROR",
        payload: JSON.stringify(error)
      });
    }
  }
  public async $$handleLoaded({ uri, data }: LoadedParams) {
    if (uri === this._targetUri) {
      await this._readyPromise;
      this.panel.webview.postMessage({
        type: "INIT",
        payload: JSON.stringify(data)
      });
      this._previewInitialized();
    }
  }
  public async setDevServerPort(port: number) {
    this._devServerPort = port;
    this._render();
  }
  public async $$handleEngineDelegateEvent(event: EngineDelegateEvent) {
    await this._initPromise;
    if (
      this._needsReloading &&
      (event.kind === EngineDelegateEventKind.Evaluated ||
        event.kind === EngineDelegateEventKind.Diffed)
    ) {
      this._render();
    }

    // all error events get passed to preview.
    if (event.kind !== EngineDelegateEventKind.Error) {
      if (
        event.uri !== this._targetUri &&
        !this._dependencies.includes(event.uri)
      ) {
        return;
      }

      if (
        event.uri == this._targetUri &&
        (event.kind === EngineDelegateEventKind.Evaluated ||
          event.kind === EngineDelegateEventKind.Loaded ||
          event.kind === EngineDelegateEventKind.Diffed ||
          event.kind === EngineDelegateEventKind.ChangedSheets)
      ) {
        this._dependencies = event.data.allDependencies;
      }
    }

    this.panel.webview.postMessage({
      type: "ENGINE_EVENT",
      payload: JSON.stringify(event)
    });
  }
  private _getHTML() {
    const scriptPathOnDisk = Uri.file(
      path.join(
        resolveSync(RENDERER_MODULE_NAME, this._extensionPath),
        "dist",
        "browser.js"
      )
    );

    const scriptUri = this.panel.webview.asWebviewUri(scriptPathOnDisk);

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
    </head>
    <body>
      <script>
        const PROTOCOL = "${scriptUri.scheme}://${scriptUri.authority}/file";
        const TARGET_URI = "${this._targetUri}";
        const vscode = acquireVsCodeApi();
        vscode.setState(${JSON.stringify(this.getState())});
      </script>
      <!--script src="${scriptUri}"></script-->
      <iframe src="http://localhost:${
        this._devServerPort
      }?within_ide=true&current_file=${encodeURIComponent(
      this._targetUri
    )}"></iframe>
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

function resolveSync(moduleName: string, fromDir: string) {
  let cdir = fromDir;
  do {
    const possiblePath = path.join(cdir, "node_modules", moduleName);

    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }

    cdir = path.dirname(cdir);
  } while (cdir !== "/" && cdir !== "." && !/^\w+:\\$/.test(cdir));

  throw new Error(`Could not resolve ${moduleName} in ${fromDir}`);
}
