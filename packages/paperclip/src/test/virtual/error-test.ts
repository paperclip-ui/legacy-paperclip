import { expect } from "chai";
import { createMockEngine, stringifyLoadResult } from "../utils";

describe(__filename + "#", () => {
  [
    [
      `<a>`,
      {
        errorKind: "Graph",
        uri: "/entry.pc",
        info: {
          kind: "Unterminated",
          message: "Unterminated element.",
          range: {
            start: {
              pos: 0,
              line: 1,
              column: 1
            },
            end: {
              pos: 3,
              line: 1,
              column: 4
            }
          }
        }
      }
    ]
  ].forEach(async ([source, expectedError]: [string, string]) => {
    it(`Displays proper error information for ${source}`, async () => {
      const graph = {
        "/entry.pc": source
      };

      const engine = await createMockEngine(graph);

      let err;

      try {
        await engine.open("/entry.pc");
      } catch (e) {
        err = e;
      }

      expect(err).to.eql(expectedError);
    });
  });
});
