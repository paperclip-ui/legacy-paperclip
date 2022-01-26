import {
  canvasMouseDown,
  canvasMouseMoved,
  canvasResized,
  rectsCaptured,
  workspaceActions,
} from "..";
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

  test(`Automatically loads the project frame on init`, async () => {
    expect(
      Object.keys(mock.store.getState().designer.allLoadedPCFileData)
    ).toEqual([`file:///tmp/__TEST__/fixtures/test.pc`]);
  });

  test(`Automatically centers the canvas when a canvas is loaded`, async () => {
    mock.store.dispatch(canvasResized({ width: 3000, height: 3000 }));
    let state = mock.store.getState() as AppState;
    expect(state.designer.canvas.transform).toEqual({ x: 988, y: 1116, z: 1 });
  });

  describe(`With a selected canvas element`, () => {
    beforeEach(() => {
      [
        canvasResized({ width: 900, height: 900 }),

        rectsCaptured({
          frameIndex: 0,
          boxes: { "0": { width: 1000, height: 1000, x: 0, y: 0 } },
        }),

        // hover over frame
        canvasMouseMoved({ x: 200, y: 200 }),

        // select it
        canvasMouseDown({
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
          timestamp: 0,
        }),
      ].forEach(mock.store.dispatch);
      expect(mock.store.getState().designer.selectedNodePaths).toEqual(["0"]);
    });

    test(`Is deselected when the file is cleared`, async () => {
      expect(mock.store.getState().designer.selectedNodePaths).toEqual(["0"]);
      const client = await mock.project
        .getDocuments()
        .open(mock.testServer.fixtureUris["test.pc"]);
      const source = await client.getSource();
      source.applyEdits([
        { chars: [], index: 0, deleteCount: source.getText().length },
      ]);
      expect(mock.store.getState().designer.selectedNodePaths).toEqual([]);
    });
  });

  test.todo("Can reveal source by clicking a canvas element");
  test.todo("Can reveal source code by clicking a breadcrumb");
  test.todo("Can pop windows out of the editor");
});
