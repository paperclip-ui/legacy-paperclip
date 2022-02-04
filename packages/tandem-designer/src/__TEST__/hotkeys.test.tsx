import {
  canvasResized,
  globalEscapeKeyPressed,
  globalMetaIKeyPressed,
} from "..";
import { createMock, DesignerMock, timeout } from "./utils";
import { AppState } from "../state";
import { AvailableNodeKind } from "@paperclip-ui/language-service";

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

test(`When meta + i is pressed, all available insertable elements are stored in state`, async () => {
  mock.store.dispatch(globalMetaIKeyPressed(null));

  // wait for async
  await timeout(10);

  // need to wait for all files to load
  const insertableNodes = mock.store.getState().designer.insertableNodes;
  expect(insertableNodes.length).toEqual(154);
  const insertableInstances = insertableNodes.filter(
    (node) => node.kind === AvailableNodeKind.Instance
  );
  expect(mock.store.getState().designer.showInsertModal).toEqual(true);
  expect(insertableInstances).toEqual([
    {
      kind: "Instance",
      displayName: "Test",
      name: "Test",
      description: "",
      sourceUri: mock.testServer.fixtureUris["test.pc"],
    },
    {
      kind: "Instance",
      displayName: "Test2",
      name: "Test2",
      description: "",
      sourceUri: mock.testServer.fixtureUris["test.pc"],
    },
    {
      kind: "Instance",
      displayName: "Test3",
      name: "Test3",
      description: "",
      sourceUri: mock.testServer.fixtureUris["test2.pc"],
    },
  ]);
});

test(`When meta + i is pressed, then esc, insert modal is hidden`, async () => {
  mock.store.dispatch(globalMetaIKeyPressed(null));
  expect(mock.store.getState().designer.showInsertModal).toEqual(true);
  mock.store.dispatch(globalEscapeKeyPressed(null));
  expect(mock.store.getState().designer.showInsertModal).toEqual(false);
});
