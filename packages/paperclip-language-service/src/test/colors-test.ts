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
      [
        {
          value: {
            red: 255,
            green: 0,
            blue: 0,
            alpha: 1
          },
          location: {
            start: 58,
            end: 61
          }
        }
      ]
    ],
    [
      `it can pull color information out fo rgba`,
      {
        "/entry.pc": `
          <style>
            div {
              color: rgba(0, 0, 0, 1);
            }
          </style>
        `
      },
      [
        {
          value: {
            red: 0,
            green: 0,
            blue: 0,
            alpha: 1
          },
          location: {
            start: 58,
            end: 74
          }
        }
      ]
    ],
    [
      `it can pull color information out of nested element`,
      {
        "/entry.pc": `
          <style>
            div {
              div {
                color: blue;
              }
            }
          </style>
        `
      },
      [
        {
          value: {
            red: 0,
            green: 0,
            blue: 255,
            alpha: 1
          },
          location: {
            start: 80,
            end: 84
          }
        }
      ]
    ],
    [
      `can pull color information out of media queries`,
      {
        "/entry.pc": `
          <style>
            @media screen {
              span {
                color: blue;
              }
            }
          </style>
        `
      },
      [
        {
          value: {
            red: 0,
            green: 0,
            blue: 255,
            alpha: 1
          },
          location: {
            start: 91,
            end: 95
          }
        }
      ]
    ],
    [
      `can pull color information out of key frames`,
      {
        "/entry.pc": `
          <style>
            @keyframes a {
              from {
                color: red;
              }
            }
          </style>
        `
      },
      [
        {
          value: {
            red: 255,
            green: 0,
            blue: 0,
            alpha: 1
          },
          location: {
            start: 90,
            end: 93
          }
        }
      ]
    ],
    [
      `can pull color information out of scoped styles`,
      {
        "/entry.pc": `
          <div>
            <style>
              color: hsl(0, 100%, 50%);
            </style>
          </div>
        `
      },
      [
        {
          value: {
            red: 0,
            green: 100,
            blue: 50,
            alpha: 1
          },
          location: {
            start: 58,
            end: 75
          }
        }
      ]
    ],
    [
      `can pull color information out of variables`,
      {
        "/entry.pc": `
          <div>
            <style>
              --a: red;
              color: var(--a);
            </style>
          </div>
        `
      },
      [
        {
          value: {
            red: 255,
            green: 0,
            blue: 0,
            alpha: 1
          },
          location: {
            start: 56,
            end: 59
          }
        },
        {
          value: {
            red: 255,
            green: 0,
            blue: 0,
            alpha: 1
          },
          location: {
            start: 82,
            end: 90
          }
        }
      ]
    ],
    [
      `can pull color information out variables from other documents`,
      {
        "/entry.pc": `
          <import src="/atoms.css" />
          <div>
            <style>
              color: var(--color);
            </style>
          </div>
        `,
        "/atoms.css": `
          :root {
            --color: red;
          }
        `
      },
      [
        {
          value: {
            red: 255,
            green: 0,
            blue: 0,
            alpha: 1
          },
          location: {
            start: 96,
            end: 108
          }
        }
      ]
    ],
    [
      `can parse rgb colors`,
      {
        "/entry.pc": `
          <div>
            <style>
              color: rgb(255, 5, 5);
            </style>
          </div>
        `
      },
      [
        {
          value: {
            red: 255,
            green: 0,
            blue: 0,
            alpha: 1
          },
          location: {
            start: 96,
            end: 108
          }
        }
      ]
    ]
  ].forEach(([name, graph, expectedColors]: any) => {
    it(name, () => {
      const engine = createMockEngineDelegate(graph);
      engine.open("/entry.pc");
      const info = collectASTInfo(
        "/entry.pc",
        engine.getLoadedGraph(),
        engine.getAllLoadedData()
      );
      console.log(JSON.stringify(info.colors));

      expect(info.colors).to.eql(expectedColors);
    });
  });
});
