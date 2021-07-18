import { createMockEngine, stringifyLoadResult } from "../utils";
import { expect } from "chai";
import { inspect } from "util";

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
      []
    ]
  ] as any;

  for (const [title, graph, screenWidth, result] of cases) {
    it(title, async () => {
      const engine = await createMockEngine(graph);
      await engine.open("/entry.pc");
      const inspection = engine.inspectNodeStyles(
        [0],
        "/entry.pc",
        screenWidth
      );

      expect(inspection).to.eql({
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
                name: "color",
                value: "red",
                active: true
              }
            ],
            specificity: 2
          }
        ]
      });
    });
  }
});
