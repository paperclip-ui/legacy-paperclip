import * as URL from "url";
import {
  createTestServer,
  TestServer,
} from "@tandem-ui/workspace/src/test/utils";
import { createMemoryHistory } from "history";
import { createAppStore } from "../components/Main/create-app-store";
import { Action } from "..";
import { Project } from "@tandem-ui/workspace-client/lib/project";
import { AppState, DesignerState } from "../state";

export const middlewareSpy = () => {
  let waitType;
  let resolveAction;

  const waitForAction = (type: string) => {
    waitType = type;
    return new Promise<Action>((resolve) => {
      resolveAction = resolve;
    });
  };

  const middleware = () => (next) => (action) => {
    next(action);
    if (action.type === waitType) {
      resolveAction(action);
    }
  };

  return {
    middleware,
    waitForAction,
  };
};

type CreateMockOptions = {
  files: Record<string, string>;
  canvasFile: string;
  testDir?: string;
  initialDesignerState?: Partial<DesignerState>;
};

export type DesignerMock = {
  store: ReturnType<typeof createAppStore>;
  waitForAction: (type: string) => Promise<Action>;
  dispose: () => void;
  testServer: TestServer;
  project: Project;
};

export const createTestDesignServer = async (files: Record<string, string>) => {
  const testServer = await createTestServer(
    files,
    `/tmp/__TEST__/${Math.round(Math.random() * 99999)}`
  );

  const client = testServer.createClient();
  const project = await client.openProject({
    uri: URL.pathToFileURL(testServer.testDir).href,
  });

  return { testServer, project };
};

export const createMock = async ({
  files,
  canvasFile,
  initialDesignerState,
}: CreateMockOptions): Promise<DesignerMock> => {
  const { testServer, project } = await createTestDesignServer(files);

  const history = createMemoryHistory();
  history.push(
    `?projectId=${project.getProperties().id}&canvasFile=${encodeURIComponent(
      testServer.fixtureUris[canvasFile]
    )}`
  );

  const { waitForAction, middleware } = middlewareSpy();

  const store = createAppStore({
    history,
    middleware,
    initialDesignerState,
    createRPCClient() {
      return testServer.createConnection();
    },
  });

  const dispose = () => {
    testServer.stop();
  };

  return { store, waitForAction, dispose, testServer, project };
};

export const timeout = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));
