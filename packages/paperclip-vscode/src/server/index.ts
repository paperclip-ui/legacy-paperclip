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
import {
  devServerInitialized,
  devServerChanged,
  Action,
  $$ACTION_NOTIFICATION
} from "../common/actions";
import {
  startServer,
  Action as VsualEditorAction,
  ServerAction,
  ExternalAction
} from "paperclip-visual-editor";

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

  private _dispatch(action: Action) {
    this._connection.sendNotification($$ACTION_NOTIFICATION, action);
  }

  private _onConnectionInitialized = async () => {
    const { port, engine, dispatch } = await startServer({
      localResourceRoots: this._workspaceFolders.map(({ uri }) => {
        return url.fileURLToPath(uri);
      }),
      readonly: false,
      emit: (action: ServerAction) => {
        this._dispatch(devServerChanged(action));
      }
    });

    this._connection.onNotification(
      $$ACTION_NOTIFICATION,
      (action: ExternalAction) => {
        dispatch(action);
      }
    );

    this._dispatch(devServerInitialized({ port }));

    // Language service for handling information about the document such as colors, references,
    // etc
    const services = createServices(engine);

    // Bridges language services to VSCode
    new VSCServiceBridge(engine, services, this._connection);
  };
}

const server = new Server();
server.start();
