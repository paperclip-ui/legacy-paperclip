import { CRDTTextDocument } from "@paperclip-ui/editor-engine/lib/core/crdt-document";
import { AvailableNodeKind } from "@paperclip-ui/language-service";
import {
  Action,
  globalBackspaceKeyPressed,
  mainActions,
  uiActions,
  resizerMoved,
  resizerStoppedMoving,
  canvasMouseMoved,
} from "..";
import { createMock, DesignerMock, timeout } from "./utils";

describe(`With a selected text child of a frame`, () => {
  let mock: DesignerMock;
  let doc: CRDTTextDocument;

  beforeEach(async () => {
    mock = await createMock({
      files: {
        "test.pc": `<div>Hello world</div>`,
      },
      canvasFile: "test.pc",
      initialDesignerState: {
        selectedNodePaths: ["0.0"],
        frameBoxes: {
          0: {
            "0.0": { x: 100, y: 100, width: 100, height: 100 },
          },
        },
      },
    });
    doc = await mock.project
      .getDocuments()
      .open(mock.testServer.fixtureUris["test.pc"])
      .then((doc) => doc.getSource());
    await timeout(100);
  });

  it(`When the resizer stops moving, annotations aren't set on the text child`, async () => {
    const bounds = { x: 100, y: 100, width: 100, height: 100 };
    mock.store.dispatch(
      resizerMoved({
        originalBounds: bounds,
        newBounds: bounds,
        anchor: { x: 0, y: 0 },
      }) as Action
    );
    mock.store.dispatch(
      resizerStoppedMoving({
        originalBounds: bounds,
        newBounds: bounds,
        anchor: { x: 0, y: 0 },
      }) as Action
    );
    await timeout(10);
    expect(doc.getText().replace(/[\n\s]+/g, " ")).not.toEqual(
      `<div><!-- @frame { height: 100, width: 100, x: 100, y: 100 } --> Hello world</div>`
    );
  });

  it(`When the delete key is pressed, the selected node is removed`, async () => {
    mock.store.dispatch(globalBackspaceKeyPressed(null));
    await timeout(10);
    expect(doc.getText().replace(/[\n\s]+/g, " ")).toEqual(`<div></div>`);
  });
});

describe(`With a selected element that has a child element`, () => {
  let mock: DesignerMock;
  let doc: CRDTTextDocument;

  beforeEach(async () => {
    mock = await createMock({
      files: {
        "test.pc": `<div>Hello world</div>`,
      },
      canvasFile: "test.pc",
      initialDesignerState: {
        selectedNodePaths: ["0"],
        frameBoxes: {
          0: {
            "0": { x: 100, y: 100, width: 100, height: 100 },
          },
        },
      },
    });
    doc = await mock.project
      .getDocuments()
      .open(mock.testServer.fixtureUris["test.pc"])
      .then((doc) => doc.getSource());
    await timeout(100);
  });

  it(`Adds a style to the element when a computed declaration has changed`, async () => {
    mock.store.dispatch(
      uiActions.computedStyleDeclarationChanged({ name: "color", value: "red" })
    );
    await timeout(10);
    expect(doc.getText().replace(/[\n\s]+/g, " ")).toEqual(
      `<div> <style> color: red; </style>Hello world</div>`
    );
  });

  it(`When a new element is dropped, that child is selected`, async () => {
    mock.store.dispatch(canvasMouseMoved({ x: 100, y: 100 }));
    expect(mock.store.getState().designer.highlightNodePath).toEqual("0");
    expect(mock.store.getState().designer.showTextEditor).toEqual(false);
    mock.store.dispatch(
      uiActions.toolLayerDrop({
        node: {
          kind: AvailableNodeKind.Element,
          displayName: "div",
          name: "div",
          description: "",
        },
        point: { x: 100, y: 100 },
      })
    );
    expect(mock.store.getState().designer.selectedNodePaths).toEqual(["0.1"]);
    expect(mock.store.getState().designer.showTextEditor).toEqual(false);
    await timeout(10);
    expect(doc.getText()).toEqual(
      `<div>Hello world<div data-pc-show-insert /></div>`
    );
  });

  it(`And a text node is dropped, the editor will select the first child since it's merged with the dropped text`, async () => {
    mock.store.dispatch(canvasMouseMoved({ x: 100, y: 100 }));
    expect(mock.store.getState().designer.showTextEditor).toEqual(false);
    mock.store.dispatch(
      uiActions.toolLayerDrop({
        node: {
          kind: AvailableNodeKind.Text,
          displayName: "text",
          name: "text",
          description: "",
        },
        point: { x: 500, y: 500 },
      })
    );
    expect(mock.store.getState().designer.selectedNodePaths).toEqual(["0.0"]);
    expect(mock.store.getState().designer.showTextEditor).toEqual(true);
    await timeout(10);
    expect(doc.getText()).toEqual(`<div>Hello worldDouble click to edit</div>`);
  });
});

