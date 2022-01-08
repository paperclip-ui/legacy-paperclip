import { LoadedPCData } from "@paperclip-ui/utils";
import { createMockEngine, createMockFramesRenderer } from "./utils";
import { expect } from "chai";
import { FramesRenderer } from "../frame-renderer";

describe(__filename, () => {
  [
    [
      "Can render changes from two different fiefiles",

      {
        "entry.pc": `A`
      },
      [
        {
          "entry.pc": `B`
        },
        `<div></div><div><style></style></div><div>B</div>`
      ]
    ],
    [
      "Properly replaces style rules",

      {
        "entry.pc": `<style>.a {color: red;  } </style>a`
      },
      [
        {
          "entry.pc": `<style>.b {color: red;  } </style>a`
        },
        `<div></div><div><style>[class]._17bc3462_b {color: red;} </style></div><div>a</div>`
      ]
    ],
    [
      "Properly removes style rules",
      {
        "entry.pc": `<style>.a {color: red;  } .b {color: red; } </style>a`
      },
      [
        {
          "entry.pc": `<style>.a { color: red; } </style>a`
        },
        `<div></div><div><style>[class]._17bc3462_a {color: red;} </style></div><div>a</div>`
      ]
    ],
    [
      "Inserts new rules",

      {
        "entry.pc": `<style>.a { color: red; } </style>a`
      },
      [
        {
          "entry.pc": `<style>.a { color: red; } .b { color: blue; } </style>a`
        },
        `<div></div><div><style>[class]._17bc3462_a {color: red;} [class]._17bc3462_b {color: blue;} </style></div><div>a</div>`
      ]
    ],
    [
      "Updates CSS from module",

      {
        "entry.pc": `<import src="./module.pc" as="module" /><module.Test />`,
        "module.pc": `<div export component as="Test"><style>color: before;</style></div>`
      },
      [
        {
          "module.pc": `<div export component as="Test"><style>color: after;</style></div>`
        },
        `<div><style>._247a0971._247a0971 {color: after;} </style></div><div><style></style></div><div><div class="_4b63e839 _pub-4b63e839 _247a0971"></div></div>`
      ]
    ],
    [
      "Updates CSS from module _module_",

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
      [
        {
          "b.pc": `<div export component as="Test">
          <style>background: orange;</style>
        </div>`
        },
        `<div><style>._c9d94700._c9d94700 {background: orange;} </style><style>[class]._ad6960d3 {color: red;} </style></div><div><style></style></div><div><div class="_3d48f61e _pub-3d48f61e _c9d94700"></div></div>`
      ]
    ],
    [
      "Can add new frams & still maintain styles",

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
        `<div></div><div><style>._b085ea3c._b085ea3c {color: blue;} ._c782daaa._c782daaa {color: red;} </style></div><div><div class="_17bc3462 _pub-17bc3462 _b085ea3c"> Test A </div></div><div></div><div><style>._b085ea3c._b085ea3c {color: blue;} ._c782daaa._c782daaa {color: red;} </style></div><div><div class="_17bc3462 _pub-17bc3462 _c782daaa"> Test B </div></div>`
      ]
    ],
    [
      "Properly patches between",

      {
        "entry.pc": `
          <span />
        `
      },
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
        ""
      ],

      [
        {
          "entry.pc": `
          <span />
        `
        },
        `<div></div><div><style></style></div><div><span class="_17bc3462 _pub-17bc3462"></span></div>`
      ]
    ],
    [
      "Maintains frame with previous sibling is hidden",
      {
        "entry.pc": `
          <a />
          <b />
          <c />
        `
      },
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
        `<div></div><div><style></style></div><div><a class="_17bc3462 _pub-17bc3462"></a></div><div></div><div><style></style></div><div><b class="_17bc3462 _pub-17bc3462"></b></div><div></div><div><style></style></div><div><c class="_17bc3462 _pub-17bc3462"></c></div>`
      ]
    ],
    [
      "Can handle charset",

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
        ""
      ]
    ],
    [
      "Can handle charset",

      {
        "entry.pc": `
          <div data />
        `
      },
      [
        {
          "entry.pc": `
          <div data-l />
        `
        },
        `<div></div><div><style></style></div><div><div class="_17bc3462 _pub-17bc3462" data-l="true"></div></div>`
      ]
    ],
    [
      "Can handle CSS file changes",

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
        `<div><style>div._pub-2fedfe1a {color: blue;} </style></div><div><style></style></div><div><div class="_17bc3462 _pub-17bc3462 _pub-2fedfe1a"></div></div>`
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

        expect(combineFrameHTML(baseline)).to.eql(expectationSanityCheck);
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
