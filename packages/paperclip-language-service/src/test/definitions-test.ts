import { expect } from "chai";
import { collectASTInfo } from "../collect-ast-info";
import { createMockEngineDelegate } from "@paperclip-ui/test-utils";
import { createEngineDelegate } from "@paperclip-ui/core";

describe(__filename + "#", () => {
  [
    [
      `Returns definition info about component instance`,
      {
        "/entry.pc": `
          <div component as="Test" />
          <Test />
        `
      },
      [
        {
          sourceUri: "/entry.pc",
          sourceRange: {
            start: {
              pos: 11,
              line: 2,
              column: 11
            },
            end: {
              pos: 38,
              line: 2,
              column: 38
            }
          },
          sourceDefinitionRange: {
            start: {
              pos: 11,
              line: 2,
              column: 11
            },
            end: {
              pos: 38,
              line: 2,
              column: 38
            }
          },
          instanceRange: {
            start: {
              pos: 50,
              line: 3,
              column: 12
            },
            end: {
              pos: 54,
              line: 3,
              column: 16
            }
          }
        }
      ]
    ],
    [
      `Returns definition info about component that's also an instance`,
      {
        "/entry.pc": `
          <div component as="Test" />
          <Test component as="Test2" />
          <Test2 />
        `
      },
      [
        {
          sourceUri: "/entry.pc",
          sourceRange: {
            start: {
              pos: 11,
              line: 2,
              column: 11
            },
            end: {
              pos: 38,
              line: 2,
              column: 38
            }
          },
          sourceDefinitionRange: {
            start: {
              pos: 11,
              line: 2,
              column: 11
            },
            end: {
              pos: 38,
              line: 2,
              column: 38
            }
          },
          instanceRange: {
            start: {
              pos: 50,
              line: 3,
              column: 12
            },
            end: {
              pos: 54,
              line: 3,
              column: 16
            }
          }
        },
        {
          sourceUri: "/entry.pc",
          sourceRange: {
            start: {
              pos: 49,
              line: 3,
              column: 11
            },
            end: {
              pos: 78,
              line: 3,
              column: 40
            }
          },
          sourceDefinitionRange: {
            start: {
              pos: 49,
              line: 3,
              column: 11
            },
            end: {
              pos: 78,
              line: 3,
              column: 40
            }
          },
          instanceRange: {
            start: {
              pos: 90,
              line: 4,
              column: 12
            },
            end: {
              pos: 95,
              line: 4,
              column: 17
            }
          }
        }
      ]
    ],
    [
      `Returns definition info about imported component`,
      {
        "/entry.pc": `
          <import src="/module.pc" as="Test" />
          <Test.Test />
        `,
        "/module.pc": `
          <div export component as="Test" />
        `
      },
      [
        {
          sourceUri: "/module.pc",
          sourceRange: {
            start: {
              pos: 11,
              line: 2,
              column: 11
            },
            end: {
              pos: 45,
              line: 2,
              column: 45
            }
          },
          sourceDefinitionRange: {
            start: {
              pos: 11,
              line: 2,
              column: 11
            },
            end: {
              pos: 45,
              line: 2,
              column: 45
            }
          },
          instanceRange: {
            start: {
              pos: 60,
              line: 3,
              column: 12
            },
            end: {
              pos: 69,
              line: 3,
              column: 21
            }
          }
        }
      ]
    ],
    [
      `Returns definition info about default imported component`,
      {
        "/entry.pc": `
          <import src="/module.pc" as="Test" />
          <Test />
        `,
        "/module.pc": `
          <div export component as="default" />
        `
      },
      [
        {
          sourceUri: "/module.pc",
          sourceRange: {
            start: {
              pos: 11,
              line: 2,
              column: 11
            },
            end: {
              pos: 48,
              line: 2,
              column: 48
            }
          },
          sourceDefinitionRange: {
            start: {
              pos: 11,
              line: 2,
              column: 11
            },
            end: {
              pos: 48,
              line: 2,
              column: 48
            }
          },
          instanceRange: {
            start: {
              pos: 60,
              line: 3,
              column: 12
            },
            end: {
              pos: 64,
              line: 3,
              column: 16
            }
          }
        }
      ]
    ],
    [
      `Returns definition about instance defined in slot`,
      {
        "/entry.pc": `
          <div component as="Test" />
          {<Test />}
        `,
        "/module.pc": `
          <div export component as="default" />
        `
      },
      [
        {
          sourceUri: "/entry.pc",
          sourceRange: {
            start: {
              pos: 11,
              line: 2,
              column: 11
            },
            end: {
              pos: 38,
              line: 2,
              column: 38
            }
          },
          sourceDefinitionRange: {
            start: {
              pos: 11,
              line: 2,
              column: 11
            },
            end: {
              pos: 38,
              line: 2,
              column: 38
            }
          },
          instanceRange: {
            start: {
              pos: 51,
              line: 3,
              column: 13
            },
            end: {
              pos: 55,
              line: 3,
              column: 17
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

      expect(info.definitions).to.eql(expectedLinks);
    });
  });
});
