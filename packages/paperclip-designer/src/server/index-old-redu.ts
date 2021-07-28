import * as path from "path";
import * as fs from "fs";

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
  VirtualNodesSelected,
  virtualNodeSourcesLoaded,
  MetaClicked,
  revealExpressionSourceRequested,
  StyleRuleFileNameClicked,
  popoutWindowRequested
} from "../actions";
import {
  AvailableBrowser,
  EnvOption,
  EnvOptionKind,
  FSItemKind
} from "../state";
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
  StyleRule,
  VirtNodeSource
} from "paperclip-utils";
import { sourceWriterService } from "./services/source-writer";
import { fileWatcherService } from "./services/file-watcher";
import {
  inspectNodeStyleChannel,
  popoutWindowChannel,
  revealNodeSourceChannel
} from "../rpc/channels";
import { sockAdapter } from "../../../paperclip-common";
import { ServiceManager } from "./core/service-manager";

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
  const services = [];

  const port = await getPort({ port: defaultPort });

  const io = sockjs.createServer();

  const em = new EventEmitter();

  let _browsers: any[];

  io.on("connection", conn => {
    let targetUri;

    handleChans(conn);

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

      // pass action handling to plugins
      for (const handleAction of services) {
        handleAction(action);
      }

      // LEGACY
      switch (action.type) {
        case ActionType.VIRTUAL_NODES_SELECTED: {
          return onVirtualNodeSelected(action);
        }
        case ActionType.STYLE_RULE_FILE_NAME_CLICKED: {
          return handleStyleRuleFileNameClicked(action);
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
      }
      emitExternal(instanceChanged({ targetPCFileUri: targetUri, action }));
    });

    const handleTitleDoubleClicked = (action: TitleDoubleClicked) => {
      if (action.payload.uri) {
        exec(`open "${URL.fileURLToPath(action.payload.uri)}"`);
      }
    };

    const handleGetAllScreens = async () => {
      emit(allPCContentLoaded(engine.getAllLoadedData()));
    };

    let _ngrokUrl;

    /**
     * @deprecated
     */
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

    const onFileOpened = async (action: FileOpened) => {
      if (/\.pc$/.test(action.payload.uri)) {
        targetUri = URL.parse(action.payload.uri).href;
        handleOpen(targetUri);
      }
    };

    const handleStyleRuleFileNameClicked = ({
      payload: { styleRuleSourceId }
    }: StyleRuleFileNameClicked) => {
      const [uri, expr] = engine.getExpressionById(styleRuleSourceId) as [
        string,
        StyleRule
      ];
      emitExternal(
        revealExpressionSourceRequested({
          sourceId: styleRuleSourceId,
          textSource: {
            location: expr.location,
            uri
          }
        })
      );
    };

    const handleMetaClickVirtualNode = ({
      payload: { nodeUri, nodePath }
    }: MetaClicked) => {
      const info = engine.getVirtualNodeSourceInfo(nodePath, nodeUri);
      if (info) {
        emitExternal(revealExpressionSourceRequested(info));
      }
    };

    const handleOpen = (uri: string) => {
      const data = openURI(uri);
      const document =
        engine.getVirtualContent(uri) ||
        fs.readFileSync(new URL.URL(uri), "utf8");
      emit(pcFileLoaded({ uri, document, data }));
    };

    conn.on("close", () => {
      disposeEngineListener();
      em.off("externalAction", onExternalAction);
    });
  });

  const dispatch = (action: ExternalAction | ServerAction) => {
    em.emit("externalAction", action);
  };

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
