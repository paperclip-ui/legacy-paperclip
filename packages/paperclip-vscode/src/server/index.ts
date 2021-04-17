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

import * as url from "url";
import { createServices } from "./services";
import { VSCServiceBridge } from "./bridge";
import {
  devServerInitialized,
  devServerChanged,
  Action,
  $$ACTION_NOTIFICATION,
  goosefraba,
  enhanceCalmRequested,
  Goosefraba,
  ActionType
} from "../common/actions";
import {
  startServer,
  Action as VsualEditorAction,
  ServerAction,
  ExternalAction,
  configChanged
} from "paperclip-designer";
class Server {
  private _connection: Connection;
  private _workspaceFolders: WorkspaceFolder[];
  private _dispatchDevServer: (action: any) => any;
  constructor(readonly config: any) {}

  start() {
    this._connection = createConnection(ProposedFeatures.all);
    this._connection.onInitialize(this._onConnectionInitialize);
    this._connection.onInitialized(this._onConnectionInitialized);
    this._connection.onDidChangeConfiguration(this._onDidChangeConfiguration);
    this._connection.listen();
  }

  private _onDidChangeConfiguration = ({ settings: { credentials } }) => {
    this._dispatchDevServer(
      configChanged({
        browserstackCredentials: {
          username: credentials.browserstackUsername,
          password: credentials.browserstackPassword
        }
      })
    );
  };

  private _onConnectionInitialize = (
    params: InitializeParams
  ): InitializeResult => {
    this._workspaceFolders = params.workspaceFolders || [];

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

  private _onConnectionInitialized = async cd => {
    console.log("INIT", this._workspaceFolders);
    const { port, engine, dispatch } = await startServer({
      localResourceRoots: this._workspaceFolders.map(({ uri }) => {
        return url.fileURLToPath(uri);
      }),
      readonly: false,
      openInitial: false,
      emit: (action: ServerAction) => {
        this._dispatch(devServerChanged(action));
      }
    });
    console.log("INNNN");

    this._dispatchDevServer = dispatch;

    this._connection.onNotification(
      $$ACTION_NOTIFICATION,
      (action: ExternalAction | Goosefraba) => {
        dispatch(action as ExternalAction);
        if (action.type === ActionType.GOOSEFRABA) {
          bridge.goAheadNowYaHear();
        }
      }
    );

    this._dispatch(devServerInitialized({ port }));

    // Language service for handling information about the document such as colors, references,
    // etc
    const services = createServices(engine);

    // Bridges language services to VSCode
    const bridge = new VSCServiceBridge(
      engine,
      services,
      this._connection,
      () => {
        this._dispatch(enhanceCalmRequested(null));
      }
    );
  };
}

const server = new Server({});
server.start();
