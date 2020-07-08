// https://code.visualstudio.com/api/language-extensions/language-server-extension-guide

import { workspace, ExtensionContext, window } from "vscode";
import * as path from "path";
import {
  LanguageClient,
  ServerOptions,
  TransportKind,
  LanguageClientOptions
} from "vscode-languageclient";
import { activate as activatePreview } from "./preview";
import { NotificationType } from "../common/notifications";

let client: LanguageClient;

export const activate = (context: ExtensionContext) => {
  client = createClient(context);

  console.log("zoom", workspace.getConfiguration("").get("window.zoomLevel"));

  const init = async () => {
    await client.onReady();
    client.onNotification(NotificationType.CRASH, () => {
      window.showWarningMessage(
        "Paperclip crashed - you'll need to reload this window."
      );
    });
    activatePreview(client, context);
  };

  init();

  client.start();
};

const createClient = (context: ExtensionContext) => {
  const serverPath = context.asAbsolutePath(
    path.join("lib", "server", "index.js")
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
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher("**/.clientrc")
    }
  };

  return new LanguageClient(
    "paperclipLanguageServer",
    "Paperclip Language Server",
    serverOptions,
    clientOptions
  );
};

export function deactivate(): Thenable<void> {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
