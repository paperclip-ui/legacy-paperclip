// TODO: need to simplify event flow because it's a cluster F
import { createConnection, ProposedFeatures } from "vscode-languageserver";

import { PaperclipLanguageServerConnectionManager } from "./connection";
import { PaperclipDesignServer } from "./design-server";
import { DocumentManager } from "./documents";
import { LanguageRequestResolver } from "./resolver";
import { languageClientRPCAdapter } from "../../rpc";

export class PaperclipLanguageServer {
  constructor() {
    const connection = createConnection(ProposedFeatures.all);
    const documents = new DocumentManager();
    const designServer = new PaperclipDesignServer();

    const connectionManager = new PaperclipLanguageServerConnectionManager(
      designServer,
      documents,
      connection,
      {}
    );

    new LanguageRequestResolver(designServer, connection, documents);

    connectionManager.activate();

    connectionManager.onInitialize((info) => {
      designServer.start(info);
    });
  }
}

const server = new PaperclipLanguageServer();
