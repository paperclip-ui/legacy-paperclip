import {
  canvasResized,
  globalEscapeKeyPressed,
  globalMetaIKeyPressed,
} from "..";
import { createMock, DesignerMock, timeout } from "./utils";
import { AppState } from "../state";
import {
  AvailableElement,
  AvailableInstance,
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

  test(`When a text node dropped into an empty area of the document, it's created as a frame`, async () => {
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
    await 1;
    expect(source.getText().replace(/[\n\s]+/g, " ")).toEqual(
      ' <div export component as="Test" /> <div component as="Test2" /> <!-- @frame { x: -512, y: -384, width: 1024, height: 768 } --> Double click to edit'
    );
  });

  test(`When an element is dropped into an empty area of the document, it's created as a frame`, async () => {
    const source = await mock.project
      .getDocuments()
      .open(mock.testServer.fixtureUris["test.pc"])
      .then((doc) => doc.getSource());
    mock.store.dispatch(globalMetaIKeyPressed(null));
    const node: AvailableElement = {
      kind: AvailableNodeKind.Element,
      name: "div",
      displayName: "Div",
      description: "",
    };
    expect(mock.store.getState().designer.showInsertModal).toEqual(true);
    mock.store.dispatch(
      uiActions.toolLayerDrop({ node, point: { x: 0, y: 0 } })
    );
    expect(mock.store.getState().designer.showInsertModal).toEqual(false);
    await 1;
    expect(source.getText().replace(/[\n\s]+/g, " ")).toEqual(
      ' <div export component as="Test" /> <div component as="Test2" /> <!-- @frame { x: -512, y: -384, width: 1024, height: 768 } --> <div data-pc-show-insert />'
    );
  });

  test(`When an instance is dropped into an empty area of the document and, it's created & the import is included`, async () => {
    const source = await mock.project
      .getDocuments()
      .open(mock.testServer.fixtureUris["test.pc"])
      .then((doc) => doc.getSource());
    mock.store.dispatch(globalMetaIKeyPressed(null));
    const node: AvailableInstance = {
      kind: AvailableNodeKind.Instance,
      sourceUri: mock.testServer.fixtureUris["test2.pc"],
      name: "Test4",
      displayName: "Test4",
      description: "",
    };
    expect(mock.store.getState().designer.showInsertModal).toEqual(true);
    mock.store.dispatch(
      uiActions.toolLayerDrop({ node, point: { x: 0, y: 0 } })
    );
    expect(mock.store.getState().designer.showInsertModal).toEqual(false);
    await 1;
    expect(source.getText().replace(/[\n\s]+/g, " ")).toEqual(
      `<import src=\"${mock.testServer.fixtureUris["test2.pc"]}\" as=\"test2\" /> <div export component as="Test" /> <div component as="Test2" /> <!-- @frame { x: -512, y: -384, width: 1024, height: 768 } --> <test2.Test4 />`
    );
  });
});
