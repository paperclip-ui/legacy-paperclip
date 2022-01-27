import { LogLevel, RPCClientAdapter } from "@paperclip-ui/common";
import { Server } from "@tandem-ui/workspace/lib/server";
import { WindowConnection } from "../worker-connection";
// import { WindowConnection } from "../worker-connection";
// import { REPLWorker } from "./index";

// new REPLWorker(new WindowConnection(self)).init();

new Server({
  logLevel: LogLevel.All,
  useHttpServer: false,
  rpcServer: {
    onConnection(listener: (connection: RPCClientAdapter) => void) {
      listener(new WindowConnection(self));
      return () => {};
    },
  },
}).start();