describe(`With an element that has an element child`, () => {
  let mock: DesignerMock;
  let doc: CRDTTextDocument;

  beforeEach(async () => {
    mock = await createMock({
      files: {
        "test.pc": `<div><span /></div>`,
      },
      canvasFile: "test.pc",
      initialDesignerState: {
        selectedNodePaths: ["0"],
        frameBoxes: {
          0: {
            "0": { x: 100, y: 100, width: 100, height: 100 },
          },
        },
      },
    });
    doc = await mock.project
      .getDocuments()
      .open(mock.testServer.fixtureUris["test.pc"])
      .then((doc) => doc.getSource());
    await timeout(100);
  });

  it(`And a text node is dropped, the editor will select it`, async () => {
    mock.store.dispatch(canvasMouseMoved({ x: 100, y: 100 }));
    expect(mock.store.getState().designer.showTextEditor).toEqual(false);
    mock.store.dispatch(
      uiActions.toolLayerDrop({
        node: {
          kind: AvailableNodeKind.Text,
          displayName: "text",
          name: "text",
          description: "",
        },
        point: { x: 500, y: 500 },
      })
    );
    expect(mock.store.getState().designer.selectedNodePaths).toEqual(["0.1"]);
    expect(mock.store.getState().designer.showTextEditor).toEqual(true);
    await timeout(10);
    expect(doc.getText()).toEqual(`<div><span />Double click to edit</div>`);
  });
});

describe(`With no selected elements`, () => {
  let mock: DesignerMock;
  let doc: CRDTTextDocument;

  beforeEach(async () => {
    mock = await createMock({
      files: {
        "test.pc": `<div>Hello world</div>`,
      },
      canvasFile: "test.pc",
      initialDesignerState: {
        selectedNodePaths: [],
        frameBoxes: {
          0: {
            "0": { x: 100, y: 100, width: 100, height: 100 },
          },
        },
      },
    });
    doc = await mock.project
      .getDocuments()
      .open(mock.testServer.fixtureUris["test.pc"])
      .then((doc) => doc.getSource());
    await timeout(100);
  });

  it(`When a new element is dropped, that child is selected`, async () => {
    mock.store.dispatch(canvasMouseMoved({ x: 500, y: 500 }));
    mock.store.dispatch(
      uiActions.toolLayerDrop({
        node: {
          kind: AvailableNodeKind.Element,
          displayName: "div",
          name: "div",
          description: "",
        },
        point: { x: 500, y: 500 },
      })
    );
    expect(mock.store.getState().designer.selectedNodePaths).toEqual(["1"]);
    await timeout(10);
    expect(doc.getText()).toEqual(
      `<div>Hello world</div>\n\n<!--\n  @frame { x: -12, y: 116, width: 1024, height: 768 }\n-->\n<div data-pc-show-insert />`
    );
  });
});
