import * as path from "path";
import * as fs from "fs";
import * as chokidar from "chokidar";
import http from "http";
import sockjs from "sockjs";
import getPort from "get-port";
import { Engine } from "paperclip";
import * as URL from "url";

export type ServerOptions = {
  engine: Engine;
  localResourceRoots: string[];
  port?: number;
};

export const startServer = async ({
  port: defaultPort,
  engine,
  localResourceRoots
}: ServerOptions) => {
  const port = await getPort({ port: defaultPort });

  const io = sockjs.createServer();

  let _watcher: chokidar.FSWatcher;

  const watchEngineFiles = () => {
    if (_watcher) {
      _watcher.close();
    }
    _watcher = chokidar.watch(
      engine.getGraphUris().map(uri => URL.fileURLToPath(uri)),
      {
        ignoreInitial: true
      }
    );
    _watcher.on("change", filePath => {
      console.log(URL.pathToFileURL(filePath).href);
      engine.updateVirtualFileContent(
        URL.pathToFileURL(filePath).href,
        fs.readFileSync(filePath, "utf8")
      );
    });
  };

  const handleOpen = uri => {
    const localPath = URL.fileURLToPath(uri);
    if (!localResourceRoots.some(root => localPath.includes(root))) {
      return;
    }

    const ret = engine.run(uri);
    watchEngineFiles();
    return ret;
  };

  io.on("connection", conn => {
    let targetUri;

    const disposeEngineListener = engine.onEvent(event => {
      console.log("EV", event.kind);
      if (event.uri !== targetUri) {
        return;
      }

      conn.write(
        JSON.stringify({
          type: "ENGINE_EVENT",
          payload: event
        })
      );
    });

    conn.on("data", data => {
      console.log("DAT");
      const message = JSON.parse(data) as any;
      if (message.type === "OPEN") {
        targetUri = message.uri;
        const result = handleOpen(message.uri);
        if (result) {
          conn.write(
            JSON.stringify({
              type: "INIT",
              payload: result
            })
          );
        }
      }
    });

    conn.on("close", () => {
      disposeEngineListener();
    });
  });

  const server = http.createServer(
    serveStatic(path.join(__dirname, "..", "dist"))
  );
  io.installHandlers(server, { prefix: "/rt" });
  server.listen(port);

  console.info(`Listening on port %d`, port);

  return {
    port
  };
};

const serveStatic = (root: string) => (req, res) => {
  const url = URL.parse(req.url);
  const filePath = path.join(
    root,
    path.normalize(url.pathname === "/" ? "/index.html" : url.pathname)
  );
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end("file not found");
  }
  res.writeHead(200);
  fs.createReadStream(filePath).pipe(res);
};
