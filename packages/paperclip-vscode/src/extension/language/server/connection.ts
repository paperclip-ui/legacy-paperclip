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
  TextEdit
} from "vscode-languageserver";
import { BaseEvent, Observable, Observer } from "@paperclipui/common";
import { $$EVENT } from "./constants";
import { fixFileUrlCasing } from "../../utils";
import { Initialized, TextDocumentChanged, TextDocumentOpened } from "./events";
import { TextDocument } from "vscode-languageserver-textdocument";
import { LanguageRequestResolver } from "./resolver";

export class DocumentManager {
  private _documents: Record<string, TextDocument>;
  readonly events: Observable;
  constructor() {
    this._documents = {};
    this.events = new Observable();
  }
  getDocument(uri: string) {
    return this._documents[uri];
  }
  updateDocument(uri: string, document: TextDocument) {
    const exists = this._documents[uri] != null;

    this._documents[uri] = document;

    if (exists) {
      this.events.dispatch(new TextDocumentChanged(uri, document.getText()));
    } else {
      this.events.dispatch(new TextDocumentOpened(uri, document.getText()));
    }
  }
  appleDocumentEdits(uri: string, edits: TextEdit[]) {
    const text = TextDocument.applyEdits(this._documents[uri], edits);
    this.events.dispatch(new TextDocumentChanged(uri, text));
  }
  removeDocument(uri: string) {
    delete this._documents[uri];
  }
}

export class PaperclipLanguageServerConnection implements Observer {
  private _connection: Connection;
  private _documents: DocumentManager;
  private _workspaceFolders: WorkspaceFolder[];
  private _requestResolver: LanguageRequestResolver;
  readonly events: Observable;

  constructor(readonly config: any) {
    this.events = new Observable();
    this._documents = new DocumentManager();
    this.events.source(this._documents.events);
  }
  activate() {
    this._connection = createConnection(ProposedFeatures.all);
    this._requestResolver = new LanguageRequestResolver(
      this._connection,
      this._documents
    );
    this._connection.onInitialize(this._onConnectionInitialize);
    this._connection.onInitialized(this._onConnectionInitialized);
    this._connection.onDidOpenTextDocument(this._onDidOpenTextDocument);
    this._connection.onDidCloseTextDocument(this._onDidCloseTextDocument);
    this._connection.onDidChangeTextDocument(this._onDidChangeTextDocument);
    this._connection.onNotification($$EVENT, this._onNotification);
    this._connection.listen();
  }

  handleEvent(event: BaseEvent) {
    if (event["toJSON"] || event["public"]) {
      this._connection.sendNotification(
        $$EVENT,
        event["toJSON"] ? event["toJSON"]() : event
      );
    }

    this._requestResolver.handleEvent(event);
  }

  _onNotification = event => {
    this.events.dispatch(event);
  };

  private _onDidOpenTextDocument = ({
    textDocument
  }: DidOpenTextDocumentParams) => {
    const uri = fixFileUrlCasing(textDocument.uri);
    this._documents.updateDocument(
      uri,
      TextDocument.create(
        uri,
        textDocument.languageId,
        textDocument.version,
        textDocument.text
      )
    );
  };

  private _onDidCloseTextDocument = ({
    textDocument
  }: DidCloseTextDocumentParams) => {
    const uri = fixFileUrlCasing(textDocument.uri);
    this._documents.removeDocument(uri);
  };

  private _onDidChangeTextDocument = ({
    contentChanges,
    textDocument
  }: DidChangeTextDocumentParams) => {
    const uri = fixFileUrlCasing(textDocument.uri);

    const oldDocument = this._documents.getDocument(uri);

    const newDocument = TextDocument.update(
      oldDocument,
      contentChanges,
      oldDocument.version + 1
    );

    this._documents.updateDocument(uri, newDocument);
  };

  private _onConnectionInitialize = (params: InitializeParams) => {
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

  private _onConnectionInitialized = async cd => {
    this.events.dispatch(new Initialized(this._workspaceFolders));
  };
}
