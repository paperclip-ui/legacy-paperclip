import { mockDOMFactory } from "@paperclip-ui/web-renderer/lib/test/utils";
import { createMockRPCServer } from "@paperclip-ui/common";
import { EventEmitter } from "events";
import { EditorHost } from "../host/host";
import { createMockEngine } from "@paperclip-ui/core/lib/test/utils";
import { EditorClient } from "../client/client";

export const createMockServer = () => {
  const hostEm = new EventEmitter();
  const rpcServer = createMockRPCServer();

  return {
    onConnection(listener) {
      rpcServer.onConnection(listener);
    },
    createHostClient(delay?: boolean) {
      return new EditorClient(rpcServer.createConnection(delay), {
        domFactory: mockDOMFactory
      });
    }
  };
};

export const createMockHost = (graph: Record<string, string>) => {
  const server = createMockServer();

  const host = new EditorHost(createMockEngine(graph), server);

  host.start();

  return { host, server };
};

export const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
