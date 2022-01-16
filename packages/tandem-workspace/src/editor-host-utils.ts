import { Connection } from "@paperclip-ui/editor-engine/lib/core/connection";
import { RPCClient } from "@paperclip-ui/editor-engine/lib/core/rpc";
import { SocketIo } from "./controllers/socket";
import * as sockjs from "sockjs";

const MESSAGE_CHAN = "$pc-editor-message";

export const createEditorHostRPCClient = (sock: SocketIo): RPCClient => {
  return {
    onConnection(listener: (connection: Connection) => void) {
      sock.on("connection", (connection: sockjs.Connection) => {
        listener({
          send(message) {
            connection.emit(MESSAGE_CHAN, message);
          },
          onDisconnect(listener: () => void) {
            connection.on("close", listener);
          },
          onMessage(listener: (message: any) => void) {
            connection.on(MESSAGE_CHAN, listener);
            return () => connection.off(MESSAGE_CHAN, listener);
          }
        });
      });
    }
  };
};
