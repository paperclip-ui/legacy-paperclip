import { RPCClient } from "../core/rpc";
import { EventEmitter } from "events";

export const createMockServer = () => {
  const hostEm = new EventEmitter();

  return {
    onConnection(listener) {
      hostEm.on("connection", listener);
    },
    createClient() {
      return {
        onConnection(listener) {
          const remote = new EventEmitter();
          const local = new EventEmitter();

          const remoteCon = createClient(1, local, remote);
          const localCon = createClient(2, remote, local);

          hostEm.emit("connection", localCon);
          listener(remoteCon);
        }
      };
    }
  };
};

const createClient = (id, a: EventEmitter, b: EventEmitter) => {
  return {
    id,
    send(message) {
      a.emit("message", message);
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
