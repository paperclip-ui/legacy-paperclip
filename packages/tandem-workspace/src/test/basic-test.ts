import { expect } from "chai";
import { Server, start, Workspace } from "../server";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { sockjsClientAdapter } from "@paperclip-ui/common";
import SockJSClient from "sockjs-client";

describe(__filename + "#", () => {
  let server: Server;

  beforeEach(async () => {
    server = await start({ pause: false, logLevel: 0 });
  });

  afterEach(async () => {
    server.stop();
  });

  it(`Can start a client`, async () => {
    const rpcClient = new SockJSClient(
      "http://localhost:" + server.getPort() + "/rt"
    );
    const client = new WorkspaceClient(sockjsClientAdapter(rpcClient));
  });
});
