import { RPCClientAdapter } from "@paperclip-ui/common";

// eslint-disable-next-line
const getPort = require("get-port");
import {
  start as startWorkspace,
  Workspace,
  Project,
  Server,
} from "@tandem-ui/workspace/lib/server";
import { ExprSource } from "@paperclip-ui/utils";
import { LogLevel } from "@tandem-ui/common";
import { EventEmitter } from "events";
import { DesignServerStartedInfo, revealSourceChannel } from "../../channels";
import { createListener } from "../../utils";

const UPDATE_THROTTLE = 10;

export class PaperclipDesignServer {
  private _workspace: Workspace;
  private _project: Project;
  private _latestDocuments: Record<string, string>;
  private _server: Server;
  private _port: number;
  private _em: EventEmitter;

  constructor() {
    this._em = new EventEmitter();
  }

  onStarted(listener: (info: DesignServerStartedInfo) => void) {
    return createListener(this._em, "started", listener);
  }

  public start = async ({ workspaceFolders }) => {
    const server = (this._server = await startWorkspace({
      logLevel: LogLevel.All,
      http: {
        port: (this._port = await getPort()),
      },
      project: {
        installDependencies: false,
      },
      adapter: {
        revealSource: this._revealSource,
      },
    }));

    this._workspace = server.getWorkspace();

    const cwd = workspaceFolders[0].uri;
    this._project = await this._workspace.start(cwd);
    this._project.commitAndPushChanges;
    this._em.emit("started", {
      projectId: this._project.getId(),
      httpPort: this._port,
    } as DesignServerStartedInfo);
  };

  getEngine() {
    return this._server.getEngine();
  }

  onRevealSourceRequest = (listener: (source: ExprSource) => void) => {
    return createListener(this._em, "revealSourceRequest", listener);
  };

  private _revealSource = (source: ExprSource) => {
    this._em.emit("revealSourceRequest", source);
  };

  // private _onTextDocumentOpened = ({ uri, content }: TextDocumentOpened) => {
  //   // this will happen if text document is open on vscode open
  //   if (!this._project) {
  //     return;
  //   }
  //   this._project.updatePCContent(uri, content);
  // };
  // private _onTextDocumentChanged = ({ uri, content }: TextDocumentChanged) => {
  //   if (!this._project) {
  //     return;
  //   }

  //   this._latestDocuments = {
  //     [uri]: content,
  //   };

  //   // throttle for updating doc to ensure that the engine doesn't
  //   // get flooded
  //   setTimeout(() => {
  //     const changes = this._latestDocuments;
  //     this._latestDocuments = {};
  //     for (const uri in changes) {
  //       this._project.updatePCContent(uri, changes[uri]);
  //     }
  //   }, UPDATE_THROTTLE);
  // };

  // handleEvent = eventHandlers({
  //   [TextDocumentOpened.TYPE]: this._onTextDocumentOpened,
  //   [TextDocumentChanged.TYPE]: this._onTextDocumentChanged,
  // });
}
