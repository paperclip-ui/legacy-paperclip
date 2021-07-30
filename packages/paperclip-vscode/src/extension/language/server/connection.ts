import {
  Connection,
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
  InitializeParams,
  WorkspaceFolder,
  InitializeResult
} from "vscode-languageserver";
import { Observable } from "paperclip-common";

export class Initialized {
  static TYPE = "PaperclipLanguageServerConnection/Initialized";
  readonly type = Initialized.TYPE;
  constructor(readonly workspaceFolders: WorkspaceFolder[]) {}
}

export class PaperclipLanguageServerConnection {
  private _connection: Connection;
  private _workspaceFolders: WorkspaceFolder[];
  readonly events: Observable;

  constructor(readonly config: any) {
    this.events = new Observable();
  }
  activate() {
    this._connection = createConnection(ProposedFeatures.all);
    this._connection.onInitialize(this._onConnectionInitialize);
    this._connection.onInitialized(this._onConnectionInitialized);
    this._connection.onDidChangeConfiguration(this._onDidChangeConfiguration);
    this._connection.listen();
  }

  _onConnectionInitialize = (params: InitializeParams) => {
    this._workspaceFolders = params.workspaceFolders || [];

    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental as any,
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

  private _onDidChangeConfiguration = ({ settings: { credentials } }) => {};

  private _onConnectionInitialized = async cd => {
    this.events.dispatch(new Initialized(this._workspaceFolders));
  };
}
