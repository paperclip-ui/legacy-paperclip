import {
  eventHandlers,
  Observable,
  Observer,
  RPCClientAdapter,
} from "@paperclip-ui/common";

// eslint-disable-next-line
const getPort = require("get-port");
import { TextDocumentChanged, TextDocumentOpened } from "./events";
import {
  start as startWorkspace,
  Workspace,
  Project,
} from "@tandem-ui/workspace/lib/server";
import { ExprSource } from "@paperclip-ui/utils";
import { LogLevel } from "@tandem-ui/common";
import EventEmitter from "events";
import { DesignServerStartedInfo, revealSourceChannel } from "../../channels";
import { PaperclipLanguageServerConnectionManager } from "./connection";
import { createListener } from "../../utils";

const UPDATE_THROTTLE = 10;

class WorkspaceAadapter {
  private _revealSourceChannel: ReturnType<typeof revealSourceChannel>;
  constructor(private _rpcClientAdapter: RPCClientAdapter) {
    this._revealSourceChannel = revealSourceChannel(this._rpcClientAdapter);
  }
  revealSource(source: ExprSource) {
    return this._revealSourceChannel.call(source);
  }
}

export class PaperclipDesignServer {
  private _workspace: Workspace;
  private _project: Project;
  private _windowFocused: boolean;
  private _latestDocuments: Record<string, string>;
  private _updatingDocuments: boolean;
  private _port: number;
  private _em: EventEmitter;

  constructor(
    private _connection: RPCClientAdapter,
    private _connectionManager: PaperclipLanguageServerConnectionManager
  ) {
    this._em = new EventEmitter();
    this._connectionManager.onInitialize(this._onConnectionInit);
  }

  onStarted(listener: (info: DesignServerStartedInfo) => void) {
    return createListener(this._em, "started", listener);
  }

  private _start = async ({ workspaceFolders }) => {
    const server = await startWorkspace({
      logLevel: LogLevel.All,
      http: {
        port: (this._port = await getPort()),
      },
      project: {
        installDependencies: false,
      },
      adapter: new WorkspaceAadapter(this._connection),
    });

    this._workspace = server.getWorkspace();

    const cwd = workspaceFolders[0].uri;
    this._project = await this._workspace.start(cwd);
    this._project.commitAndPushChanges;
    this._em.emit("started", {
      projectId: this._project.getId(),
      httpPort: this._port,
    } as DesignServerStartedInfo);
  };

  private _onConnectionInit(details) {
    this._start(details);
  }

  private _onTextDocumentOpened = ({ uri, content }: TextDocumentOpened) => {
    // this will happen if text document is open on vscode open
    if (!this._project) {
      return;
    }
    this._project.updatePCContent(uri, content);
  };
  private _onTextDocumentChanged = ({ uri, content }: TextDocumentChanged) => {
    if (this._windowFocused || !this._project) {
      return;
    }

    this._updatingDocuments = true;
    this._latestDocuments = {
      [uri]: content,
    };

    // throttle for updating doc to ensure that the engine doesn't
    // get flooded
    setTimeout(() => {
      const changes = this._latestDocuments;
      this._latestDocuments = {};
      for (const uri in changes) {
        this._project.updatePCContent(uri, changes[uri]);
      }
      this._updatingDocuments = false;
    }, UPDATE_THROTTLE);
  };

  handleEvent = eventHandlers({
    [TextDocumentOpened.TYPE]: this._onTextDocumentOpened,
    [TextDocumentChanged.TYPE]: this._onTextDocumentChanged,
  });
}
