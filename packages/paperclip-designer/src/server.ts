import * as path from "path";
import * as fs from "fs";
import * as chokidar from "chokidar";

import sockjs from "sockjs";
import getPort from "get-port";
import { createEngineDelegate, EngineDelegate } from "paperclip";
import * as URL from "url";
import {
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
  ConfigChanged,
  EnvOptionClicked,
  browserstackBrowsersLoaded,
  ServerAction,
  TitleDoubleClicked,
  openedDocument,
  VirtualNodesSelected,
  virtualNodeSourcesLoaded,
  MetaClicked,
  revealExpressionSourceRequested,
  PCVirtObjectEdited,
  pcSourceEdited,
  virtualNodeStylesInspected
} from "./actions";
import {
  AvailableBrowser,
  EnvOption,
  EnvOptionKind,
  FSItemKind
} from "./state";
import express from "express";
import { normalize } from "path";
import { EventEmitter } from "events";
import { noop } from "lodash";
import { exec } from "child_process";
import { EngineMode } from "paperclip";
import { isPaperclipFile } from "paperclip";
import * as ngrok from "ngrok";
import * as qs from "querystring";
import * as bs from "browserstack";
import {
  engineDelegateChanged,
  NodeStyleInspection,
  VirtNodeSource
} from "paperclip-utils";
import { PCSourceWriter } from "paperclip-source-writer";

type BrowserstackCredentials = {
  username: string;
  password: string;
};

export type ServerOptions = {
  localResourceRoots: string[];
  port?: number;
  emit?: (action: Action) => void;
  cwd?: string;
  readonly?: boolean;
  openInitial: boolean;
  credentials?: {
    browserstack?: BrowserstackCredentials;
  };
};

