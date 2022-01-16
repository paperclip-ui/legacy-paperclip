import { spy } from "./spy";
import { EventEmitter } from "events";

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

  return {
    onConnection(listener) {
      hostEm.on("connection", listener);
    },
    createConnection(delay?: boolean): RPCClientAdapter {
      const remote = new EventEmitter();
      const local = new EventEmitter();

      const remoteCon = createMockClient(delay, local, remote);
      const localCon = createMockClient(delay, remote, local);

      hostEm.emit("connection", localCon);
      return remoteCon;
    }
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

export const workerRPCClientAdapter = (
  worker: Window | Worker
): RPCClientAdapter => ({
  onMessage(listener) {
    return spy(worker, "onmessage", event => listener(event.data));
  },
  onDisconnect(listener: () => void) {},
  send(message) {
    (worker as any).postMessage(message);
  }
});

// sockjs adapter
export const sockjsClientAdapter = (worker: any): RPCClientAdapter => ({
  onMessage(listener) {
    // is on the server
    const onMessage = message => {
      listener(JSON.parse(message));
    };

    // is on the client
    if (!worker.on) {
      return spy(worker, "onmessage", event => {
        onMessage(event.data);
      });
    }

    worker.on("data", onMessage);
    return () => worker.off("data", onMessage);
  },
  onDisconnect(listener: () => void) {
    worker.on("disconnect", listener);
  },
  send(message) {
    ((worker as any).send || (worker as any).write).call(
      worker,
      JSON.stringify(message)
    );
  }
});
