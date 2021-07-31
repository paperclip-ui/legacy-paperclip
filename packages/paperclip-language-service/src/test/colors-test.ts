import { expect } from "chai";
import { collectASTInfo } from "../collect-ast-info";
import { createMockEngineDelegate } from "paperclip-test-utils";

describe(__filename + "#", () => {
  [
    [
      `it can pull basic color information from a style rule`,
      {
        "/entry.pc": `
          <style>
            div {
              color: red;
            }
          </style>
        `
      },
      []
    ]
  ].forEach(([name, graph, expectedColors]: any) => {
    it(name, () => {
      const engine = createMockEngineDelegate(graph);
      engine.open("/entry.pc");
      const info = collectASTInfo(
        "/entry.pc",
        engine.getAllLoadedASTs(),
        engine.getAllLoadedData()
      );
      expect(info.colors).to.eql(expectedColors);
    });
  });
});
