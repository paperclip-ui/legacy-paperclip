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
            specificity: 2
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
            specificity: 2
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

      console.log(JSON.stringify(inspection, null, 2));

      expect(inspection).to.eql(result);
    });
  }
});
