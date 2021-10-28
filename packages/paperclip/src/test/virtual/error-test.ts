import { expect } from "chai";
import { createMockEngine } from "../utils";

describe(__filename + "#", () => {
  [
    [
      `<a>abba`,
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
    ],
    [
      `\n\n<a>`,
      {
        errorKind: "Graph",
        uri: "/entry.pc",
        info: {
          kind: "Unterminated",
          message: "Unterminated element.",
          range: {
            start: {
              pos: 2,
              line: 3,
              column: 1
            },
            end: {
              pos: 5,
              line: 3,
              column: 4
            }
          }
        }
      }
    ],
    [
      `\n\n<a href='`,
      {
        errorKind: "Graph",
        uri: "/entry.pc",
        info: {
          kind: "Unterminated",
          message: "Unterminated string literal.",
          range: {
            start: {
              pos: 10,
              line: 3,
              column: 9
            },
            end: {
              pos: 11,
              line: 3,
              column: 10
            }
          }
        }
      }
    ],
    [
      `👏<a href='`,
      {
        errorKind: "Graph",
        uri: "/entry.pc",
        info: {
          kind: "Unterminated",
          message: "Unterminated string literal.",
          range: {
            start: {
              pos: 10,
              line: 1,
              column: 11
            },
            end: {
              pos: 11,
              line: 1,
              column: 12
            }
          }
        }
      }
    ],
    [
      `\n👏\n<a href='`,
      {
        errorKind: "Graph",
        uri: "/entry.pc",
        info: {
          kind: "Unterminated",
          message: "Unterminated string literal.",
          range: {
            start: {
              pos: 12,
              line: 3,
              column: 9
            },
            end: {
              pos: 13,
              line: 3,
              column: 10
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
