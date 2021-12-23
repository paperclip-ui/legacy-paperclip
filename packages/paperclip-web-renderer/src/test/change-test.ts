import { LoadedPCData } from "paperclip-utils";
import { createMockEngine, createMockFramesRenderer } from "./utils";
import { expect } from "chai";
import { FramesRenderer } from "../frame-renderer";

describe(__filename, () => {
  [
    [
      "Can render changes from two different fiefiles",
      [
        {
          "entry.pc": `A`
        },
        "a"
      ],
      [
        {
          "entry.pc": `B`
        },
        "a"
      ]
    ],
    [
      "Properly replaces style rules",
      [
        {
          "entry.pc": `<style>.a {color: red;  } </style>a`
        },
        "g"
      ],
      [
        {
          "entry.pc": `<style>.b {color: red;  } </style>a`
        },
        "a"
      ]
    ],
    [
      "Properly removes style rules",
      [
        {
          "entry.pc": `<style>.a {color: red;  } .b {color: red; } </style>a`
        },
        "f"
      ],
      [
        {
          "entry.pc": `<style>.a { color: red; } </style>a`
        },
        "b"
      ]
    ],
    [
      "Inserts new rules",
      [
        {
          "entry.pc": `<style>.a { color: red; } </style>a`
        },
        "f"
      ],
      [
        {
          "entry.pc": `<style>.a { color: red; } .b { color: blue; } </style>a`
        },
        "a"
      ]
    ],
    [
      "Updates CSS from module",
      [
        {
          "entry.pc": `<import src="./module.pc" as="module" /><module.Test />`,
          "module.pc": `<div export component as="Test"><style>color: before;</style></div>`
        },
        "f"
      ],
      [
        {
          "module.pc": `<div export component as="Test"><style>color: after;</style></div>`
        },
        "a"
      ]
    ],
    [
      "Updates CSS from module _module_",
      [
        {
          "entry.pc": `<import src="./a.pc" as="module" /><module.Test />`,
          "a.pc": `<import src="./b.pc" as="module" />
          <module.Test export component as="Test">
            <style>color: red;</style>
          </module.Test>`,
          "b.pc": `<div export component as="Test">
          <style>background: green;</style>
        </div>`
        },
        "b"
      ],
      [
        {
          "b.pc": `<div export component as="Test">
          <style>background: orange;</style>
        </div>`
        },
        "v"
      ]
    ],
    [
      "Can add new frams & still maintain styles",
      [
        {
          "entry.pc": `
          <div>
            <style>
              color: red;
            </style>
            Test
          </div>
        `
        },
        "a"
      ],
      [
        {
          "entry.pc": `
          <div>
            <style>
              color: blue;
            </style>
            Test A
          </div>
          <div>
            <style>
              color: red;
            </style>
            Test B
          </div>
        `
        },
        "a"
      ]
    ],
    [
      "Properly patches between",
      [
        {
          "entry.pc": `
          <span />
        `
        },
        "a"
      ],
      [
        {
          "entry.pc": `
          <style>
            .dbe {
              bacc: qr;
            }
          </style>
        `
        },
        "a"
      ],

      [
        {
          "entry.pc": `
          <span />
        `
        },
        "d"
      ]
    ],
    [
      "Maintains frame with previous sibling is hidden",
      [
        {
          "entry.pc": `
          <a />
          <b />
          <c />
        `
        },
        "a"
      ],
      [
        {
          "entry.pc": `
          <!-- 
            @frame { visible: false }
          -->
          <a />
          <b />
          <c />
        `
        },
        "d"
      ]
    ],
    [
      "Can handle charset",
      [
        {
          "entry.pc": `
          <style>
            @charset "utf-8";
            div {
              color: red;
            }
          </style>
        `
        },
        "d"
      ],
      [
        {
          "entry.pc": `
          <style>
            div {
              color: red;
            }
          </style>
        `
        },
        "a"
      ]
    ],
    [
      "Can handle charset",
      [
        {
          "entry.pc": `
          <div data />
        `
        },
        "a"
      ],
      [
        {
          "entry.pc": `
          <div data-l />
        `
        },
        "a"
      ]
    ],
    [
      "Can handle CSS file changes",
      [
        {
          "entry.pc": `
          <import src="./test.css" inject-styles />
          <div data />
        `,
          "test.css": `
          div {
            color: red;
          }
        `
        },
        "a"
      ],
      [
        {
          "entry.pc": `
          <import src="./test.css" inject-styles />
          <div />
        `,
          "test.css": `
          div {
            color: blue;
          }
        `
        },
        "a"
      ]
    ]
  ].forEach(([title, initial, ...changes]: any) => {
    it(title, async () => {
      const engine = createMockEngine(initial);

      const renderer = createMockFramesRenderer("entry.pc");
      engine.onEvent(renderer.handleEngineDelegateEvent);
      renderer.initialize((await engine.open("entry.pc")) as LoadedPCData);

      for (const [change, expectationSanityCheck] of changes) {
        for (const name in change) {
          await engine.updateVirtualFileContent(name, change[name]);
        }

        const baseline = createMockFramesRenderer("entry.pc");
        await baseline.initialize(
          (await engine.open("entry.pc")) as LoadedPCData
        );

        expect(baseline).to.eql(expectationSanityCheck);

        console.log(combineFrameHTML(renderer));
        // console.log(renderer.getState().frames[0]._importedStylesContainer);
        const html = combineFrameHTML(renderer);
        expect(html).to.eql(combineFrameHTML(baseline));
      }
    });
  });

  const combineFrameHTML = (renderer: FramesRenderer) => {
    return renderer
      .getState()
      .frames.map(frame => frame.stage.innerHTML)
      .join("");
  };
});
