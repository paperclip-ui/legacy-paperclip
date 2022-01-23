import { RPCClientAdapter, wsAdapter } from "@paperclip-ui/common";
import { saveTmpFixtureFiles } from "@paperclip-ui/common/lib/test-utils";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { mockDOMFactory } from "@paperclip-ui/web-renderer/lib/test/utils";
import { start } from "../server";
import { LogLevel } from "@paperclip-ui/common";
import * as ws from "ws";

export type TestServer = {
  stop: () => void;
  createClient: () => WorkspaceClient;
  createConnection: () => RPCClientAdapter;
  testDir: string;
  fixtureUris: Record<string, string>;
};

export const createTestServer = async (
  files: Record<string, string>
): Promise<TestServer> => {
  const fixtures = saveTmpFixtureFiles("fixtures", files, "/tmp/__TEST__");
  const server = await start({
    logLevel: LogLevel.All,
    pause: false,
    project: { installDependencies: false },
  });
  const createConnection = () => {
    return wsAdapter(new ws.WebSocket(`ws://127.0.0.1:${server.getPort()}/ws`));
  };
  return {
    testDir: fixtures.testDir,
    fixtureUris: fixtures.fixtureUris,
    stop() {
      server.stop();
      fixtures.dispose();
    },
    createConnection,
    createClient() {
      return new WorkspaceClient(createConnection(), mockDOMFactory);
    },
  };
};
