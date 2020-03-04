import { EngineEvent } from "paperclip";
import vscode, {
  Uri,
  window,
  commands,
  TextEditor,
  WebviewPanel,
  ExtensionContext,
  ViewColumn,
  workspace,
  Selection
} from "vscode";
import { isPaperclipFile } from "./utils";
import * as path from "path";
import { EventEmitter } from "events";
import { LanguageClient } from "vscode-languageclient";
import { NotificationType, Load, Unload } from "../common/notifications";

const VIEW_TYPE = "paperclip-preview";

enum OpenLivePreviewOptions {
  Yes = "Yes",
  No = "No"
}

type LivePreviewState = {
  targetUri: string;
};

export const activate = (client: LanguageClient, context: ExtensionContext) => {
  const { extensionPath } = context;

  let _previews: {
    [identifier: string]: LivePreview;
  } = {};

  let _showedOpenLivePreviewPrompt = false;

  const openLivePreview = async (editor: TextEditor) => {
    const paperclipUri = String(editor.document.uri);

    // NOTE - don't get in the way of opening the live preview since
    // there's really no way to tell whether an existing tab is open which will
    // happen when the app loads with existing live preview tabs.

    const panel = window.createWebviewPanel(
      VIEW_TYPE,
      `⚡️ ${path.basename(paperclipUri)}`,
      ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [
          Uri.file(extensionPath),
          Uri.file(workspace.rootPath)
        ]
      }
    );

    registerLivePreview(
      new LivePreview(client, panel, extensionPath, paperclipUri)
    );
  };

  const registerLivePreview = (preview: LivePreview) => {
    _previews[preview.targetUri] = preview;
    let disposeListener = preview.onDidDispose(() => {
      delete _previews[preview.targetUri];
      disposeListener();
    });
  };

  /**
   * This really just provides a lower barrier to entry -- prompts once with
   * info about the command, then disappear
   */

  const askToDisplayLivePreview = async (editor: TextEditor) => {
    if (_showedOpenLivePreviewPrompt || Object.keys(_previews).length) {
      return;
    }

    _showedOpenLivePreviewPrompt = true;

    const option = await window.showInformationMessage(
      `Would you like to open a live preview? Command: "Paperclip: Open Live Preview" is also available. `,
      OpenLivePreviewOptions.Yes,
      OpenLivePreviewOptions.No
    );

    if (option === OpenLivePreviewOptions.Yes) {
      openLivePreview(editor);
    }
  };

  const onTextEditorChange = (editor: TextEditor) => {
    const uri = String(editor.document.uri);
    if (isPaperclipFile(uri)) {
      askToDisplayLivePreview(editor);
    }
  };

  window.registerWebviewPanelSerializer(VIEW_TYPE, {
    async deserializeWebviewPanel(
      panel: WebviewPanel,
      { targetUri }: LivePreviewState
    ) {
      registerLivePreview(
        new LivePreview(client, panel, extensionPath, targetUri)
      );
    }
  });

  setTimeout(() => {
    window.onDidChangeActiveTextEditor(onTextEditorChange);
    if (window.activeTextEditor) {
      onTextEditorChange(window.activeTextEditor);
    }
  }, 500);

  commands.registerCommand("paperclip.openPreview", () => {
    if (window.activeTextEditor) {
      if (isPaperclipFile(String(window.activeTextEditor.document.uri))) {
        openLivePreview(window.activeTextEditor);
      } else {
        window.showErrorMessage(
          `Only Paperclip (.pc) are supported in Live Preview`
        );
      }
    }
  });

  // There can only be one listener, so do that & handle across all previews
  client.onNotification(NotificationType.ENGINE_EVENT, event => {
    Object.values(_previews).forEach(preview => {
      preview.$$handleEngineEvent(event);
    });
  });
};

class LivePreview {
  private _em: EventEmitter;
  private _disposeEngineListener: () => void;
  public readonly targetUri: string;

  constructor(
    private _client: LanguageClient,
    readonly panel: WebviewPanel,
    private readonly _extensionPath: string,
    targetUri: string
  ) {
    this._em = new EventEmitter();
    this.targetUri = targetUri;
    this.panel.webview.onDidReceiveMessage(this._onMessage);
    this._render();
    panel.onDidDispose(this._onPanelDispose);
    panel.onDidChangeViewState(() => {
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
  getState(): LivePreviewState {
    return {
      targetUri: this.targetUri
    };
  }
  blink() {}
  private _render() {
    // Calling startEngine multiple times by the way just restarts it
    this._client.sendNotification(
      ...new Load({ uri: this.targetUri }).getArgs()
    );
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
  private _onPreviewMessage = event => {
    if (event.type === "metaElementClicked") {
      this._handleElementMetaClicked(event);
    }
  };
  private async _handleElementMetaClicked({ sourceLocation, sourceUri }) {
    // TODO - no globals here
    const textDocument =
      workspace.textDocuments.find(doc => String(doc.uri) === sourceUri) ||
      (await workspace.openTextDocument(sourceUri.replace("file://", "")));

    const editor =
      window.visibleTextEditors.find(
        editor => editor.document && String(editor.document.uri) === sourceUri
      ) || (await window.showTextDocument(textDocument, ViewColumn.One));
    editor.selection = new Selection(
      textDocument.positionAt(sourceLocation.start),
      textDocument.positionAt(sourceLocation.end)
    );
    editor.revealRange(editor.selection);
  }
  private _onMessage = () => {
    // TODO when live preview tools are available
  };
  public $$handleEngineEvent(event: EngineEvent) {
    if (event.uri !== this.targetUri) {
      return;
    }

    this.panel.webview.postMessage(JSON.stringify(event));
  }
  private _getHTML() {
    console.log("PREVIEW");
    const scriptPathOnDisk = Uri.file(
      path.join(
        this._extensionPath,
        "node_modules",
        "paperclip-web-renderer",
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
        }
      </style>
    </head>
    <body>
      <script>
        const vscode = acquireVsCodeApi();
        vscode.setState(${JSON.stringify(this.getState())});
      </script>
      <script src="${scriptUri}"></script>
    </body>
    </html>`;
  }
  dispose() {
    this._disposeEngineListener();
    this.panel.dispose();
    this._em.emit("didDispose");
  }
}
