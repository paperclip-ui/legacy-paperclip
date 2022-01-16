import { spy } from "./spy";

type Message = any;

export type RPCServer = {
  onConnection(listener: (client: RPCClientAdapter) => void);
  onMessage: (listener: (message: Message) => void) => () => void;
  send: (message: Message) => void;
};

export type RPCClientAdapter = {
  onMessage: (listener: (message: Message) => void) => () => void;
  onDisconnect: (listener: () => void) => void;
  send: (message: Message) => void;
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
