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
import * as path from "path";
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

export class LiveWindow {
  static TYPE = "paperclip-preview";
  private _store: ImmutableStore<LiveWindowState>;
  private _em: EventEmitter;

  constructor(
    state: LiveWindowState,
    private _devServerPort: number,
    private _panel: WebviewPanel
  ) {
    this._store = new ImmutableStore({
      ...state,
      embedded: true,
      panelVisible: this._panel.visible
    });
    this._store.update(newState => {
      newState.location.query.id = `${Date.now()}.${Math.random()}`;
    });

    this._store.onChange(this._onStoreChange);
    this._em = new EventEmitter();
    this._panel.onDidDispose(this._onPanelDispose);
    this._createBindings();
    this._render();
  }

  getState() {
    return this._store.getState();
  }

  dispose() {
    try {
      this._panel.dispose();

      // eslint-disable-next-line
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

  setTargetUri(uri: string) {
    this._store.update(state => {
      state.location.query.canvasFile = uri;
    });
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
      (newState.panelVisible &&
        newState.panelVisible !== oldState.panelVisible) ||
      newState.location.query.canvasFile !== oldState.location.query.canvasFile
    ) {
      this._render();
    }
  };

  private _render() {
    const state = this.getState();

    console.log(
      `http://localhost:${this._devServerPort}${
        state.location.pathname
      }?${qs.stringify(state.location.query)}`
    );

    this._panel.title = `⚡️ ${
      state.sticky
        ? "sticky preview"
        : path.basename(state.location.query.canvasFile)
    }`;

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
        window.addEventListener("locationChanged", () => {
          console.log(window.location);
        });
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

  static newFromUri(uri: string, sticky: boolean, devServerPort: number) {
    const panel = window.createWebviewPanel(
      LiveWindow.TYPE,
      sticky ? "sticky preview" : `⚡️ ${path.basename(uri)}`,
      ViewColumn.Beside,
      {
        enableScripts: true
      }
    );

    return new LiveWindow(
      { location: getLocationFromUri(uri), sticky },
      devServerPort,
      panel
    );
  }

  static newFromPanel(
    panel: WebviewPanel,
    state: LiveWindowState,
    devServerPort: number
  ) {
    return new LiveWindow(state, devServerPort, panel);
  }
}

const getLocationFromUri = (uri: string): LiveWindowLocation => ({
  pathname: "/",
  query: {
    canvasFile: uri
  }
});
