// TODO: need to simplify event flow because it's a cluster F
import {
  Connection,
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
  InitializeParams,
  WorkspaceFolder,
  DidChangeTextDocumentParams,
  DidOpenTextDocumentParams,
  DidCloseTextDocumentParams,
} from "vscode-languageserver";

import { Observable } from "@paperclip-ui/common";
import { PaperclipLanguageServerConnectionManager } from "./connection";
import { PaperclipDesignServer } from "./design-server";
import { DocumentManager } from "./documents";
import { LanguageRequestResolver } from "./resolver";
import { languageClientRPCAdapter } from "../../rpc";
import { connect } from "http2";

export class PaperclipLanguageServer {
  constructor() {
    const connection = createConnection(ProposedFeatures.all);
    const rpcClient = languageClientRPCAdapter(connection);
    const documents = new DocumentManager();
    const connectionManager = new PaperclipLanguageServerConnectionManager(
      documents,
      connection,
      {}
    );

    const designServer = new PaperclipDesignServer(
      rpcClient,
      connectionManager
    );

    const requestResolver = new LanguageRequestResolver(
      designServer,
      connection,
      documents
    );

    connectionManager.activate();
  }
}

const server = new PaperclipLanguageServer();
