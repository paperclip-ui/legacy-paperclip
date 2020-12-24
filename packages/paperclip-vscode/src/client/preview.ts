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
  WebviewPanel,
  ExtensionContext,
  ViewColumn,
  workspace,
  Selection,
  env
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
import { fileURLToPath } from "url";

const VIEW_TYPE = "paperclip-preview";

const RENDERER_MODULE_NAME = "paperclip-visual-editor";

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
        client,
        panel,
        extensionPath,
        paperclipUri,
        sticky,
        closeWithFile
      )
    );
  };

  const execCommand = async (preview: LivePreview, command: string) => {
    const uri = preview.getTargetUri();
    const sourceEditor = window.visibleTextEditors.find(
      editor => String(editor.document.uri) === uri
    );
    await window.showTextDocument(
      sourceEditor.document,
      sourceEditor.viewColumn,
      false
    );
    await commands.executeCommand(command);
  };

  const registerLivePreview = (preview: LivePreview) => {
    _previews.push(preview);
    const listeners = [
      preview.onVirtObjectEdited(onPCMutations),
      preview.onUndo(async () => {
        execCommand(preview, "undo");
      }),
      preview.onRedo(async () => {
        execCommand(preview, "redo");
      }),
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

  window.registerWebviewPanelSerializer(VIEW_TYPE, {
    async deserializeWebviewPanel(
      panel: WebviewPanel,
      { targetUri, sticky, closeWithFile }: LivePreviewState
    ) {
      registerLivePreview(
        new LivePreview(
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

  setTimeout(() => {
    window.onDidChangeActiveTextEditor(onTextEditorChange);
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
  private _previewReady: () => void;
  private _previewInitialized: () => void;
  private _readyPromise: Promise<any>;
  private _initPromise: Promise<any>;
  private _targetUri: string;

  constructor(
    private _client: LanguageClient,
    readonly panel: WebviewPanel,
    private readonly _extensionPath: string,
    targetUri: string,
    readonly sticky: boolean,
    readonly closeWithFile: boolean
  ) {
    this._em = new EventEmitter();
    this._targetUri = targetUri;
    this.panel.webview.onDidReceiveMessage(this._onMessage);
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
    this.panel.webview.onDidReceiveMessage(this._onPreviewMessage);
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
  private _createReadyPromise() {
    this._readyPromise = new Promise(resolve => {
      this._previewReady = resolve as any;
    });
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
    this._createReadyPromise();
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
  public onVirtObjectEdited(listener: (mutations: PCMutation[]) => void) {
    this._em.on("virtObjectEdited", listener);
    return () => {
      this._em.removeListener("virtObjectEdited", listener);
    };
  }
  public onUndo(listener: () => void) {
    this._em.on("undo", listener);
    return () => {
      this._em.removeListener("undo", listener);
    };
  }
  public onRedo(listener: () => void) {
    this._em.on("redo", listener);
    return () => {
      this._em.removeListener("redo", listener);
    };
  }

  private _onPreviewMessage = async event => {
    // debug what's going on
    if (event.type === "metaElementClicked") {
      this._handleElementMetaClicked(event);
    } else if (event.type === "errorBannerClicked") {
      this._handleErrorBannerClicked(event);
    } else if (event.type === "ready") {
      this._previewReady();
    } else if (event.type === "PC_VIRT_OBJECT_EDITED") {
      this._em.emit("virtObjectEdited", event.payload.mutations);
    } else if (event.type === "GLOBAL_Z_KEY_DOWN") {
      this._em.emit("undo");
    } else if (event.type === "GLOBAL_Y_KEY_DOWN") {
      this._em.emit("redo");
    }
  };
  private async _handleErrorBannerClicked({
    error
  }: {
    error: EngineErrorEvent;
  }) {
    const doc = await this._openDoc(error.uri);
    await window.showTextDocument(doc, ViewColumn.One);
  }
  private async _handleElementMetaClicked({ source }) {
    // TODO - no globals here
    const textDocument = await this._openDoc(source.uri);

    const editor =
      window.visibleTextEditors.find(
        editor => editor.document && String(editor.document.uri) === source.uri
      ) || (await window.showTextDocument(textDocument, ViewColumn.One));
    editor.selection = new Selection(
      textDocument.positionAt(source.location.start),
      textDocument.positionAt(source.location.end)
    );
    editor.revealRange(editor.selection);
  }
  private async _openDoc(uri: string) {
    return (
      workspace.textDocuments.find(doc => String(doc.uri) === uri) ||
      (await workspace.openTextDocument(stripFileProtocol(uri)))
    );
  }
  private _onMessage = () => {
    // TODO when live preview tools are available
  };
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
      </style>
    </head>
    <body>
      <script>
        const PROTOCOL = "${scriptUri.scheme}://${scriptUri.authority}/file";
        const TARGET_URI = "${this._targetUri}";
        const vscode = acquireVsCodeApi();
        vscode.setState(${JSON.stringify(this.getState())});
      </script>
      <script src="${scriptUri}"></script>
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
