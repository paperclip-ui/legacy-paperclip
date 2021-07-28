import { sockAdapter } from "paperclip-common";
import {
  EngineDelegate,
  ExprSource,
  NodeStyleInspection,
  VirtNodeSource
} from "paperclip/src/core";
import {
  inspectNodeStyleChannel,
  popoutWindowChannel,
  revealNodeSourceChannel
} from "../../rpc/channels";
import { BaseEvent, eventHandlers } from "../core/events";
import { ServerKernel } from "../core/kernel";
import { serviceCreator, BaseServerState } from "../core/service-manager";
import { SockJSConnection } from "./http-server";
import { PCEngineInitialized } from "./pc-engine";
import { exec } from "child_process";

type Options = {
  revealSource: (source: ExprSource) => void;
};

class State implements BaseServerState {
  engine: EngineDelegate;
  httpPort: number;
  constructor(readonly options: Options) {}

  onEvent(event: BaseEvent) {
    switch (event.type) {
      case PCEngineInitialized.TYPE: {
        this.engine = (event as PCEngineInitialized).engine;
        break;
      }
    }
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
  inspectNodeStyleChannel(io).listen(inspectNodeStyles(state));
  revealNodeSourceChannel(io).listen(revealNodeSource(state));
  popoutWindowChannel(io).listen(popoutWindow);
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

const popoutWindow = async ({ path }) => {
  let host = `http://localhost:${port}`;
  let url = host + path;
  exec(`open "${url}"`);
};
