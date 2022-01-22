import { ExtensionContext } from "vscode";
import { LanguageClient } from "vscode-languageclient";
import { Disposable, Observable } from "@paperclip-ui/common";
import { PaperclipLanguageClient } from "./language";
import { LiveWindowManager } from "./preview/live-window-manager";
import { CommandManager } from "./command-manager";
import { DocumentManager } from "./document-manager";

class PaperclipExtension implements Disposable {
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
    this._languageClient = new PaperclipLanguageClient(context);

    this._windows = new LiveWindowManager(this._languageClient);

    this._commandManager = new CommandManager(this._windows);
    this._documentManager = new DocumentManager(
      this._windows,
      this._languageClient
    );
  }
  activate() {
    this._languageClient.activate();
    this._windows.activate();
    this._documentManager.activate();
    this._commandManager.activate();
  }
  dispose() {
    this._languageClient.dispose();
  }
}

let _ext: PaperclipExtension;

export const activate = (context: ExtensionContext) => {
  _ext = new PaperclipExtension(context);
  _ext.activate();
};

export const deactivate = () => {
  _ext.dispose();
};
