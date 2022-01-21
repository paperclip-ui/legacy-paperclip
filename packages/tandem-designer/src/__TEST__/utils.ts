import * as URL from "url";
import { createTestServer } from "@tandem-ui/workspace/src/test/utils";
import { createMemoryHistory } from "history";
import { createAppStore } from "../components/Main/create-app-store";
import { Store } from "redux";
import { Action } from "..";

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
};

export type DesignerMock = {
  store: ReturnType<typeof createAppStore>;
  waitForAction: (type: string) => Promise<Action>;
  dispose: () => void;
};

export const createMock = async ({
  files,
  canvasFile,
}: CreateMockOptions): Promise<DesignerMock> => {
  const testServer = await createTestServer(files);

  const client = testServer.createClient();
  const project = await client.openProject({
    uri: URL.pathToFileURL(testServer.testDir).href,
  });
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
    createRPCClient() {
      return testServer.createConnection();
    },
  });

  const dispose = () => {
    testServer.stop();
  };

  return { store, waitForAction, dispose };
};
