import { LoadedPCData } from "@paperclip-ui/utils";
import {
  combineFrameHTML,
  createMockEngine,
  createMockFramesRenderer,
  mockDOMFactory,
} from "./utils";
import { expect } from "chai";
import { FramesRenderer } from "../frame-renderer";
import { patchFrames, renderFrames } from "..";

describe(__filename, () => {
  [
    [
      "Can render changes from two different fiefiles",

      {
        "entry.pc": `A`,
      },
      [
        {
          "entry.pc": `B`,
        },
        `<div></div><div><style></style></div><div>B</div>`,
      ],
    ],
    [
      "Properly replaces style rules",

      {
        "entry.pc": `<style>.a {color: red;  } </style>a`,
      },
      [
        {
          "entry.pc": `<style>.b {color: red;  } </style>a`,
        },
        `<div></div><div><style>[class]._17bc3462_b {color: red;} </style></div><div>a</div>`,
      ],
    ],
    [
      "Properly removes style rules",
      {
        "entry.pc": `<style>.a {color: red;  } .b {color: red; } </style>a`,
      },
      [
        {
          "entry.pc": `<style>.a { color: red; } </style>a`,
        },
        `<div></div><div><style>[class]._17bc3462_a {color: red;} </style></div><div>a</div>`,
      ],
    ],
    [
      "Inserts new rules",

      {
        "entry.pc": `<style>.a { color: red; } </style>a`,
      },
      [
        {
          "entry.pc": `<style>.a { color: red; } .b { color: blue; } </style>a`,
        },
        `<div></div><div><style>[class]._17bc3462_a {color: red;} [class]._17bc3462_b {color: blue;} </style></div><div>a</div>`,
      ],
    ],
    [
      "Updates CSS from module",

      {
        "entry.pc": `<import src="./module.pc" as="module" /><module.Test />`,
        "module.pc": `<div export component as="Test"><style>color: before;</style></div>`,
      },
      [
        {
          "module.pc": `<div export component as="Test"><style>color: after;</style></div>`,
        },
        `<div><style>._247a0971._247a0971 {color: after;} </style></div><div><style></style></div><div><div class="_4b63e839 _pub-4b63e839 _247a0971"></div></div>`,
      ],
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
        </div>`,
      },
      [
        {
          "b.pc": `<div export component as="Test">
          <style>background: orange;</style>
        </div>`,
        },
        `<div><style>._c9d94700._c9d94700 {background: orange;} </style><style>[class]._ad6960d3 {color: red;} </style></div><div><style></style></div><div><div class="_3d48f61e _pub-3d48f61e _c9d94700"></div></div>`,
      ],
    ],
    [
      "Can add new frames & still maintain styles",

      {
        "entry.pc": `
          <div>
            <style>
              color: red;
            </style>
            Test
          </div>
        `,
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
        `,
        },
        `<div></div><div><style>._b085ea3c._b085ea3c {color: blue;} ._c782daaa._c782daaa {color: red;} </style></div><div><div class="_17bc3462 _pub-17bc3462 _b085ea3c"> Test A </div></div><div></div><div><style>._b085ea3c._b085ea3c {color: blue;} ._c782daaa._c782daaa {color: red;} </style></div><div><div class="_17bc3462 _pub-17bc3462 _c782daaa"> Test B </div></div>`,
      ],
    ],
    [
      "Properly patches between",

      {
        "entry.pc": `
          <span />
        `,
      },
      [
        {
          "entry.pc": `
          <style>
            .dbe {
              bacc: qr;
            }
          </style>
        `,
        },
        "",
      ],

      [
        {
          "entry.pc": `
          <span />
        `,
        },
        `<div></div><div><style></style></div><div><span class="_17bc3462 _pub-17bc3462"></span></div>`,
      ],
    ],
    [
      "Maintains frame with previous sibling is hidden",
      {
        "entry.pc": `
          <a />
          <b />
          <c />
        `,
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
        `,
        },
        `<div></div><div><style></style></div><div><b class="_17bc3462 _pub-17bc3462"></b></div><div></div><div><style></style></div><div><c class="_17bc3462 _pub-17bc3462"></c></div>`,
      ],
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
        `,
      },
      [
        {
          "entry.pc": `
          <style>
            div {
              color: red;
            }
          </style>
        `,
        },
        "",
      ],
    ],
    [
      "Can handle charset",

      {
        "entry.pc": `
          <div data />
        `,
      },
      [
        {
          "entry.pc": `
          <div data-l />
        `,
        },
        `<div></div><div><style></style></div><div><div class="_17bc3462 _pub-17bc3462" data-l="true"></div></div>`,
      ],
    ],
    [
      "Can handle CSS file changes",

      {
        "entry.pc": `
        <style> a { color: blue; } </style><span></span>
        `,
        "test.css": `
          div {
            color: red;
          }
        `,
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
        `,
        },
        `<div><style>div._pub-2fedfe1a {color: blue;} </style></div><div><style></style></div><div><div class="_17bc3462 _pub-17bc3462 _pub-2fedfe1a"></div></div>`,
      ],
    ],
    [
      "Adds styles if import is added of module that is already loaded",

      {
        "entry.pc": `
        <style> a { color: blue; } </style><span></span>
        `,
        "module.pc": `
          <style> a { color: black; } </style>
        `,
      },
      [
        {
          "entry.pc": `
          <import src="./module.pc" /><style> a { color: blue; } </style><span></span>
        `,
        },
        `<div><style>a._4b63e839 {color: black;} </style></div><div><style>a._17bc3462 {color: blue;} </style></div><div><span class="_17bc3462 _pub-17bc3462"></span></div>`,
      ],
    ],
    [
      "Adds styles from dependency dependency",

      {
        "entry.pc": `<style> a { color: blue; } </style>a`,
        "module.pc": `<style> a { color: black; } </style>`,
        "module2.pc": `<style> a { color: orange; } </style>`,
      },
      [
        {
          "entry.pc": `<import src="./module.pc" /><style> a { color: blue; } </style><span></span>`,
          "module.pc": `<import src="./module2.pc" /><style> a { color: black; } </style>`,
        },
        `<div><style>a._44f59e80 {color: orange;} </style><style>a._4b63e839 {color: black;} </style></div><div><style>a._17bc3462 {color: blue;} </style></div><div><span class="_17bc3462 _pub-17bc3462"></span></div>`,
      ],
    ],
    [
      "removes styles",

      {
        "entry.pc": `<import src="./module-a.pc" />
        <import src="./module-b.pc" />
        <import src="./module-c.pc" />
        <import src="./module-d.pc" />
        a`,
        "module-a.pc": `<style> a { color: a; } </style>`,
        "module-b.pc": `<style> a { color: b; } </style>`,
        "module-c.pc": `<style> a { color: c; } </style>`,
        "module-d.pc": `<style> a { color: d; } </style>`,
      },
      [
        {
          "entry.pc": `
          <import src="./module-b.pc" />
          <import src="./module-d.pc" />a`,
        },
        `<div><style>a._dffa0c2f {color: b;} </style><style>a._fa9153f3 {color: d;} </style></div><div><style></style></div><div>a</div>`,
      ],
    ],
    [
      "Properly replaces elements",

      {
        "entry.pc": `<div export component as="StyledHeader" 
        class="StyledHeader"
        {onClick?}
        > 
      </div>
      
      <div export component as="Preview">
        <StyledHeader {depth?} {open?}>
        </StyledHeader>
      </div>
      
      <preview noPadding>
        <Preview>
        </Preview>
      
        <StyledHeader open>
          Content
        </StyledHeader>
      </preview>`,
      },
      [
        {
          "entry.pc": `<div export component as="StyledHeader" 
          class="StyledHeader"
          {onClick?}
          > 
        </div>
      
        <div export component as="Preview">
          <StyledHeader {depth?} {open?}>
          </StyledHeader>
        </div>
      
        <preview noPadding>
          <Preview header="Header">
          </Preview>
      
          <Preview header="Header">
            Content
          </Preview>
        </preview>`,
        },
        `<div></div><div><style></style></div><div><div class="_17bc3462_StyledHeader _pub-17bc3462_StyledHeader StyledHeader _17bc3462 _pub-17bc3462"></div></div><div></div><div><style></style></div><div><div class="_17bc3462 _pub-17bc3462"><div class="_17bc3462_StyledHeader _pub-17bc3462_StyledHeader StyledHeader _17bc3462 _pub-17bc3462"></div></div></div><div></div><div><style></style></div><div><preview class="_17bc3462 _pub-17bc3462" noPadding="true"><div class="_17bc3462 _pub-17bc3462"><div class="_17bc3462_StyledHeader _pub-17bc3462_StyledHeader StyledHeader _17bc3462 _pub-17bc3462"></div></div><div class="_17bc3462 _pub-17bc3462"><div class="_17bc3462_StyledHeader _pub-17bc3462_StyledHeader StyledHeader _17bc3462 _pub-17bc3462"></div></div></preview></div>`,
      ],
    ],
    [
      "Doesn't remove previous class if set",

      {
        "entry.pc": `<span class="a">
        </span>`,
      },
      [
        {
          "entry.pc": `<span class="a" class>
          </span>`,
        },
        `<div></div><div><style></style></div><div><span class="true _17bc3462 _pub-17bc3462"></span></div>`,
      ],
      [
        {
          "entry.pc": `<span class:a="a" class="b">
          </span>`,
        },
        `<div></div><div><style></style></div><div><span class="_17bc3462_b _pub-17bc3462_b b _17bc3462 _pub-17bc3462"></span></div>`,
      ],
    ],
    [
      "Properly replaces rule",

      {
        "entry.pc": `<style>
        .a {
          color: red;
        }
        .b {
          color: orange;
          @media screen and (max-width: 100px) {
            color: blue;
          }
        }
        @keyframes {
          0% {
            color: blue;
          }
          100% {
            color: black;
          }
        }
      </style>
      <div></div>`,
      },
      [
        {
          "entry.pc": `<style>
          .d {
            color: orange;
          }
      </style>
      <div></div>`,
        },
        `<div></div><div><style>[class]._17bc3462_d {color: orange;} </style></div><div><div class="_17bc3462 _pub-17bc3462"></div></div>`,
      ],
    ],
  ].forEach(([title, initial, ...changes]: any) => {
    it(title, async () => {
      const engine = createMockEngine(initial);

      let frames = renderFrames(
        (await engine.open("entry.pc")) as LoadedPCData,
        { domFactory: mockDOMFactory }
      );

      for (const [change, expectationSanityCheck] of changes) {
        const prevData = engine.open("entry.pc") as LoadedPCData;
        for (const name in change) {
          await engine.updateVirtualFileContent(name, change[name]);
        }

        const baselineFrames = renderFrames(
          (await engine.open("entry.pc")) as LoadedPCData,
          { domFactory: mockDOMFactory }
        );
        frames = patchFrames(
          frames,
          prevData,
          engine.open("entry.pc") as LoadedPCData,
          { domFactory: mockDOMFactory }
        );

        const framesHTML = frames.map((frame) => frame.innerHTML).join("");

        expect(framesHTML).to.eql(expectationSanityCheck);

        expect(framesHTML).to.eql(
          baselineFrames.map((frame) => frame.innerHTML).join("")
        );
      }
    });
  });
});
