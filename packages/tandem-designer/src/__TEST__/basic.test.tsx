import { createMemoryHistory } from "history";
import { Store } from "redux";
import * as URL from "url";
import { createTestServer } from "@tandem-ui/workspace/src/test/utils";
import { createAppStore } from "../components/Main/create-app-store";
import { canvasResized, workspaceActions } from "..";
import { middlewareSpy } from "./utils";
import { AppState } from "../state";

describe(`With a basic project`, () => {
  let testServer;
  let store;
  let waitForAction;

  beforeEach(async () => {
    testServer = await createTestServer({
      "test.pc": "Hello world",
    });

    const client = testServer.createClient();
    const project = await client.openProject({
      uri: URL.pathToFileURL(testServer.testDir).href,
    });
    const history = createMemoryHistory();
    history.push(
      `?projectId=${project.getProperties().id}&canvasFile=${encodeURIComponent(
        testServer.fixtureUris["test.pc"]
      )}`
    );

    const { waitForAction: waitForAction2, middleware } = middlewareSpy();
    waitForAction = waitForAction2;
    store = createAppStore({
      history,
      middleware,
      createRPCClient() {
        return testServer.createConnection();
      },
    });
  });

  afterEach(() => {
    testServer.stop();
  });

  test(`Automatically loads all frame on init`, async () => {
    const frames = (await waitForAction(
      workspaceActions.allFramesLoaded.type
    )) as ReturnType<typeof workspaceActions.allFramesLoaded>;
  });

  test(`Automatically centers the canvas when a canvas is loaded`, async () => {
    store.dispatch(canvasResized({ width: 3000, height: 3000 }));
    let state = store.getState() as AppState;
    (await waitForAction(workspaceActions.allFramesLoaded.type)) as ReturnType<
      typeof workspaceActions.allFramesLoaded
    >;
    state = store.getState() as AppState;
    expect(state.designer.canvas.transform).toEqual({ x: 988, y: 1116, z: 1 });
  });
});
