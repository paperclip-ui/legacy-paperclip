import * as path from "path";
import * as fs from "fs";
import * as chokidar from "chokidar";
import http from "http";
import sockjs from "sockjs";
import getPort from "get-port";
import { EngineDelegate } from "paperclip";
import * as URL from "url";
import { ActionType, FSItemClicked } from "./actions";
import { FSItemKind } from "./state";

export type ServerOptions = {
  engine: EngineDelegate;
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
      engine.updateVirtualFileContent(
        URL.pathToFileURL(filePath).href,
        fs.readFileSync(filePath, "utf8")
      );
    });
  };

  const openURI = uri => {
    const localPath = URL.fileURLToPath(uri);
    if (!localResourceRoots.some(root => localPath.includes(root))) {
      return;
    }

    const ret = engine.open(uri);
    watchEngineFiles();
    return ret;
  };

  io.on("connection", conn => {
    let targetUri;

    const emit = message => {
      conn.write(JSON.stringify(message));
    };

    const disposeEngineListener = engine.onEvent(event => {
      emit({
        type: "ENGINE_EVENT",
        payload: event
      });
    });

    conn.on("data", data => {
      const message = JSON.parse(data) as any;
      console.log("message:", data);
      switch (message.type) {
        case "OPEN":
          return onOpen(message);
        case ActionType.FS_ITEM_CLICKED: {
          return onFSItemClicked(message);
        }
      }
    });

    const onFSItemClicked = async (action: FSItemClicked) => {
      if (action.payload.kind === FSItemKind.DIRECTORY) {
        loadDirectory(action.payload.absolutePath);
      } else {
        if (/\.pc$/.test(action.payload.absolutePath)) {
          targetUri = URL.pathToFileURL(action.payload.absolutePath).href;
          handleOpen(targetUri);
        }
      }
    };

    const handleOpen = (uri: string) => {
      const result = openURI(uri);
      if (result) {
        emit({
          type: "INIT",
          payload: result
        });
      }
    };

    const onOpen = message => {
      targetUri = message.uri;
      handleOpen(targetUri);
    };

    const loadDirectory = (dirPath: string, isRoot = false) => {
      fs.readdir(dirPath, (err, basenames) => {
        if (err) {
          return;
        }

        emit({
          type: "DIR_LOADED",
          payload: {
            isRoot,
            item: {
              absolutePath: dirPath,
              url: URL.pathToFileURL(dirPath),
              kind: "directory",
              name: path.basename(dirPath),
              children: basenames.map(basename => {
                const absolutePath = path.join(dirPath, basename);
                const isDir = fs.lstatSync(absolutePath).isDirectory();
                return {
                  absolutePath,
                  url: URL.pathToFileURL(absolutePath),
                  name: basename,
                  kind: isDir ? "directory" : "file",
                  children: isDir ? [] : undefined
                };
              })
            }
          }
        });
      });
    };

    // load initial since it has highest priority
    if (localResourceRoots.length) {
      loadDirectory(localResourceRoots[0], true);
    }

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
