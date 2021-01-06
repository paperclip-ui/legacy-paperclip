import * as path from "path";
import * as fs from "fs";
import * as chokidar from "chokidar";

import sockjs from "sockjs";
import getPort from "get-port";
import { EngineDelegate } from "paperclip";
import * as URL from "url";
import {
  engineDelegateChanged,
  dirLoaded,
  ActionType,
  FileOpened,
  FSItemClicked,
  Action,
  pcFileLoaded
} from "./actions";
import { FSItemKind } from "./state";
import express from "express";
import { normalize } from "path";

export type ServerOptions = {
  engine: EngineDelegate;
  localResourceRoots: string[];
  port?: number;
  emit: (action: Action) => void;
};

export const startServer = async ({
  port: defaultPort,
  engine,
  localResourceRoots,
  emit: emitExternal
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
      emit(engineDelegateChanged(event));
    });

    conn.on("data", data => {
      const action: Action = JSON.parse(data) as any;
      switch (action.type) {
        case ActionType.FS_ITEM_CLICKED: {
          return onFSItemClicked(action);
        }
        case ActionType.FILE_OPENED: {
          return onFileOpened(action);
        }
      }
      emitExternal(action);
    });

    const onFSItemClicked = async (action: FSItemClicked) => {
      if (action.payload.kind === FSItemKind.DIRECTORY) {
        loadDirectory(action.payload.absolutePath);
      }
    };

    const onFileOpened = async (action: FileOpened) => {
      if (/\.pc$/.test(action.payload.uri)) {
        targetUri = URL.parse(action.payload.uri).href;
        handleOpen(targetUri);
      }
    };

    const handleOpen = (uri: string) => {
      const result = openURI(uri);
      if (result) {
        emit(pcFileLoaded(result));
      }
    };

    const loadDirectory = (dirPath: string, isRoot = false) => {
      fs.readdir(dirPath, (err, basenames) => {
        if (err) {
          return;
        }

        emit(
          dirLoaded({
            isRoot,
            item: {
              absolutePath: dirPath,
              url: URL.pathToFileURL(dirPath).toString(),
              kind: FSItemKind.DIRECTORY,
              name: path.basename(dirPath),
              children: basenames.map(basename => {
                const absolutePath = path.join(dirPath, basename);
                const isDir = fs.lstatSync(absolutePath).isDirectory();
                return {
                  absolutePath,
                  url: URL.pathToFileURL(absolutePath).toString(),
                  name: basename,
                  kind: isDir ? FSItemKind.DIRECTORY : FSItemKind.FILE,
                  children: isDir ? [] : undefined
                };
              })
            }
          })
        );
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

  const app = express();

  const server = app.listen(port);
  io.installHandlers(server, { prefix: "/rt" });
  app.use(express.static(path.join(__dirname, "..", "dist")));
  app.use("/file/*", (req, res, next) => {
    const filePath = normalize(req.params["0"]);
    const found = localResourceRoots.some(root => filePath.indexOf(root) === 0);
    if (!found) {
      return next();
    }
    res.sendFile(filePath);
  });

  console.info(`Listening on port %d`, port);

  return {
    port
  };
};
