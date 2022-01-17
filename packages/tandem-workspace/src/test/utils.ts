import { sockjsClientAdapter } from "@paperclip-ui/common";
import { saveTmpFixtureFiles } from "@paperclip-ui/common/lib/test-utils";
import SockJSClient from "sockjs-client";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { mockDOMFactory } from "@paperclip-ui/web-renderer/lib/test/utils";
import { start } from "../server";
import { LogLevel } from "@tandem-ui/common";

export type TestServer = {
  stop: () => void;
  createClient: () => WorkspaceClient;
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
    project: { installDependencies: false }
  });
  return {
    testDir: fixtures.testDir,
    fixtureUris: fixtures.fixtureUris,
    stop() {
      server.stop();
      fixtures.dispose();
    },
    createClient() {
      return new WorkspaceClient(
        sockjsClientAdapter(
          new SockJSClient(`http://localhost:${server.getPort()}/rt`)
        ),
        mockDOMFactory
      );
    }
  };
};
