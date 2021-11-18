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
  editPCSourceChannel,
  revealNodeSourceByIdChannel,
  revealNodeSourceChannel
} from "../../rpc/channels";
import {
  BaseEvent,
  eventHandlers,
  ServerKernel,
  BaseServerState,
  serviceCreator
} from "paperclip-common";
import { HTTPServerStarted, SockJSConnection } from "./http-server";
import { PCEngineInitialized } from "./pc-engine";
import { exec } from "child_process";
import URL from "url";
import * as path from "path";
import { Directory, FSItemKind } from "../../state";
import * as fs from "fs";
import { Disposable, disposableGroup } from "paperclip-common";
import {
  ContentChange,
  PCMutation,
  PCSourceWriter
} from "paperclip-source-writer";

export class PCSourceEdited {
  static TYPE = "rpc/PCSourceEdited";
  readonly type = PCSourceEdited.TYPE;
  constructor(readonly changes: Record<string, ContentChange[]>) {}
  toJSON() {
    return { type: this.type, changes: this.changes };
  }
}

type Options = {
  localResourceRoots: string[];
  revealSource: (source: ExprSource) => void;
};

class State implements BaseServerState {
  engine?: EngineDelegate;
  httpPort?: number;
  constructor(readonly options: Options) {}

  handleEvent(event: BaseEvent) {
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
    handleEvent: eventHandlers({
      [SockJSConnection.TYPE]: onConnection(state, kernel)
    })
  });
};

const onConnection = (state: State, kernel: ServerKernel) => ({
  connection
}: SockJSConnection) => {
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
    editPCSourceChannel(io).listen(editPCSource(state, kernel)),
    watchEngineEvents(state.engine, remoteEvents),
    remoteEvents.listen(dispatchRemoteEvents(kernel))
  ];

  connection.on("close", disposableGroup(disposables).dispose);
};

const dispatchRemoteEvents = (kernel: ServerKernel) => async (
  event: BaseEvent
) => {
  kernel.events.dispatch(event);
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

const editPCSource = (state: State, kernel: ServerKernel) => async (
  mutations: PCMutation[]
) => {
  const writer = new PCSourceWriter(state.engine!);
  const changes = writer.apply(mutations);
  kernel.events.dispatch(new PCSourceEdited(changes));
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