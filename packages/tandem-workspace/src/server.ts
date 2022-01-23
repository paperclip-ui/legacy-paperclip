import { Logger, startHTTPServer } from "@tandem-ui/common";
import * as url from "url";
import { SSHKeys } from "./controllers/ssh";
import * as http from "http";
import { Workspace } from "./controllers/workspace";
import { Project } from "./controllers/project";
import { Options } from "./core/options";
import { addRoutes } from "./routes";
import { WebSocketServer } from "ws";
import { VFS } from "./controllers/vfs";
import {
  createEngineDelegate,
  EngineDelegate,
  EngineMode,
} from "@paperclip-ui/core";
import { EditorHost } from "@paperclip-ui/editor-engine/lib/host/host";
import { wsAdapter, wsServerAdapter } from "@paperclip-ui/common";
import { RPC } from "./controllers/rpc";
import { Designer } from "./controllers/designer";

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
  getEngine() {
    return this._engine;
  }
  async start() {
    this._logger.info(`Workspace started 🚀`);
    const httpPort = (this._port =
      this.options.http?.port || (await getPort()));
    const [expressServer, httpServer] = startHTTPServer(httpPort, this._logger);
    this._httpServer = httpServer;
    const vfs = new VFS(this.options.autoSave, this._logger);

    const ws = new WebSocketServer({ path: "/ws", server: httpServer });
    const sockServer = wsServerAdapter(ws);

    const paperclipEngine = (this._engine = createEngineDelegate({
      mode: EngineMode.MultiFrame,
    }));

    const documentManager = await EditorHost.start(paperclipEngine, sockServer);

    const workspace = (this._workspace = new Workspace(
      null,
      new SSHKeys(this._logger),
      vfs,
      this._logger,
      paperclipEngine,
      this.options,
      httpPort
    ));

    new Designer(expressServer);

    addRoutes(expressServer, this._logger, workspace);
    new RPC(
      sockServer,
      workspace,
      paperclipEngine,
      vfs,
      this._logger,
      this._port,
      this.options
    );

    // need to wait for http server to spin up. This is a really dumb approach.
    // pause option specifically for testing.
    if (this.options.pause !== false) {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    }
  }

  stop() {
    this._httpServer.close();
    this._workspace.dispose();
  }
}
