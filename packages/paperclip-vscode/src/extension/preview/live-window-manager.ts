import { WebviewPanel, window } from "vscode";
import { BaseEvent, Disposable, Observable, Observer } from "paperclip-common";
import { LiveWindow, LiveWindowState } from "./live-window";

export class LiveWindowManager implements Observer, Disposable {
  readonly events: Observable;
  private _windows: LiveWindow[];
  private _devServerPort: number;
  constructor() {
    this._windows = [];
    this.events = new Observable();
  }
  handleEvent(event: BaseEvent) {
    // if DEV_SERVER_INITIALIZED
  }
  dispose() {}
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
    const liveWindow = LiveWindow.newFromUri(uri, sticky, this._devServerPort);
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
      async deserializeWebviewPanel(
        panel: WebviewPanel,
        state: LiveWindowState
      ) {
        this._add(LiveWindow.newFromPanel(panel, state, this._devServerPort));
      }
    });
  }
}
