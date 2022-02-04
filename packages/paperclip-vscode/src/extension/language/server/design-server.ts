import { RPCClientAdapter } from "@paperclip-ui/common";

// eslint-disable-next-line
const getPort = require("get-port");
import {
  start as startWorkspace,
  Workspace,
  Project,
  Server,
} from "@tandem-ui/workspace/lib/server";
import { LogLevel } from "@paperclip-ui/common";
import { ExprSource } from "@paperclip-ui/utils";
import { EventEmitter } from "events";
import { createListener } from "../../utils";
import { DesignServerStartedInfo } from "../../channels";

export class PaperclipDesignServer {
  private _workspace: Workspace;
  private _project: Project;
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

  getCurrentProject() {
    return this._workspace.getProjectById(this._project.getId());
  }

  getWorkspace() {
    return this._workspace;
  }

  onRevealSourceRequest = (listener: (source: ExprSource) => void) => {
    return createListener(this._em, "revealSourceRequest", listener);
  };

  private _revealSource = (source: ExprSource) => {
    this._em.emit("revealSourceRequest", source);
  };
}
