import { startHTTPServer } from "@tandem-ui/common";
import { SSHKeys } from "./controllers/ssh";
import * as http from "http";
import { Workspace } from "./controllers/workspace";
import { Project } from "./controllers/project";
import { Options } from "./core/options";
import { addRoutes } from "./routes";
import { WebSocketServer } from "ws";
import { VFS } from "./controllers/vfs";
import {
  loadEngineDelegate,
  EngineDelegate,
  EngineMode,
} from "@paperclip-ui/core";
import { EditorHost } from "@paperclip-ui/editor-engine/lib/host/host";
import { Logger, wsServerAdapter } from "@paperclip-ui/common";
import { RPC } from "./controllers/rpc";
import { Designer } from "./controllers/designer";
import { PaperclipLanguageService } from "@paperclip-ui/language-service";

const getPort = require("get-port");

export { Workspace, Project };

export const start = async (options: Options) => {
  const server = new Server(options);
  await server.start();
  return server;
};

export class Server {
  private _logger: Logger;
  private _httpServer: http.Server;
  private _port: number;
  private _workspace: Workspace;
  private _engine: EngineDelegate;

  constructor(readonly options: Options) {
    this._logger = new Logger(options.logLevel);
  }
  getPort() {
    return this._port;
  }
  getWorkspace() {
    return this._workspace;
  }
  async start() {
    this._logger.info(`Workspace started 🚀`);
    let httpServer;
    let expressServer;
    let httpPort;

    if (this.options.useHttpServer !== false) {
      httpPort = this._port = this.options.http?.port || (await getPort());
      [expressServer, httpServer] = startHTTPServer(httpPort, this._logger);
      this._httpServer = httpServer;
    }

    this._httpServer = httpServer;

    const vfs = new VFS(this.options.autoSave, this._logger);

    let rpcServer = this.options.rpcServer;
    if (!rpcServer) {
      const ws = new WebSocketServer({ path: "/ws", server: httpServer });
      rpcServer = wsServerAdapter(ws);
    }

    const workspace = (this._workspace = new Workspace(
      null,
      new SSHKeys(this._logger),
      vfs,
      this._logger,
      rpcServer,
      this.options,
      httpPort
    ));

    if (expressServer) {
      new Designer(expressServer);
      addRoutes(expressServer, this._logger, workspace);
    }
    new RPC(rpcServer, workspace, vfs, this._logger, this._port, this.options);

    // need to wait for http server to spin up. This is a really dumb approach.
    // pause option specifically for testing.
    if (this.options.pause !== false) {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    }
  }

  stop() {
    if (this._httpServer) {
      this._httpServer.close();
    }
    this._workspace.dispose();
  }
}
