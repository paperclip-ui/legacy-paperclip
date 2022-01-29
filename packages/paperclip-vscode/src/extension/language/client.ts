import { Disposable, RPCClientAdapter } from "@paperclip-ui/common";
import { workspace, ExtensionContext } from "vscode";

import {
  LanguageClient,
  ServerOptions,
  TransportKind,
  LanguageClientOptions,
} from "vscode-languageclient";
import * as path from "path";
import { EventEmitter } from "events";
import { languageClientRPCAdapter } from "../rpc";
import { createListener } from "../utils";
import {
  designServerStartedChannel,
  revealSourceChannel,
  DesignServerStartedInfo,
} from "../channels";
import { ExprSource } from "@paperclip-ui/utils";
// import { PCEngineCrashed } from "@tandem-ui/designer/lib/server/services/pc-engine";

/**
 * Spins up language server
 */

export class PaperclipLanguageClient implements Disposable {
  private _em: EventEmitter;

  private _client: LanguageClient;

  private _rpcClient: RPCClientAdapter;
  private _designServerStarted: ReturnType<typeof designServerStartedChannel>;
  private _revealSourceRequest: ReturnType<typeof revealSourceChannel>;

  constructor(context: ExtensionContext) {
    this._em = new EventEmitter();

    const serverPath = context.asAbsolutePath(
      path.join("lib", "extension", "language", "server", "index.js")
    );
    const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
    const serverOptions: ServerOptions = {
      run: { module: serverPath, transport: TransportKind.ipc },
      debug: {
        module: serverPath,
        transport: TransportKind.ipc,
        options: debugOptions,
      },
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
      // Register the server for plain text documents
      documentSelector: [{ scheme: "file", language: "paperclip" }],
      synchronize: {
        configurationSection: ["paperclip", "credentials"],
        // Notify the server about file changes to '.clientrc files contained in the workspace
        fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
      },
    };

    this._client = new LanguageClient(
      "paperclipLanguageServer",
      "Paperclip Language Server",
      serverOptions,
      clientOptions
    );
  }

  onRevealSourceRequest(listener: (info: ExprSource) => void) {
    return createListener(this._em, "revealSource", listener);
  }

  onDesignServerStarted(listener: (info: DesignServerStartedInfo) => void) {
    return createListener(this._em, "designServerStarted", listener);
  }

  private _onDesignServerStarted = async (info: DesignServerStartedInfo) => {
    console.log(`PaperclipLanguageClient::_onDesignServerStarted`);
    this._em.emit("designServerStarted", info);
  };

  private _onRevealSourceRequest = async (info: ExprSource) => {
    console.log("PaperclipLanguageClient::onRevealSourceRequest");
    this._em.emit("revealSource", info);
  };

  async activate() {
    this._client.start();
    await this.ready();

    this._rpcClient = languageClientRPCAdapter(this._client);
    this._designServerStarted = designServerStartedChannel(this._rpcClient);
    this._designServerStarted.listen(this._onDesignServerStarted);

    this._revealSourceRequest = revealSourceChannel(this._rpcClient);
    this._revealSourceRequest.listen(this._onRevealSourceRequest);
  }
  ready() {
    return this._client.onReady();
  }
  dispose() {
    this._client.stop();
  }
}
