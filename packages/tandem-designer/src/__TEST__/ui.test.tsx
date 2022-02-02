import {
  canvasResized,
  globalEscapeKeyPressed,
  globalMetaIKeyPressed,
} from "..";
import { createMock, DesignerMock, timeout } from "./utils";
import { AppState } from "../state";
import {
  AvailableNode,
  AvailableNodeKind,
} from "@paperclip-ui/language-service";
import { uiActions } from "../actions/ui-actions";

let mock: DesignerMock;

beforeEach(async () => {
  mock = await createMock({
    files: {
      "test.pc": `
          <div export component as="Test" />
          <div component as="Test2" />
        `,
      "test2.pc": `
          <div export component as="Test3" />
          <div component as="Test4" />
        `,
    },
    canvasFile: "test.pc",
  });
  await timeout(100);
});

afterEach(() => {
  mock.dispose();
});

describe("Quickfind items", () => {
  test(`When dragged, it's set to the root state, and the quikfind menu is closed`, async () => {
    mock.store.dispatch(globalMetaIKeyPressed(null));
    expect(mock.store.getState().designer.showInsertModal).toEqual(true);
    const node: AvailableNode = {
      kind: AvailableNodeKind.Text,
      name: "Text",
      displayName: "Text",
      description: "",
    };
    mock.store.dispatch(uiActions.quickfindItemStartDrag(node));
    // expect(mock.store.getState().designer.showInsertModal).toEqual(false);
    expect(mock.store.getState().designer.draggingInsertableNode).toEqual(node);
  });

  test(`When document mouse is up, then dragging insertable node is set to undefined`, async () => {
    mock.store.dispatch(globalMetaIKeyPressed(null));
    const node: AvailableNode = {
      kind: AvailableNodeKind.Text,
      name: "Text",
      displayName: "Text",
      description: "",
    };
    mock.store.dispatch(uiActions.quickfindItemStartDrag(node));
    expect(mock.store.getState().designer.draggingInsertableNode).toEqual(node);
    mock.store.dispatch(uiActions.documentMouseUp());
    expect(mock.store.getState().designer.draggingInsertableNode).toEqual(null);
  });

  test(`When dropped into an empty area of the document, it's created as a frame`, async () => {
    const source = await mock.project
      .getDocuments()
      .open(mock.testServer.fixtureUris["test.pc"])
      .then((doc) => doc.getSource());
    mock.store.dispatch(globalMetaIKeyPressed(null));
    const node: AvailableNode = {
      kind: AvailableNodeKind.Text,
      name: "Text",
      displayName: "Text",
      description: "",
    };
    expect(mock.store.getState().designer.showInsertModal).toEqual(true);
    mock.store.dispatch(
      uiActions.toolLayerDrop({ node, point: { x: 0, y: 0 } })
    );
    expect(mock.store.getState().designer.showInsertModal).toEqual(false);
    await timeout(50);
    expect(source.getText().replace(/[\n\s]+/g, " ")).toEqual("a");
  });
});
