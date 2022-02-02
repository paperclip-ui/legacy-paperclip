import { createMockRPCServer, Logger, LogLevel } from "@paperclip-ui/common";
import { EventEmitter } from "events";
import { EditorHost } from "../host/host";
import { createMockEngine } from "@paperclip-ui/core/lib/test/utils";
import { EditorClient } from "../client/client";
import { EngineMode } from "@paperclip-ui/core";

export const createMockServer = () => {
  const hostEm = new EventEmitter();
  const rpcServer = createMockRPCServer();

  return {
    onConnection(listener) {
      rpcServer.onConnection(listener);
    },
    createHostClient(delay?: boolean) {
      return new EditorClient(rpcServer.createConnection(delay));
    },
  };
};

export const createMockHost = async (graph: Record<string, string>) => {
  const server = createMockServer();
  const engine = createMockEngine(graph, null, null, EngineMode.SingleFrame);

  const host = await EditorHost.start(
    engine,
    server,
    new Logger(LogLevel.None)
  );

  return { host, server, engine };
};

export const timeout = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));
