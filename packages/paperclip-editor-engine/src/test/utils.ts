import { RPCClient } from "../core/rpc";
import { mockDOMFactory } from "@paperclip-ui/web-renderer/lib/test/utils";
import { EventEmitter } from "events";
import { EditorHost } from "../host/host";
import { createMockEngine } from "@paperclip-ui/core/lib/test/utils";
import { EditorClient } from "../client/client";

export const createMockServer = () => {
  const hostEm = new EventEmitter();

  return {
    onConnection(listener) {
      hostEm.on("connection", listener);
    },
    createHostClient(delay?: boolean) {
      return new EditorClient(
        {
          onConnection(listener) {
            const remote = new EventEmitter();
            const local = new EventEmitter();

            const remoteCon = createClient(delay, local, remote);
            const localCon = createClient(delay, remote, local);

            hostEm.emit("connection", localCon);
            listener(remoteCon);
          }
        },
        {
          domFactory: mockDOMFactory
        }
      );
    }
  };
};

const createClient = (delay: boolean, a: EventEmitter, b: EventEmitter) => {
  return {
    send(message) {
      const emitNow = () => a.emit("message", message);
      if (delay) {
        setTimeout(emitNow, 0);
      } else {
        emitNow();
      }
    },
    onMessage(listener) {
      const listener2 = v => {
        listener(v);
      };
      b.on("message", listener2);
      return () => {
        b.off("message", listener2);
      };
    },
    onDisconnect() {}
  };
};

export const createMockHost = (graph: Record<string, string>) => {
  const server = createMockServer();

  const host = new EditorHost(createMockEngine(graph), server);

  host.start();

  return { host, server };
};

export const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
