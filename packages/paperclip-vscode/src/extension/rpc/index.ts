import { RPCClientAdapter } from "@paperclip-ui/common";
import { createListener } from "../utils";
import { LanguageClient } from "vscode-languageclient";
import { EventEmitter } from "events";

import { Connection } from "vscode-languageserver";

export const languageClientRPCAdapter = (
  client: LanguageClient | Connection
): RPCClientAdapter => {
  const em = new EventEmitter();

  client.onNotification("$$MESSAGE", (message) => em.emit("message", message));

  return {
    send(message) {
      client.sendNotification("$$MESSAGE", message);
    },
    onMessage(listener: (message: any) => void) {
      return createListener(em, "message", listener);
    },
    onDisconnect() {
      // eslint-disable-next-line
      return () => {};
    },
  };
};
