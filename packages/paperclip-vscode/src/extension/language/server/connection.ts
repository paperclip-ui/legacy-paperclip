import {
  Connection,
  TextDocumentSyncKind,
  InitializeParams,
  WorkspaceFolder,
  DidChangeTextDocumentParams,
  DidOpenTextDocumentParams,
  DidCloseTextDocumentParams,
} from "vscode-languageserver";
import { createListener, fixFileUrlCasing } from "../../utils";
import { TextDocument } from "vscode-languageserver-textdocument";
import { DocumentManager } from "./documents";
import { EventEmitter } from "stream";
import { languageClientRPCAdapter } from "../../rpc";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import {
  designServerStartedChannel,
  DesignServerStartedInfo,
  revealSourceChannel,
} from "../../channels";
import { PaperclipDesignServer } from "./design-server";

// TODO - need better SRP here, this class is doing too much
export class PaperclipLanguageServerConnectionManager {
  private _designServerStarted: ReturnType<typeof designServerStartedChannel>;
  private _revealSource: ReturnType<typeof revealSourceChannel>;
  private _workspaceFolders: WorkspaceFolder[];
  private _em: EventEmitter;

  constructor(
    private _designServer: PaperclipDesignServer,
    private _connection: Connection,
    private _documents: DocumentManager,
    readonly config: any
  ) {
    this._em = new EventEmitter();
  }
  activate() {
    this._connection.onInitialize(this._onConnectionInitialize);
    this._connection.onInitialized(this._onConnectionInitialized);
    this._connection.onDidOpenTextDocument(this._onDidOpenTextDocument);
    this._connection.onDidCloseTextDocument(this._onDidCloseTextDocument);
    this._connection.onDidChangeTextDocument(this._onDidChangeTextDocument);

    const adapter = languageClientRPCAdapter(this._connection);
    this._designServerStarted = designServerStartedChannel(adapter);
    this._revealSource = revealSourceChannel(adapter);

    this._designServer.onStarted(this._onDesignServerStarted);

    this._designServer.onRevealSourceRequest((info) => {
      console.log(`On reveal source request`);
      this._revealSource.call(info);
    });

    this._connection.listen();
  }

  onInitialize(listener: (details: { workspaceFolders: string[] }) => void) {
    return createListener(this._em, "init", listener);
  }

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

  private _onDesignServerStarted = async (info: DesignServerStartedInfo) => {
    this._designServerStarted.call(info);
  };

  private _onConnectionInitialize = (params: InitializeParams) => {
    this._workspaceFolders = params.workspaceFolders || [];

    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental as any,
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
