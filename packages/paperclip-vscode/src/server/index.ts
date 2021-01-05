// ref: https://github.com/microsoft/vscode-css-languageservice

import {
  Connection,
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
  InitializeParams,
  WorkspaceFolder,
  InitializeResult
} from "vscode-languageserver";

import * as fs from "fs";
import * as url from "url";
import { createServices } from "./services";
import { VSCServiceBridge } from "./bridge";
import { Crash, DevServerInitialized } from "../common/notifications";
import {
  createEngineDelegate,
  keepEngineInSyncWithFileSystem2,
  PaperclipSourceWatcher,
  findPCConfigUrl,
  EngineMode,
  EngineDelegate
} from "paperclip";

import { startServer } from "paperclip-visual-editor";

class Server {
  private _connection: Connection;
  private _workspaceFolders: WorkspaceFolder[];

  start() {
    this._connection = createConnection(ProposedFeatures.all);
    this._connection.onInitialize(this._onConnectionInitialize);
    this._connection.onInitialized(this._onConnectionInitialized);
    this._connection.listen();
  }

  private _onConnectionInitialize = (
    params: InitializeParams
  ): InitializeResult => {
    this._workspaceFolders = params.workspaceFolders;
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
  };

  private _onConnectionInitialized = async () => {
    const engine = await createEngineDelegate(
      { mode: EngineMode.MultiFrame },
      () => {
        this._connection.sendNotification(...new Crash({}).getArgs());
      }
    );

    watchPaperclipSources(engine);

    console.log(this._workspaceFolders);

    const devServerInfo = await startServer({
      engine,
      localResourceRoots: this._workspaceFolders.map(({ uri }) => {
        return url.fileURLToPath(uri);
      })
    });

    this._connection.sendNotification(
      ...new DevServerInitialized({ port: devServerInfo.port }).getArgs()
    );

    // Language service for handling information about the document such as colors, references,
    // etc
    const services = createServices(engine);

    // Bridges language services to VSCode
    new VSCServiceBridge(engine, services, this._connection);
  };
}

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

const server = new Server();
server.start();
