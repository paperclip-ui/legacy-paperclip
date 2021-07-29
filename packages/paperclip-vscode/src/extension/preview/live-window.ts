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
import path from "path";
import { ImmutableStore, Observer } from "paperclip-common";
import { EventEmitter } from "events";
import * as qs from "querystring";

type LiveWindowLocation = {
  pathname: string;
  query: Partial<{
    canvasFile: string;
    embedded: boolean;
    id: string;
    expanded: boolean;
    frame: number;
  }>;
};

export type LiveWindowState = {
  location: LiveWindowLocation;
  sticky: boolean;
  panelVisible?: boolean;
};

export class LiveWindow implements Observer {
  static TYPE = "paperclip-preview";
  private _store: ImmutableStore<LiveWindowState>;
  private _em: EventEmitter;

  constructor(
    private _devServerPort: number,
    state: LiveWindowState,
    private _panel: WebviewPanel
  ) {
    this._store = new ImmutableStore({
      ...state,
      panelVisible: this._panel.visible
    });
    this._store.onChange(this._onStoreChange);
    this._em = new EventEmitter();
    this._panel.onDidDispose(this._onPanelDispose);
    this._createBindings();
  }

  getState() {
    return this._store.getState();
  }
  handleEvent(event) {}

  dispose() {
    try {
      this._panel.dispose();
    } catch (e) {}
    this._em.emit("dispose");
  }

  onDispose(listener: () => void) {
    this._em.once("dispose", listener);
  }

  /**
   * Need to make this accessble in case language server respawns
   * TODO - probably need to change to be event based instead.
   */

  setDevServerPort(port: number) {
    this._devServerPort = port;
    this._render();
  }

  private _onPanelDispose = () => {
    this.dispose();
  };

  private _onStoreChange = (
    newState: LiveWindowState,
    oldState: LiveWindowState
  ) => {
    // if coming into visibility again
    if (
      newState.panelVisible &&
      newState.panelVisible !== oldState.panelVisible
    ) {
      this._render();
    }
  };

  private _render() {
    // force reload
    this._panel.webview.html = "";
    this._panel.webview.html = this._getHTML();
  }

  private _getHTML() {
    const state = this.getState();

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
        const initialState = ${JSON.stringify(state)};
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
      state.location.pathname
    }?${qs.stringify(state.location.query)}"></iframe>
    </body>
    </html>`;
  }

  private _createBindings() {
    this._panel.onDidChangeViewState(() => {
      this._store.update(state => {
        state.panelVisible = this._panel.visible;
      });
    });
  }

  static newFromUri(devServerPort: number, uri: string, sticky: boolean) {
    const panel = window.createWebviewPanel(
      LiveWindow.TYPE,
      sticky ? "sticky preview" : `⚡️ ${path.basename(uri)}`,
      ViewColumn.Beside,
      {
        enableScripts: true
      }
    );

    return new LiveWindow(
      devServerPort,
      { location: getLocationFromUri(uri), sticky },
      panel
    );
  }

  static newFromPanel(
    panel: WebviewPanel,
    state: LiveWindowState,
    devServerPort: number
  ) {
    return new LiveWindow(devServerPort, state, panel);
  }
}

const getLocationFromUri = (uri: string): LiveWindowLocation => ({
  pathname: "/canvas",
  query: {
    canvasFile: uri
  }
});
