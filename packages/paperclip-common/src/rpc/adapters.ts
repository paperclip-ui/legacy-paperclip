import { spy } from "./spy";
import { EventEmitter } from "events";
import * as sockjs from "sockjs";
import { WebSocketServer } from "ws";
import * as mpack from "@msgpack/msgpack";

type Message = any;

export type RPCServer = {
  onConnection(listener: (client: RPCClientAdapter) => void);
};

export type RPCClientAdapter = {
  onMessage: (listener: (message: Message) => void) => () => void;
  onDisconnect: (listener: () => void) => void;
  send: (message: Message) => void;
};

export const createMockRPCServer = () => {
  const hostEm = new EventEmitter();
  hostEm.setMaxListeners(30);

  return {
    onConnection(listener) {
      hostEm.on("connection", listener);
    },
    createConnection(delay?: boolean): RPCClientAdapter {
      const remote = new EventEmitter();
      const local = new EventEmitter();
      remote.setMaxListeners(30);
      local.setMaxListeners(30);

      const remoteCon = createMockClient(delay, local, remote);
      const localCon = createMockClient(delay, remote, local);

      hostEm.emit("connection", localCon);
      return remoteCon;
    },
  };
};

const createMockClient = (
  delay: boolean,
  a: EventEmitter,
  b: EventEmitter
): RPCClientAdapter => {
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
      const listener2 = (v) => {
        listener(v);
      };
      b.on("message", listener2);
      return () => {
        b.off("message", listener2);
      };
    },
    onDisconnect() {},
  };
};

export const workerRPCClientAdapter = (
  worker: Window | Worker
): RPCClientAdapter => ({
  onMessage(listener) {
    return spy(worker, "onmessage", (event) => listener(event.data));
  },
  onDisconnect(listener: () => void) {},
  send(message) {
    (worker as any).postMessage(message);
  },
});

// sockjs adapter
export const sockjsClientAdapter = (worker: any): RPCClientAdapter => {
  let prebuff = [];

  const send = (message) => {
    if (prebuff) {
      prebuff.push(message);
      return;
    }

    try {
      ((worker as any).send || (worker as any).write).call(worker, message);
    } catch (e) {
      console.error(e.stack);
      throw e;
    }
  };

  const onOpen = () => {
    const buffer = prebuff;
    prebuff = undefined;
    for (const message of buffer) {
      send(message);
    }
  };

  if (!worker.on) {
    worker.onopen = onOpen;
  } else {
    onOpen();
  }

  return {
    onMessage(listener) {
      // is on the server
      const onMessage = (message) => {
        listener(message);
      };

      // is on the client
      if (!worker.on) {
        return spy(worker, "onmessage", (event) => {
          onMessage(event.data);
        });
      }

      worker.on("data", onMessage);
      return () => worker.off("data", onMessage);
    },
    onDisconnect(listener: () => void) {
      worker.on("disconnect", listener);
    },
    send,
  };
};

// sockjs adapter
export const sockjsServerRPCAdapter = (server: sockjs.Server): RPCServer => ({
  onConnection(listener: (connection: RPCClientAdapter) => void) {
    server.on("connection", (connection) => {
      listener(sockjsClientAdapter(connection));
    });
  },
});

export const wsAdapter = (
  createWS: () => any,
  isOpen = false
): RPCClientAdapter => {
  let buffer;
  let ws;

  const em = new EventEmitter();
  em.setMaxListeners(30);

  const init = () => {
    if (!isOpen) {
      buffer = [];
    }
    ws = createWS();
    ws.binaryType = "arraybuffer";

    if (ws.on) {
      ws.on("open", em.emit.bind(em, "open"));
      ws.on("message", (message) => {
        em.emit("message", mpack.decode(message));
      });
      ws.on("close", em.emit.bind(em, "close"));
    } else {
      ws.onopen = () => em.emit("open");
      ws.onmessage = (event) => em.emit("message", mpack.decode(event.data));
      ws.onclose = () => em.emit("close");
    }
  };

  init();

  if (!isOpen) {
    em.on("close", init);
  }

  const send = (message) => {
    if (buffer) {
      return buffer.push(message);
    }
    ws.send(mpack.encode(message));
  };

  em.on("open", () => {
    const buff = buffer;
    buffer = null;
    for (const item of buff) {
      send(item);
    }
  });
  return {
    onDisconnect(listener: () => void) {},
    onMessage(listener: (message: any) => void) {
      em.on("message", listener);
      return () => em.off("message", listener);
    },
    send,
  };
};

export const wsServerAdapter = (wss: WebSocketServer): RPCServer => ({
  onConnection(listener: (connection: RPCClientAdapter) => void) {
    wss.on("connection", (ws) => {
      listener(wsAdapter(() => ws, true));
    });
  },
});
