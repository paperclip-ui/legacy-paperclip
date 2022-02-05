import {
  Action,
  globalBackspaceKeyPressed,
  resizerMoved,
  resizerStoppedMoving,
} from "..";
import { createMock, DesignerMock, timeout } from "./utils";

describe(`With a selected child of a frame`, () => {
  let mock: DesignerMock;

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
    await timeout(100);
  });

  it(`When the resizer stops moving, annotations aren't set on the text child`, async () => {
    const bounds = { x: 100, y: 100, width: 100, height: 100 };
    const doc = await mock.project
      .getDocuments()
      .open(mock.testServer.fixtureUris["test.pc"])
      .then((doc) => doc.getSource());
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
    const doc = await mock.project
      .getDocuments()
      .open(mock.testServer.fixtureUris["test.pc"])
      .then((doc) => doc.getSource());
    mock.store.dispatch(globalBackspaceKeyPressed(null));

    await timeout(10);
    console.log(doc.getText());
    expect(doc.getText().replace(/[\n\s]+/g, " ")).toEqual(`<div></div>`);
  });
});
