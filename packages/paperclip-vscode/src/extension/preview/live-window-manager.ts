import { WebviewPanel, window } from "vscode";
import { LiveWindow, LiveWindowState } from "./live-window";
import { isPaperclipFile } from "@paperclip-ui/utils";
import { PaperclipLanguageClient } from "../language";
import { DesignServerStartedInfo } from "../channels";

export class LiveWindowManager {
  private _windows: LiveWindow[];
  private _devServerPort: number;
  private _projectId: string;
  constructor(private _languageClient: PaperclipLanguageClient) {
    this._windows = [];
    this._languageClient.onDesignServerStarted(this._onDevServerStarted);
  }
  _onDevServerStarted = ({ httpPort, projectId }: DesignServerStartedInfo) => {
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
    const stickyWindow = this._windows.find(
      (window) => window.getState().sticky
    );
    if (stickyWindow && isPaperclipFile(uri)) {
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
      },
    });
  }
}
