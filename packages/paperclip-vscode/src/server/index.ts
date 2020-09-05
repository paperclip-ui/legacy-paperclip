// ref: https://github.com/microsoft/vscode-css-languageservice

import {
  Connection,
  createConnection,
  ProposedFeatures,
  InitializedParams,
  TextDocumentSyncKind,
  InitializeParams
} from "vscode-languageserver";

import * as fs from "fs";
import * as url from "url";
import { Engine } from "paperclip";
import { createServices } from "./services";
import { VSCServiceBridge } from "./bridge";
import { Crash } from "../common/notifications";
import {
  createEngine,
  keepEngineInSyncWithFileSystem,
  PaperclipSourceWatcher,
  findPCConfigUrl
} from "paperclip";

const connection = createConnection(ProposedFeatures.all);

connection.onInitialize((params: InitializeParams) => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that the server supports code completion
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: [".", "<", '"', "'", "{", ":", " ", "(", ">", "$"]
      },
      documentLinkProvider: {
        resolveProvider: true
      },
      colorProvider: true,
      definitionProvider: true
    }
  };
});

const init = async (connection: Connection) => {
  // Paperclip engine for parsing & evaluating documents
  const engine = await createEngine({}, () => {
    connection.sendNotification(...new Crash({}).getArgs());
  });

  watchPaperclipSources(engine);

  // Language service for handling information about the document such as colors, references,
  // etc
  const services = createServices(engine);

  // Bridges language services to VSCode
  new VSCServiceBridge(engine, services, connection);
};

const watchPaperclipSources = (engine: Engine, cwd: string = process.cwd()) => {
  // TODO - may eventually want to watch for this -- something like a config watcher?
  const configUrl = findPCConfigUrl(fs)(cwd);

  if (configUrl) {
    const config = JSON.parse(fs.readFileSync(new url.URL(configUrl), "utf8"));

    const watcher = new PaperclipSourceWatcher(config, cwd);
    keepEngineInSyncWithFileSystem(watcher, engine);
  }
};

connection.onInitialized((_params: InitializedParams) => {
  init(connection);
});

connection.listen();
