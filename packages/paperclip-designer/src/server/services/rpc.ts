import { Channel, sockAdapter } from "paperclip-common";
import {
  EngineDelegate,
  engineDelegateChanged,
  ExprSource,
  NodeStyleInspection,
  VirtNodeSource
} from "paperclip";
import {
  eventsChannel,
  getAllScreensChannel,
  getServerOptionsChannel,
  inspectNodeStyleChannel,
  loadDirectoryChannel,
  loadVirtualNodeSourcesChannel,
  openFileChannel,
  popoutWindowChannel,
  revealNodeSourceByIdChannel,
  revealNodeSourceChannel
} from "../../rpc/channels";
import { BaseEvent, eventHandlers } from "../core/events";
import { ServerKernel } from "../core/kernel";
import { serviceCreator, BaseServerState } from "../core/service-manager";
import { HTTPServerStarted, SockJSConnection } from "./http-server";
import { PCEngineInitialized } from "./pc-engine";
import { exec } from "child_process";
import URL from "url";
import * as path from "path";
import { Directory, FSItemKind } from "../../state";
import * as fs from "fs";
import { Disposable, disposableGroup } from "paperclip-common";

type Options = {
  localResourceRoots: string[];
  revealSource: (source: ExprSource) => void;
};

class State implements BaseServerState {
  engine?: EngineDelegate;
  httpPort?: number;
  constructor(readonly options: Options) {}

  onEvent(event: BaseEvent) {
    switch (event.type) {
      case PCEngineInitialized.TYPE: {
        this.engine = (event as PCEngineInitialized).engine;
        break;
      }
      case HTTPServerStarted.TYPE: {
        this.httpPort = (event as HTTPServerStarted).port;
        break;
      }
    }
  }

  pathInLocalResourceRoot(localPath: string) {
    if (localPath.startsWith("file://")) {
      localPath = URL.fileURLToPath(localPath);
    }
    return this.options.localResourceRoots.some(root =>
      localPath.toLowerCase().includes(root.toLowerCase())
    );
  }
}

export const rpcService = (options: Options) =>
  serviceCreator(load, () => new State(options));

const load = (kernel: ServerKernel, state: State) => {
  kernel.events.observe({
    onEvent: eventHandlers({
      [SockJSConnection.TYPE]: onConnection(state)
    })
  });
};

const onConnection = (state: State) => ({ connection }: SockJSConnection) => {
  const io = sockAdapter(connection);

  const remoteEvents = eventsChannel(io);

  const disposables: Disposable[] = [
    inspectNodeStyleChannel(io).listen(inspectNodeStyles(state)),
    revealNodeSourceChannel(io).listen(revealNodeSource(state)),
    revealNodeSourceByIdChannel(io).listen(revealNodeSourceById(state)),
    popoutWindowChannel(io).listen(popoutWindow(state)),
    getAllScreensChannel(io).listen(getAllScreens(state)),
    getServerOptionsChannel(io).listen(getServerOptions(state)),
    loadDirectoryChannel(io).listen(loadDirectory(state)),
    openFileChannel(io).listen(openFile(state)),
    loadVirtualNodeSourcesChannel(io).listen(loadVirtNodeSources(state)),
    watchEngineEvents(state.engine, remoteEvents)
  ];

  connection.on("close", disposableGroup(disposables).dispose);
};

const inspectNodeStyles = ({ engine }: State) => async sources => {
  // TODO - need to pull frame size from virt node source
  const inspections: Array<[
    VirtNodeSource,
    NodeStyleInspection
  ]> = sources.map(source => [source, engine.inspectNodeStyles(source, 0)]);

  return inspections;
};

const revealNodeSource = ({
  engine,
  options: { revealSource }
}: State) => async source => {
  const info = engine.getVirtualNodeSourceInfo(source.path, source.uri);
  if (info) {
    revealSource(info);
  }
};

const getAllScreens = (state: State) => async () =>
  state.engine?.getAllLoadedData();

const popoutWindow = (state: State) => async ({ path }) => {
  let host = `http://localhost:${state.httpPort}`;
  let url = host + path;
  exec(`open "${url}"`);
};

const getServerOptions = (state: State) => async () => ({
  localResourceRoots: state.options.localResourceRoots
});

const loadDirectory = (state: State) => async ({
  path: dirPath
}): Promise<Directory> => {
  return new Promise((resolve, reject) => {
    if (!state.pathInLocalResourceRoot(dirPath)) {
      return reject(new Error("not in resource root"));
    }

    fs.readdir(dirPath, (err, basenames) => {
      if (err) {
        return reject(err);
      }

      resolve({
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
      });
    });
  });
};

const openFile = (state: State) => async ({ uri }) => {
  if (!state.pathInLocalResourceRoot(uri)) {
    throw new Error(`Not in resource root`);
  }

  if (!/\.pc$/.test(uri)) {
    return;
  }

  const document =
    state.engine.getVirtualContent(uri) ||
    fs.readFileSync(new URL.URL(uri), "utf8");

  return {
    uri,
    document,
    data: state.engine.open(uri)
  };
};

const loadVirtNodeSources = (state: State) => async (
  sources: VirtNodeSource[]
) => {
  return sources.map(info => {
    return {
      virtualNodePath: info.path,
      source: state.engine.getVirtualNodeSourceInfo(info.path, info.uri)
    };
  });
};

const revealNodeSourceById = (state: State) => async (sourceId: string) => {
  const [uri, expr] = state.engine.getExpressionById(sourceId) as [string, any];

  state.options.revealSource({
    sourceId,
    textSource: {
      location: expr.location,
      uri
    }
  });
};

const watchEngineEvents = (
  engine: EngineDelegate,
  events: Channel<any, any>
) => {
  const dispose = engine.onEvent(event => {
    events.call(engineDelegateChanged(event));
  });
  return { dispose };
};
