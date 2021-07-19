import { createMockEngine } from "../utils";
import { expect } from "chai";

describe(__filename + "#", () => {
  const cases = [
    [
      "Can inspect a simple node",
      {
        "/entry.pc": `<div>
          <style>
            color: red;
          </style>
        </div>`
      },
      100,
      {
        styleRules: [
          {
            selectorText: "._406d2856._406d2856",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "406d2856",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-1",
                name: "color",
                value: "red",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "Sets inline style at a higher priority than document class",
      {
        "/entry.pc": `
          <style>
            .item {
              color: blue;
            }
          </style>
          <div class="item">
            <style>
              color: red;
            </style>
          </div>
        `
      },
      100,
      {
        styleRules: [
          {
            selectorText: "._376a18c0._376a18c0",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._376a18c0",
                  scope: {
                    kind: "Element",
                    id: "376a18c0"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._376a18c0",
                  scope: {
                    kind: "Element",
                    id: "376a18c0"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "376a18c0",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-5-1",
                name: "color",
                value: "red",
                active: true
              }
            ],
            specificity: 4
          },
          {
            selectorText: "[class]._80f4925f_item",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Attribute",
                  value: "[class]"
                },
                {
                  kind: "Class",
                  name: "item",
                  value: "._80f4925f_item",
                  scope: {
                    kind: "Document",
                    id: "80f4925f"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "80f4925f-1-2",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-1",
                name: "color",
                value: "blue",
                active: false
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "Ignores :hover selector",
      {
        "/entry.pc": `
          <div className:hover="hover">
            <style>
              color: red;
              &:hover {
                color: red;
              }
            </style>
          </div>
        `
      },
      100,
      {
        styleRules: [
          {
            selectorText: "._406d2856._406d2856",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "406d2856",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-3-1",
                name: "color",
                value: "red",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "Combo has different specificity than class",
      {
        "/entry.pc": `
          <style>
            .a {
              color: red;
            }
            .a.b {
              color: blue;
            }
          </style>
          <div class="a b" />
        `
      },
      100,
      {
        styleRules: [
          {
            selectorText: "._80f4925f_a._80f4925f_b._80f4925f",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: "a",
                  value: "._80f4925f_a",
                  scope: {
                    kind: "Document",
                    id: "80f4925f"
                  }
                },
                {
                  kind: "Class",
                  name: "b",
                  value: "._80f4925f_b",
                  scope: {
                    kind: "Document",
                    id: "80f4925f"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._80f4925f",
                  scope: {
                    kind: "Document",
                    id: "80f4925f"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "80f4925f-1-4",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-3",
                name: "color",
                value: "blue",
                active: true
              }
            ],
            specificity: 6
          },
          {
            selectorText: "[class]._80f4925f_a",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Attribute",
                  value: "[class]"
                },
                {
                  kind: "Class",
                  name: "a",
                  value: "._80f4925f_a",
                  scope: {
                    kind: "Document",
                    id: "80f4925f"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "80f4925f-1-2",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-1",
                name: "color",
                value: "red",
                active: false
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "Can inspect global styles",
      {
        "/entry.pc": `
          <style>
            :global(.a) {
              color: red;
            }
          </style>
          <div class="a b" />
        `
      },
      100,
      {
        styleRules: [
          {
            selectorText: ".a",
            selectorInfo: {
              kind: "Class",
              name: "a",
              value: ".a",
              scope: null
            },
            pseudoElementName: null,
            sourceId: "80f4925f-1-2",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-1",
                name: "color",
                value: "red",
                active: true
              }
            ],
            specificity: 2
          }
        ]
      }
    ]
  ] as any;

  for (const [title, graph, screenWidth, result] of cases) {
    it(title, async () => {
      const engine = await createMockEngine(graph);
      await engine.open("/entry.pc");
      const inspection = engine.inspectNodeStyles(
        { path: [0], uri: "/entry.pc" },
        screenWidth
      );

      expect(inspection).to.eql(result);
    });
  }
});
