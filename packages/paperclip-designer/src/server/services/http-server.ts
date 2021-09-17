import getPort from "get-port";
import {
  BaseEvent,
  eventProcesses,
  ServiceInitialized,
  ServerKernel
} from "paperclip-common";
import sockjs from "sockjs";
import express from "express";
import path from "path";
import URL from "url";
import * as http from "http";

export type ExistingServer = { express: express.Express; http: http.Server };

type Options = {
  defaultPort: number;
  localResourceRoots: string[];
  server?: ExistingServer;
};

export class SockJSConnection implements BaseEvent {
  static TYPE = "HTTPServerEventType/SOCK_JS_CONNECTION";
  readonly type = SockJSConnection.TYPE;
  constructor(readonly connection: sockjs.Connection) {}
}

export class HTTPServerStarted implements BaseEvent {
  static TYPE = "HTTPServerEventType/SERVER_STARTED";
  readonly type = HTTPServerStarted.TYPE;
  constructor(readonly port: number) {}
  toJSON() {
    return { type: this.type, port: this.port };
  }
}

export const httpServer = (options: Options) => async (
  kernel: ServerKernel
) => {
  kernel.events.observe({
    handleEvent: eventProcesses({
      [ServiceInitialized.TYPE]: init(options, kernel)
    })
  });
};

const init = (
  { defaultPort, localResourceRoots, server: existingServer }: Options,
  { events }: ServerKernel
) => async () => {
  const port = await getPort({ port: defaultPort });

  const io = sockjs.createServer();
  io.on("connection", conn => {
    events.dispatch(new SockJSConnection(conn));
  });

  const app = existingServer ? existingServer.express : express();

  const server = existingServer ? existingServer.http : app.listen(port);
  io.installHandlers(server, { prefix: "/rt" });

  // TODO - move these handlers to
  const distHandler = express.static(
    path.join(__dirname, "..", "..", "..", "dist")
  );

  // cors to enable iframe embed
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  app.use(distHandler);
  app.use("/canvas", distHandler);
  app.use("/all", distHandler);
  app.use("/file/*", (req, res, next) => {
    const filePath = URL.fileURLToPath(
      decodeURIComponent(path.normalize(req.params["0"]))
    );

    const found = localResourceRoots.some(
      root => filePath.toLowerCase().indexOf(root.toLowerCase()) === 0
    );
    if (!found) {
      return next();
    }
    res.sendFile(filePath);
  });

  events.dispatch(new HTTPServerStarted(port));

  return {
    dispose() {
      server.close();
    }
  };
};
