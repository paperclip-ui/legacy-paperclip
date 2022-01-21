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
import { BaseEvent, Observable, Observer } from "@paperclip-ui/common";
import { createListener, fixFileUrlCasing } from "../../utils";
import { TextDocument } from "vscode-languageserver-textdocument";
import { LanguageRequestResolver } from "./resolver";
import { DocumentManager } from "./documents";
import { ExprSource } from "@paperclip-ui/utils";
import { ContentChange } from "@paperclip-ui/source-writer";
import { EventEmitter } from "stream";

export class PaperclipLanguageServerConnectionManager {
  private _workspaceFolders: WorkspaceFolder[];
  readonly events: Observable;
  private _em: EventEmitter;

  constructor(
    private _documents: DocumentManager,
    private _connection: Connection,
    readonly config: any
  ) {
    this._em = new EventEmitter();
  }
  activate() {
    this._connection = createConnection(ProposedFeatures.all);
    this._connection.onInitialize(this._onConnectionInitialize);
    this._connection.onInitialized(this._onConnectionInitialized);
    this._connection.onDidOpenTextDocument(this._onDidOpenTextDocument);
    this._connection.onDidCloseTextDocument(this._onDidCloseTextDocument);
    this._connection.onDidChangeTextDocument(this._onDidChangeTextDocument);
    this._connection.listen();
  }

  onInitialize(listener: (details: { workspaceFolders: string[] }) => void) {
    return createListener(this._em, "init", listener);
  }

  _onNotification = (event) => {
    this.events.dispatch(event);
  };

  private _onDidOpenTextDocument = ({
    textDocument,
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
    textDocument,
  }: DidCloseTextDocumentParams) => {
    const uri = fixFileUrlCasing(textDocument.uri);
    this._documents.removeDocument(uri);
  };

  private _onDidChangeTextDocument = ({
    contentChanges,
    textDocument,
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
          triggerCharacters: [".", "<", '"', "'", "{", ":", " ", "(", ">", "$"],
        },
        documentLinkProvider: {
          resolveProvider: true,
        },
        colorProvider: true,
        definitionProvider: true,
      },
    };
  };

  private _onConnectionInitialized = async () => {
    this._em.emit("init", { workspaceFolders: this._workspaceFolders });
  };
}
