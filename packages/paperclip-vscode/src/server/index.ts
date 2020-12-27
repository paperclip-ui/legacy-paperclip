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
import { createServices } from "./services";
import { VSCServiceBridge } from "./bridge";
import { Crash } from "../common/notifications";
import {
  createEngineDelegate,
  keepEngineInSyncWithFileSystem2,
  PaperclipSourceWatcher,
  findPCConfigUrl,
  EngineMode,
  EngineDelegate
} from "paperclip";

import { startServer } from "paperclip-visual-editor";

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
  // PaperclicreateEngineDelegatep engine for parsing & evaluating documents
  const engine = await createEngineDelegate(
    { mode: EngineMode.MultiFrame },
    () => {
      connection.sendNotification(...new Crash({}).getArgs());
    }
  );

  // const visualEditorServerResult = await startServer({ engine, localResourceRoots: [] });
  // console.log(visualEditorServerResult);

  watchPaperclipSources(engine);

  // Language service for handling information about the document such as colors, references,
  // etc
  const services = createServices(engine);

  // Bridges language services to VSCode
  new VSCServiceBridge(engine, services, connection);
};

const watchPaperclipSources = (
  engine: EngineDelegate,
  cwd: string = process.cwd()
) => {
  // TODO - may eventually want to watch for this -- something like a config watcher?
  const configUrl = findPCConfigUrl(fs)(cwd);

  if (configUrl) {
    const config = JSON.parse(fs.readFileSync(new url.URL(configUrl), "utf8"));

    const watcher = new PaperclipSourceWatcher(config, cwd);
    keepEngineInSyncWithFileSystem2(watcher, engine);
  }
};

connection.onInitialized((_params: InitializedParams) => {
  init(connection);
});

connection.listen();
