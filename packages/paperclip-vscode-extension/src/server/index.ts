// ref: https://github.com/microsoft/vscode-css-languageservice

import {
  Connection,
  TextDocuments,
  createConnection,
  ProposedFeatures,
  InitializedParams,
  TextDocumentSyncKind
} from "vscode-languageserver";

import { TextDocument } from "vscode-languageserver-textdocument";
import { Engine } from "paperclip";
import { createServices } from "./services";
import { VSCServiceBridge } from "./bridge";

const connection = createConnection(ProposedFeatures.all);

const documents: TextDocuments<any> = new TextDocuments(TextDocument);

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      // Tell the client that the server supports code completion
      // completionProvider: {
      //   resolveProvider: true
      // },
      documentLinkProvider: {
        resolveProvider: true
      },
      colorProvider: true,
      definitionProvider: true
    }
  };
});

const init = async (
  connection: Connection,
  documents: TextDocuments<TextDocument>
) => {
  // Paperclip engine for parsing & evaluating documents
  const engine = new Engine();

  // Language service for handling information about the document such as colors, references,
  // etc
  const services = createServices(engine);

  // Bridges language services to VSCode
  new VSCServiceBridge(engine, services, connection, documents);
};

connection.onInitialized((_params: InitializedParams) => {
  init(connection, documents);
});

documents.listen(connection);
connection.listen();
