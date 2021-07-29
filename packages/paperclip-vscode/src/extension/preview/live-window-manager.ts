import { WebviewPanel, window } from "vscode";
import { BaseEvent, Disposable, Observable, Observer } from "paperclip-common";
import { LiveWindow, LiveWindowState } from "./live-window";

export class LiveWindowManager implements Observer, Disposable {
  readonly events: Observable;
  private _windows: LiveWindow[];
  private _devServerPort: number;
  constructor() {
    this._windows = [];
  }
  handleEvent(event: BaseEvent) {
    // if DEV_SERVER_INITIALIZED
  }
  dispose() {}
  open(uri: string, sticky: boolean) {
    const liveWindow = LiveWindow.newFromUri(0, uri, sticky);
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
