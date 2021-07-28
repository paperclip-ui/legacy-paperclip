import getPort from "get-port";
import { BaseEvent, eventProcesses } from "../core/events";
import sockjs from "sockjs";
import express from "express";
import path from "path";
import URL from "url";
import { ServerKernel } from "../core/kernel";
import { ServiceInitialized } from "../core/service-manager";

type Options = {
  defaultPort: number;
  localResourceRoots: string[];
};

export enum HTTPServerEventType {
  SOCK_JS_CONNECTION = "HTTPServerEventType/SOCK_JS_CONNECTION"
}

export class SockJSConnection implements BaseEvent {
  static TYPE = "HTTPServerEventType/SOCK_JS_CONNECTION";
  readonly type = SockJSConnection.TYPE;
  constructor(readonly connection: sockjs.Connection) {}
}

export const httpServer = (options: Options) => ({ connect: connect(options) });

const connect = (options: Options) => async (kernel: ServerKernel) => {
  kernel.events.observe({
    onEvent: eventProcesses({
      [ServiceInitialized.TYPE]: init(options, kernel)
    })
  });
};

const init = (
  { defaultPort, localResourceRoots }: Options,
  { events }: ServerKernel
) => async () => {
  const port = await getPort({ port: defaultPort });

  const io = sockjs.createServer();
  io.on("connection", conn => {
    events.dispatch(new SockJSConnection(conn));
  });

  const app = express();

  const server = app.listen(port);
  io.installHandlers(server, { prefix: "/rt" });

  // TODO - move these handlers to
  const distHandler = express.static(path.join(__dirname, "..", "..", "dist"));

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

  return {
    dispose() {
      server.close();
    }
  };
};
