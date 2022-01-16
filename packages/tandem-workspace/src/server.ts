import { Logger, LogLevel, startHTTPServer } from "@tandem-ui/common";
import { SSHKeys } from "./controllers/ssh";
import * as http from "http";
import { Workspace } from "./controllers/workspace";
import { Project } from "./controllers/project";
import { Options } from "./core/options";
import { addRoutes } from "./routes";
import * as sockjs from "sockjs";
import { VFS } from "./controllers/vfs";
import { createEngineDelegate, EngineMode } from "@paperclip-ui/core";
import { EditorHost } from "@paperclip-ui/editor-engine/lib/host/host";
import {
  sockjsClientAdapter,
  sockjsServerRPCAdapter
} from "@paperclip-ui/common";

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

  constructor(readonly options: Options) {
    this._logger = new Logger(options.logLevel);
  }
  async start() {
    this._logger.info(`Workspace started 🚀`);
    const httpPort = this.options.http?.port || (await getPort());
    const [expressServer, httpServer] = startHTTPServer(httpPort, this._logger);
    this._httpServer = httpServer;
    const vfs = new VFS(this.options.autoSave, this._logger);

    const io = sockjs.createServer();
    io.installHandlers(httpServer, { prefix: "/rt" });

    const paperclipEngine = createEngineDelegate({
      mode: EngineMode.MultiFrame
    });
    const documentManager = new EditorHost(
      paperclipEngine,
      sockjsServerRPCAdapter(io)
    );

    const workspace = new Workspace(
      null,
      new SSHKeys(this._logger),
      vfs,
      this._logger,
      paperclipEngine,
      this.options,
      httpPort
    );

    addRoutes(expressServer, this._logger, workspace);

    // need to wait for http server to spin up. This is a really dumb approach.
    // pause option specifically for testing.
    if (this.options.pause !== false) {
      await new Promise(resolve => {
        setTimeout(resolve, 500);
      });
    }
  }
  stop() {
    this._httpServer.close();
  }
}
