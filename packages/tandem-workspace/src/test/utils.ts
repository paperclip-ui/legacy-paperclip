import { sockjsClientAdapter } from "@paperclip-ui/common";
import SockJSClient from "sockjs-client";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { start } from "../server";

export type TestServer = {
  stop: () => void;
  createClient: () => WorkspaceClient;
};

export const createTestServer = async (
  files: Record<string, string>
): Promise<TestServer> => {
  const server = await start({ logLevel: 0, pause: false });
  return {
    stop() {
      server.stop();
    },
    createClient() {
      return new WorkspaceClient(
        sockjsClientAdapter(
          new SockJSClient(`http://localhost:${server.getPort()}/rt`)
        )
      );
    }
  };
};
