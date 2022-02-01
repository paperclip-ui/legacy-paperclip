import { canvasResized, globalMetaIKeyPressed } from "..";
import { createMock, DesignerMock } from "./utils";
import { AppState } from "../state";

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
});

afterEach(() => {
  mock.dispose();
});

test(`When meta + i is pressed, all available insertable elements are stored in state`, async () => {
  mock.store.dispatch(globalMetaIKeyPressed(null));
});
