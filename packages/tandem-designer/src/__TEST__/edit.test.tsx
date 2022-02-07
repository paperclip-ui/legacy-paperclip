import { CRDTTextDocument } from "@paperclip-ui/editor-engine/lib/core/crdt-document";
import {
  Action,
  globalBackspaceKeyPressed,
  mainActions,
  uiActions,
  resizerMoved,
  resizerStoppedMoving,
} from "..";
import { createMock, DesignerMock, timeout } from "./utils";

const createState = (selectedNodePath: string) => {
  return {
    files: {
      "test.pc": `<div>Hello world</div>`,
    },
    canvasFile: "test.pc",
    initialDesignerState: {
      selectedNodePaths: [selectedNodePath],
      frameBoxes: {
        0: {
          "0.0": { x: 100, y: 100, width: 100, height: 100 },
        },
      },
    },
  };
};

describe(`With a selected child of a frame`, () => {
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

describe(`With a selected element`, () => {
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

  it(`Adds a style to the element when a computed declaration has changed`, async () => {
    mock.store.dispatch(
      uiActions.computedStyleDeclarationChanged({ name: "color", value: "red" })
    );
    await timeout(10);
    expect(doc.getText().replace(/[\n\s]+/g, " ")).toEqual(
      `<div> <style> color: red; </style>Hello world</div>`
    );
  });
});
