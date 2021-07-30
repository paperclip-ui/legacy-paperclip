import { BaseEvent, Disposable, Observable, Observer } from "paperclip-common";
import { workspace, ExtensionContext } from "vscode";

import {
  LanguageClient,
  ServerOptions,
  TransportKind,
  LanguageClientOptions
} from "vscode-languageclient";
import * as path from "path";
import { $$EVENT } from "./server/constants";

/**
 * Spins up language server
 */

export class PaperclipLanguageClient implements Disposable, Observer {
  readonly events: Observable;

  private _client: LanguageClient;
  constructor(context: ExtensionContext) {
    this.events = new Observable();

    const serverPath = context.asAbsolutePath(
      path.join("lib", "extension", "language", "server", "index.js")
    );
    const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
    const serverOptions: ServerOptions = {
      run: { module: serverPath, transport: TransportKind.ipc },

      debug: {
        module: serverPath,
        transport: TransportKind.ipc,
        options: debugOptions
      }
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
      // Register the server for plain text documents
      documentSelector: [{ scheme: "file", language: "paperclip" }],
      synchronize: {
        configurationSection: ["paperclip", "credentials"],
        // Notify the server about file changes to '.clientrc files contained in the workspace
        fileEvents: workspace.createFileSystemWatcher("**/.clientrc")
      }
    };

    this._client = new LanguageClient(
      "paperclipLanguageServer",
      "Paperclip Language Server",
      serverOptions,
      clientOptions
    );
  }
  handleEvent(event) {}
  async activate() {
    this._client.start();
    await this.ready();
    this._client.onNotification($$EVENT, this._onServerEvent);
  }
  ready() {
    return this._client.onReady();
  }
  dispose() {
    this._client.stop();
  }
  private _onServerEvent = (event: BaseEvent) => {
    this.events.dispatch(event);
  };
}
