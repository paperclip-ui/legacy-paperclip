import { LoadedPCData } from "paperclip-utils";
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
      {
        "entry.pc": `B`
      }
    ],
    [
      "Properly replaces style rules",
      {
        "entry.pc": `<style>.a {color: red;  } </style>a`
      },
      {
        "entry.pc": `<style>.b {color: red;  } </style>a`
      }
    ],
    [
      "Properly removes style rules",
      {
        "entry.pc": `<style>.a {color: red;  } .b {color: red; } </style>a`
      },
      {
        "entry.pc": `<style>.a { color: red; } </style>a`
      }
    ],
    [
      "Inserts new rules",
      {
        "entry.pc": `<style>.a { color: red; } </style>a`
      },
      {
        "entry.pc": `<style>.a { color: red; } .b { color: blue; } </style>a`
      }
    ],
    [
      "Updates CSS from module",
      {
        "entry.pc": `<import src="./module.pc" as="module" /><module.Test />`,
        "module.pc": `<div export component as="Test"><style>color: before;</style></div>`
      },
      {
        "module.pc": `<div export component as="Test"><style>color: after;</style></div>`
      }
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
      {
        "b.pc": `<div export component as="Test">
          <style>background: orange;</style>
        </div>`
      }
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
      }
    ],
    [
      "Properly patches between",
      {
        "entry.pc": `
          <span />
        `
      },
      {
        "entry.pc": `
          <style>
            .dbe {
              bacc: qr;
            }
          </style>
        `
      },

      {
        "entry.pc": `
          <span />
        `
      }
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
      {
        "entry.pc": `
          <!-- 
            @frame { visible: false }
          -->
          <a />
          <b />
          <c />
        `
      }
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
      {
        "entry.pc": `
          <style>
            div {
              color: red;
            }
          </style>
        `
      }
    ]
  ].forEach(([title, initial, ...changes]: any) => {
    it(title, async () => {
      const engine = createMockEngine(initial);

      const renderer = createMockFramesRenderer("entry.pc");
      engine.onEvent(renderer.handleEngineDelegateEvent);
      renderer.initialize((await engine.open("entry.pc")) as LoadedPCData);

      for (const change of changes) {
        for (const name in change) {
          await engine.updateVirtualFileContent(name, change[name]);
        }

        const baseline = createMockFramesRenderer("entry.pc");
        await baseline.initialize(
          (await engine.open("entry.pc")) as LoadedPCData
        );
        expect(combineFrameHTML(renderer)).to.eql(combineFrameHTML(baseline));
      }
    });
  });

  const combineFrameHTML = (renderer: FramesRenderer) => {
    return renderer.immutableFrames
      .map(frame => frame.stage.innerHTML)
      .join("");
  };
});
