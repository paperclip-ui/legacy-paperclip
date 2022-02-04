import {
  canvasMouseDown,
  canvasMouseMoved,
  canvasResized,
  globalBackspaceKeyPressed,
  globalHKeyDown,
  rectsCaptured,
} from "..";
import { createMock, DesignerMock } from "./utils";
import { AppState } from "../state";

describe(`With a basic project`, () => {
  let mock: DesignerMock;

  beforeEach(async () => {
    mock = await createMock({
      files: {
        "test.pc": "Hello world",
        "test2.pc": "<div>blarg</div>",
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
    ).toEqual([mock.testServer.fixtureUris["test.pc"]]);
  });

  test(`Automatically centers the canvas when a canvas is loaded`, async () => {
    mock.store.dispatch(canvasResized({ width: 3000, height: 3000 }));
    let state = mock.store.getState() as AppState;
    expect(state.designer.canvas.transform).toEqual({ x: 988, y: 1116, z: 1 });
  });

  describe(`When a selected canvas frame`, () => {
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

    test(`node is inspected`, () => {
      expect(
        mock.store.getState().designer.selectedNodeStyleInspections
      ).toEqual([
        {
          styleRules: [],
        },
      ]);
    });

    test(`Is deselected when the file is cleared`, async () => {
      expect(mock.store.getState().designer.selectedNodePaths).toEqual(["0"]);

      const client = await mock.project
        .getDocuments()
        .open(mock.testServer.fixtureUris["test.pc"]);

      const source = await client.getSource();

      // clear the doc
      source.applyEdits([
        { chars: [], index: 0, deleteCount: source.getText().length },
      ]);

      // ensure that the element is no longer selected
      expect(mock.store.getState().designer.selectedNodePaths).toEqual([]);
      expect(
        mock.store.getState().designer.selectedNodeStyleInspections
      ).toEqual([]);
    });

    test(`Can be hidden`, async () => {
      expect(mock.store.getState().designer.selectedNodePaths).toEqual(["0"]);
      expect(
        Object.keys(mock.store.getState().designer.frameBoxes).length
      ).toEqual(1);
      mock.store.dispatch(globalHKeyDown(null) as any);
      const client = await mock.project
        .getDocuments()
        .open(mock.testServer.fixtureUris["test.pc"]);
      const source = await client.getSource();
      expect(source.getText().replace(/\n/g, " ")).toEqual(
        `<!--   @frame { visible: false } --> Hello world`
      );

      // assert is deselected
      expect(mock.store.getState().designer.selectedNodePaths).toEqual([]);

      // ensure that box is removed so that it doesn't appear in canvas
      expect(
        Object.keys(mock.store.getState().designer.frameBoxes).length
      ).toEqual(0);

      expect(
        mock.store.getState().designer.selectedNodeStyleInspections
      ).toEqual([]);
    });

    test(`Can be deleted`, async () => {
      expect(mock.store.getState().designer.selectedNodePaths.length).toEqual(
        1
      );
      expect(
        mock.store.getState().designer.selectedNodeStyleInspections.length
      ).toEqual(1);
      mock.store.dispatch(globalBackspaceKeyPressed(null) as any);
      const client = await mock.project
        .getDocuments()
        .open(mock.testServer.fixtureUris["test.pc"]);
      const source = await client.getSource();
      expect(source.getText().replace(/\n/g, " ")).toEqual(``);
      expect(mock.store.getState().designer.selectedNodePaths.length).toEqual(
        0
      );
      expect(
        mock.store.getState().designer.selectedNodeStyleInspections.length
      ).toEqual(0);
    });
  });

  test.todo("Can reveal source by clicking a canvas element");
  test.todo("Can reveal source code by clicking a breadcrumb");
  test.todo("Can pop windows out of the editor");
});
