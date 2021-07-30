import { ExtensionContext } from "vscode";
import { LanguageClient } from "vscode-languageclient";
import { Disposable, Observable } from "paperclip-common";
import { PaperclipLanguageClient } from "./language";
import { LiveWindowManager } from "./preview/live-window-manager";
import { CommandManager } from "./command-manager";
import { DocumentManager } from "./document-manager";

class PaperclipExtension implements Disposable {
  /**
   * Event bus
   */

  private _events: Observable;

  /**
   * Manages PC language features + the server
   */

  private _languageClient: PaperclipLanguageClient;

  /**
   * Manages live Paperclip windows
   */

  private _windows: LiveWindowManager;

  /**
   * manages commands coming in from VS Code
   */

  private _commandManager: CommandManager;

  /**
   */

  private _documentManager: DocumentManager;

  constructor(readonly context: ExtensionContext) {
    this._events = new Observable();
    this._languageClient = new PaperclipLanguageClient(context);
    this._windows = new LiveWindowManager();
    this._commandManager = new CommandManager(this._windows);
    this._documentManager = new DocumentManager(this._windows);
    this._connectChannels();
  }
  activate() {
    this._documentManager.activate();
    this._commandManager.activate();
    this._windows.activate();
    this._languageClient.activate();
  }
  dispose() {
    this._languageClient.dispose();
    this._windows.dispose();
  }
  _connectChannels() {
    this._events.source(this._languageClient.events);
    this._events.observe(this._languageClient);

    this._events.source(this._windows.events);
    this._events.observe(this._windows);

    this._events.observe(this._documentManager);
  }
}

let _ext: PaperclipExtension;

export const activate = (context: ExtensionContext) => {
  _ext = new PaperclipExtension(context);
  _ext.activate();

  console.log("activate");
};

export const deactivate = () => {
  _ext.dispose();
};
