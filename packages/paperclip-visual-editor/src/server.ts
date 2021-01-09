import * as path from "path";
import * as fs from "fs";
import * as chokidar from "chokidar";

import sockjs from "sockjs";
import getPort from "get-port";
import {
  createEngineDelegate,
  EngineDelegate,
  keepEngineInSyncWithFileSystem2,
  findPCConfigUrl
} from "paperclip";
import * as URL from "url";
import {
  engineDelegateChanged,
  dirLoaded,
  ActionType,
  FileOpened,
  FSItemClicked,
  Action,
  ExternalAction,
  PopoutWindowRequested,
  pcFileLoaded,
  instanceChanged,
  InstanceAction,
  crashed,
  allPCContentLoaded,
  initParamsDefined,
  ExternalActionType,
  ConfigChanged
} from "./actions";
import { FSItemKind } from "./state";
import express from "express";
import { normalize, relative } from "path";
import { EventEmitter } from "events";
import { noop } from "lodash";
import { exec } from "child_process";
import { EngineMode, PaperclipSourceWatcher } from "paperclip";
import { isPaperclipFile, PaperclipConfig } from "paperclip";
import * as ngrok from "ngrok";

export type ServerOptions = {
  localResourceRoots: string[];
  port?: number;
  publicSharing: boolean;
  emit?: (action: Action) => void;
  cwd?: string;
  readonly?: boolean;
};

export const startServer = async ({
  port: defaultPort,
  localResourceRoots,
  emit: emitExternal = noop,
  publicSharing = true,
  cwd = process.cwd(),
  readonly
}: ServerOptions) => {
  const engine = await createEngineDelegate(
    {
      mode: EngineMode.MultiFrame
    },
    () => {
      emitExternal(crashed(null));
    }
  );
  watchPaperclipSources(engine, cwd);

  const port = await getPort({ port: defaultPort });

  const io = sockjs.createServer();

  let _watcher: chokidar.FSWatcher;
  const em = new EventEmitter();

  const openURI = uri => {
    const localPath = URL.fileURLToPath(uri);
    if (!localResourceRoots.some(root => localPath.includes(root))) {
      return;
    }

    const ret = engine.open(uri);
    return ret;
  };

  let _shareHost: string;

  const getShareHost = async () => {
    if (_shareHost) {
      return _shareHost;
    }
    if (publicSharing) {
      return (_shareHost = await ngrok.connect(port));
    } else {
      return `http://localhost:${port}`;
    }
  };

  io.on("connection", conn => {
    let targetUri;

    const emit = message => {
      conn.write(JSON.stringify(message));
    };

    emit(initParamsDefined({ readonly }));

    const disposeEngineListener = engine.onEvent(event => {
      emit(engineDelegateChanged(event));
    });

    const onExternalAction = emit;

    em.on("externalAction", onExternalAction);

    conn.on("data", data => {
      const action: InstanceAction = JSON.parse(data) as any;
      switch (action.type) {
        case ActionType.FS_ITEM_CLICKED: {
          return onFSItemClicked(action);
        }
        case ActionType.FILE_OPENED: {
          return onFileOpened(action);
        }
        case ActionType.POPOUT_WINDOW_REQUESTED: {
          onPopoutWindowRequested(action);
          break;
        }
        case ActionType.GET_ALL_SCREENS_REQUESTED: {
          return handleGetAllScreens();
        }
      }
      emitExternal(instanceChanged({ targetPCFileUri: targetUri, action }));
    });

    const handleGetAllScreens = () => {
      emit(allPCContentLoaded(engine.getAllLoadedData()));
    };

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

    const onPopoutWindowRequested = async ({
      payload: { uri }
    }: PopoutWindowRequested) => {
      const shareHost = await getShareHost();
      exec(`open ${shareHost}/?current_file=${encodeURIComponent(uri)}`);
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
      em.off("externalAction", onExternalAction);
    });
  });

  const dispatch = (action: ExternalAction) => {
    em.emit("externalAction", action);

    switch (action.type) {
      case ExternalActionType.CONFIG_CHANGED: {
        handleConfigChanged(action);
        break;
      }
    }
  };

  const handleConfigChanged = ({ payload }: ConfigChanged) => {
    if (payload.publicSharing != null) {
      if (publicSharing && _shareHost && !payload.publicSharing) {
        ngrok.disconnect(_shareHost);
        _shareHost = undefined;
      }
      publicSharing = payload.publicSharing;
    }
  };

  startHTTPServer(port, io, localResourceRoots);

  console.info(`Listening on port %d`, port);

  return {
    port,
    engine,
    dispatch
  };
};

const startHTTPServer = (
  port: number,
  io: sockjs.Server,
  localResourceRoots: string[]
) => {
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
};

const watchPaperclipSources = (
  engine: EngineDelegate,
  cwd: string = process.cwd()
) => {
  // want to load all PC files within the CWD workspace -- disregard PC configs

  const watcher = chokidar.watch(
    "**/*.pc",

    // TODO - ignored - fetch .gitignored
    { cwd: cwd, ignored: ["**/node_modules/**", "node_modules"] }
  );

  watcher.on("all", (eventName, relativePath) => {
    if (!isPaperclipFile(relativePath)) {
      return;
    }
    const uri = URL.pathToFileURL(path.join(cwd, relativePath));

    if (eventName === "change") {
      engine.updateVirtualFileContent(uri.href, fs.readFileSync(uri, "utf8"));
    } else if (eventName === "add") {
      engine.open(uri.href);
    }
  });
};
