import {
  Connection,
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
  InitializeParams,
  WorkspaceFolder,
  InitializeResult,
  DidChangeTextDocumentParams,
  DidOpenTextDocumentParams
} from "vscode-languageserver";
import { Observable, Observer } from "paperclip-common";
import { $$EVENT } from "./constants";
import { lockChangesChannel } from "../../channels";
import { fixFileUrlCasing } from "../../utils";
import { Initialized, TextDocumentChanged, TextDocumentOpened } from "./events";
import {
  TextDocument,
  TextDocumentContentChangeEvent
} from "vscode-languageserver-textdocument";

export class PaperclipLanguageServerConnection implements Observer {
  private _connection: Connection;
  private _documents: Record<string, TextDocument>;
  private _workspaceFolders: WorkspaceFolder[];
  readonly events: Observable;

  constructor(readonly config: any) {
    this.events = new Observable();
    this._documents = {};
  }
  activate() {
    this._connection = createConnection(ProposedFeatures.all);
    this._connection.onInitialize(this._onConnectionInitialize);
    this._connection.onInitialized(this._onConnectionInitialized);
    this._connection.onDidChangeConfiguration(this._onDidChangeConfiguration);
    this._connection.onDidOpenTextDocument(this._onDidOpenTextDocument);
    this._connection.onDidChangeTextDocument(this._onDidChangeTextDocument);
    this._connection.onNotification($$EVENT, this._onNotification);
    this._connection.listen();
  }

  handleEvent(event) {
    if (event.toJSON || event.public) {
      this._connection.sendNotification(
        $$EVENT,
        event.toJSON ? event.toJSON() : event
      );
    }
  }

  _onNotification = event => {
    this.events.dispatch(event);
  };

  private _onDidOpenTextDocument = ({
    textDocument
  }: DidOpenTextDocumentParams) => {
    const uri = fixFileUrlCasing(textDocument.uri);
    this._documents[uri] = TextDocument.create(
      uri,
      textDocument.languageId,
      textDocument.version,
      textDocument.text
    );
    this.events.dispatch(
      new TextDocumentOpened(uri, this._documents[uri].getText())
    );
  };

  private _onDidChangeTextDocument = ({
    contentChanges,
    textDocument
  }: DidChangeTextDocumentParams) => {
    const uri = fixFileUrlCasing(textDocument.uri);

    const newDocument = TextDocument.update(
      this._documents[uri],
      contentChanges,
      this._documents[uri].version + 1
    );
    this._documents[uri] = newDocument;

    this.events.dispatch(new TextDocumentChanged(uri, newDocument.getText()));
  };

  private _onConnectionInitialize = (params: InitializeParams) => {
    this._workspaceFolders = params.workspaceFolders || [];

    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental as any
        // Tell the client that the server supports code completion
        // completionProvider: {
        //   resolveProvider: true,
        //   triggerCharacters: [".", "<", '"', "'", "{", ":", " ", "(", ">", "$"]
        // },
        // documentLinkProvider: {
        //   resolveProvider: true
        // },
        // colorProvider: true,
        // definitionProvider: true
      }
    };
  };

  private _onDidChangeConfiguration = ({ settings: { credentials } }) => {};

  private _onConnectionInitialized = async cd => {
    this.events.dispatch(new Initialized(this._workspaceFolders));
  };
}
