import { expect } from "chai";
import { collectASTInfo } from "../collect-ast-info";
import { createMockEngineDelegate } from "@paperclipui/test-utils";
import { createEngineDelegate } from "@paperclipui/core";

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
          range: {
            start: {
              pos: 24,
              line: 2,
              column: 24
            },
            end: {
              pos: 33,
              line: 2,
              column: 33
            }
          }
        }
      ]
    ]
  ].forEach(([name, graph, expectedLinks]: any) => {
    it(name, () => {
      const engine = createMockEngineDelegate(createEngineDelegate)(graph);
      engine.open("/entry.pc");
      const info = collectASTInfo(
        "/entry.pc",
        engine.getLoadedGraph(),
        engine.getAllLoadedData()
      );
      expect(info.links).to.eql(expectedLinks);
    });
  });
});