export const startServer = async ({
  port: defaultPort,
  localResourceRoots,
  emit: emitExternal = noop,
  cwd = process.cwd(),
  credentials = {},
  openInitial,
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
  const textSourceWriter = new PCSourceWriter({ engine });

  const port = await getPort({ port: defaultPort });

  const io = sockjs.createServer();

  let _watcher: chokidar.FSWatcher;
  const em = new EventEmitter();

  const openURI = uri => {
    const localPath = URL.fileURLToPath(uri);
    if (
      !localResourceRoots.some(root =>
        localPath.toLowerCase().includes(root.toLowerCase())
      )
    ) {
      return;
    }

    const ret = engine.open(uri);
    return ret;
  };

  let _shareHost: string;
  let _browsers: any[];

  io.on("connection", conn => {
    let targetUri;

    const emit = message => {
      conn.write(JSON.stringify(message));
    };

    emit(initParamsDefined({ readonly, availableBrowsers: _browsers }));

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
        case ActionType.VIRTUAL_NODES_SELECTED: {
          return onVirtualNodeSelected(action);
        }
        case ActionType.FILE_OPENED: {
          return onFileOpened(action);
        }
        case ActionType.META_CLICKED: {
          return handleMetaClickVirtualNode(action);
        }
        case ActionType.GET_ALL_SCREENS_REQUESTED: {
          return handleGetAllScreens();
        }
        case ActionType.ENV_OPTION_CLICKED: {
          return handleEnvOptionClicked(action);
        }
        case ActionType.TITLE_DOUBLE_CLICKED: {
          return handleTitleDoubleClicked(action);
        }
        case ActionType.PC_VIRT_OBJECT_EDITED: {
          return handleVirtObjectEdited(action);
        }
      }
      emitExternal(instanceChanged({ targetPCFileUri: targetUri, action }));
    });

    const handleTitleDoubleClicked = (action: TitleDoubleClicked) => {
      if (action.payload.uri) {
        exec(`open "${URL.fileURLToPath(action.payload.uri)}"`);
      }
    };

    const handleGetAllScreens = () => {
      emit(allPCContentLoaded(engine.getAllLoadedData()));
    };

    let _ngrokUrl;

    const handleEnvOptionClicked = async ({
      payload: { option, path }
    }: EnvOptionClicked) => {
      let host = `http://localhost:${port}`;

      if (option.kind !== EnvOptionKind.Private) {
        host = _ngrokUrl || (_ngrokUrl = await ngrok.connect(port));
      }

      let url = host + path;

      if (option.kind === EnvOptionKind.Browserstack) {
        url = getBrowserstackUrl(url, option);
      }

      exec(`open "${url}"`);
    };

    const getBrowserstackUrl = (url: string, option: EnvOption) => {
      const launchOptions: AvailableBrowser = option.launchOptions;

      const query = {
        browser: launchOptions.browser,
        browser_version: launchOptions.browserVersion,
        scale_to_fit: true,
        os: launchOptions.os,
        os_version: launchOptions.osVersion,
        start: true,
        local: true,
        url
      };

      return `https://live.browserstack.com/dashboard#${qs.stringify(query)}`;
    };

    const onFSItemClicked = async (action: FSItemClicked) => {
      if (action.payload.kind === FSItemKind.DIRECTORY) {
        loadDirectory(action.payload.absolutePath);
      }
    };

    const onVirtualNodeSelected = (action: VirtualNodesSelected) => {
      loadVirtualNodeSources(action.payload.sources);
      inspectVirtuaNodeSources(
        action.payload.sources,
        action.payload.screenWidth
      );
    };

    const loadVirtualNodeSources = (virstSources: VirtNodeSource[]) => {
      const sources = virstSources.map(info => {
        return {
          virtualNodePath: info.path,
          source: engine.getVirtualNodeSourceInfo(info.path, info.uri)
        };
      });
      emit(virtualNodeSourcesLoaded(sources));
    };

    const inspectVirtuaNodeSources = (
      virtSources: VirtNodeSource[],
      screenWidth: number
    ) => {
      const now = Date.now();
      const inspections: Array<[
        VirtNodeSource,
        NodeStyleInspection
      ]> = virtSources.map(source => [
        source,
        engine.inspectNodeStyles(source, screenWidth)
      ]);
      emit(virtualNodeStylesInspected(inspections));
    };

    const onFileOpened = async (action: FileOpened) => {
      if (/\.pc$/.test(action.payload.uri)) {
        targetUri = URL.parse(action.payload.uri).href;
        handleOpen(targetUri);
      }
    };

    const handleMetaClickVirtualNode = ({
      payload: { nodeUri, nodePath }
    }: MetaClicked) => {
      const info = engine.getVirtualNodeSourceInfo(nodePath, nodeUri);
      if (info) {
        emitExternal(revealExpressionSourceRequested(info));
      }
    };

    const handleVirtObjectEdited = async (action: PCVirtObjectEdited) => {
      emitExternal(
        pcSourceEdited(
          await textSourceWriter.getContentChanges(action.payload.mutations)
        )
      );
    };

    const handleOpen = (uri: string) => {
      const data = openURI(uri);
      const document =
        engine.getVirtualContent(uri) ||
        fs.readFileSync(new URL.URL(uri), "utf8");
      emit(pcFileLoaded({ uri, document, data }));
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

  const dispatch = (action: ExternalAction | ServerAction) => {
    em.emit("externalAction", action);
    if (action.type == ExternalActionType.CONFIG_CHANGED) {
      handleConfigChanged(action);
    }
  };

  let _bsClient;

  const handleConfigChanged = ({ payload }: ConfigChanged) => {
    maybeInitBrowserstack(payload.browserstackCredentials);
  };

  const maybeInitBrowserstack = (credentials: any) => {
    if (!credentials || !credentials.username) {
      return;
    }
    _bsClient = bs.createClient(credentials);
    console.log("Getting all browserstack browsers");
    _bsClient.getBrowsers((err, result) => {
      if (err) {
        return console.error(`can't load browsers: `, err);
      }

      const used = {};

      _browsers = result
        ?.map(browser => ({
          ...browser,
          osVersion: browser.os_version,
          browserVersion: browser.browser_version
        }))
        .sort((a, b) => {
          if (a.browser !== b.browser) {
            return a.browser > b.browser ? 1 : -1;
          } else if (a.browserVersion !== b.browserVersion) {
            return a.browserVersion > b.browserVersion ? -1 : 1;
          }
        });

      console.log("loaded %d browsers", _browsers.length);

      dispatch(browserstackBrowsersLoaded(_browsers));
    });
  };

  startHTTPServer(port, io, localResourceRoots);
  maybeInitBrowserstack(credentials?.browserstack);

  console.info(`Listening on port %d`, port);

  if (openInitial) {
    exec(`open http://localhost:${port}/all`);
  }

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

  const distHandler = express.static(path.join(__dirname, "..", "dist"));

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
      decodeURIComponent(normalize(req.params["0"]))
    );

    const found = localResourceRoots.some(
      root => filePath.toLowerCase().indexOf(root.toLowerCase()) === 0
    );
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
    "**/*.{pc,css}",

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
    } else if (eventName === "unlink") {
      engine.purgeUnlinkedFiles();
    } else if (eventName === "unlinkDir") {
      engine.purgeUnlinkedFiles();
    }
  });
};
