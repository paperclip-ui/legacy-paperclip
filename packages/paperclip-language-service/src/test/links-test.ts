import { expect } from "chai";
import { collectASTInfo } from "../collect-ast-info";
import { createMockEngineDelegate } from "paperclip-test-utils";

describe(__filename + "#", () => {
  [
    [
      `returns link to import`,
      {
        "/entry.pc": `
          <import src="./test.pc" as="test" />
        `,
        "/test.pc": `
          something
        `
      },
      [
        {
          uri: "/test.pc",
          location: {
            start: 24,
            end: 33
          }
        }
      ]
    ]
  ].forEach(([name, graph, expectedLinks]: any) => {
    it(name, () => {
      const engine = createMockEngineDelegate(graph);
      engine.open("/entry.pc");
      const info = collectASTInfo(
        "/entry.pc",
        engine.getLoadedGraph(),
        engine.getAllLoadedData()
      );
      // console.log(info.links);

      expect(info.links).to.eql(expectedLinks);
    });
  });
});
