import { canvasResized, workspaceActions } from "..";
import { createMock, DesignerMock } from "./utils";
import { AppState } from "../state";

describe(`With a basic project`, () => {
  let mock: DesignerMock;

  beforeEach(async () => {
    mock = await createMock({
      files: {
        "test.pc": "Hello world",
      },
      canvasFile: "test.pc",
    });
  });

  afterEach(() => {
    mock.dispose();
  });

  test(`Automatically loads all frame on init`, async () => {
    const frames = (await mock.waitForAction(
      workspaceActions.allFramesLoaded.type
    )) as ReturnType<typeof workspaceActions.allFramesLoaded>;
  });

  test(`Automatically centers the canvas when a canvas is loaded`, async () => {
    mock.store.dispatch(canvasResized({ width: 3000, height: 3000 }));
    let state = mock.store.getState() as AppState;
    (await mock.waitForAction(
      workspaceActions.allFramesLoaded.type
    )) as ReturnType<typeof workspaceActions.allFramesLoaded>;
    state = mock.store.getState() as AppState;
    expect(state.designer.canvas.transform).toEqual({ x: 988, y: 1116, z: 1 });
  });

  test(`When a canvas element is selected, and the canvas is cleared, selected elements are also cleared`, async () => {
    // mock.store.dispatch(canvasResized({ width: 3000, height: 3000 }));
  });

  test.todo("Can reveal source by clicking a canvas element");
  test.todo("Can reveal source code by clicking a breadcrumb");
  test.todo("Can pop windows out of the editor");
});
