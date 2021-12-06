import { WebviewPanel, window } from "vscode";
import { eventHandlers, Observable, Observer } from "paperclip-common";
import { LiveWindow, LiveWindowState } from "./live-window";
import { DesignServerStarted } from "../language/server/events";
// import { HTTPServerStarted } from "tandem-designer/lib/server/services/http-server";
// import {
//   ActionType,
//   LocationChanged
// } from "../../../../paperclip-designer/lib";

export class LiveWindowManager implements Observer {
  readonly events: Observable;
  private _windows: LiveWindow[];
  private _devServerPort: number;
  private _projectId: string;
  constructor() {
    this._windows = [];
    this.events = new Observable();
  }
  _onDevServerStarted = ({ httpPort, projectId }: DesignServerStarted) => {
    this._devServerPort = httpPort;
    this._projectId = projectId;
    for (const window of this._windows) {
      window.setDevServerInfo(httpPort, projectId);
    }
  };
  getLength() {
    return this._windows.length;
  }
  setStickyWindowUri(uri: string) {
    const stickyWindow = this._windows.find(window => window.getState().sticky);
    if (stickyWindow) {
      stickyWindow.setTargetUri(uri);
      return true;
    }
    return false;
  }
  open(uri: string, sticky: boolean) {
    const liveWindow = LiveWindow.newFromUri(
      uri,
      sticky,
      this._devServerPort,
      this._projectId
    );
    this._add(liveWindow);
  }
  private _add(window: LiveWindow) {
    this._windows.push(window);
    window.onDispose(() => {
      this._windows.splice(this._windows.indexOf(window), 1);
    });
  }
  activate() {
    window.registerWebviewPanelSerializer(LiveWindow.TYPE, {
      deserializeWebviewPanel: async (
        panel: WebviewPanel,
        state: LiveWindowState
      ) => {
        this._add(
          LiveWindow.newFromPanel(
            panel,
            state,
            this._devServerPort,
            this._projectId
          )
        );
      }
    });
  }

  handleEvent = eventHandlers({
    [DesignServerStarted.TYPE]: this._onDevServerStarted
  });
}
