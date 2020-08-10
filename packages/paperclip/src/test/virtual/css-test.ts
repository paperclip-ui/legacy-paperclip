import { expect } from "chai";
import { createMockEngine, stringifyLoadResult } from "../utils";

import { noop } from "../../utils";

describe(__filename + "#", () => {
  it("can render a simple style", async () => {
    const graph = {
      "/entry.pc": `<style>
        .a {
          color: b;
        }
      </style>`
    };
    const engine = await createMockEngine(graph);
    const text = stringifyLoadResult(await engine.run("/entry.pc"));
    expect(text).to.eql("<style>[class]._80f4925f_a { color:b; }</style>");
  });

  it("displays an error if style url not found", async () => {
    const graph = {
      "/entry.pc": `
        <style>
          .rule {
            background: url('/not/found.png')
          }
        </style>
      `
    };
    const engine = await createMockEngine(graph, noop, {
      resolveFile() {
        return null;
      }
    });

    let err;
    try {
      engine.run("/entry.pc");
    } catch (e) {
      console.log(e);
      err = e;
    }
    expect(err).to.eql({
      errorKind: "Runtime",
      uri: "/entry.pc",
      location: { start: 59, end: 91 },
      message: "Unable to resolve file: /not/found.png from /entry.pc"
    });
  });

  describe("Mixins", () => {
    it("can be created & used", async () => {
      const graph = {
        "/entry.pc": `<style>
          @mixin a {
            color: blue;
          }
          div {
            @include a;
          }
        </style>`
      };
      const engine = await createMockEngine(graph);
      const text = stringifyLoadResult(await engine.run("/entry.pc"));
      expect(text).to.eql(
        "<style>div[data-pc-80f4925f] { color:blue; }</style>"
      );
    });

    it("Displays an error if a mixin is not found", async () => {
      const graph = {
        "/entry.pc": `<style>
          div {
            @include a;
          }
        </style>`
      };
      const engine = await createMockEngine(graph);
      let err;
      try {
        await engine.run("/entry.pc");
      } catch (e) {
        err = e;
      }
      expect(err).to.eql({
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 45, end: 46 },
        message: "Reference not found or used before it was declared."
      });
    });

    it("can use an imported mixin", async () => {
      const graph = {
        "/entry.pc": `<import as="mod" src="./module.pc"><style>
          div {
            @include mod.a;
          }
        </style>`,
        "/module.pc": `<style>
          @export {
            @mixin a {
              color: orange;
            }
          }
        </style>`
      };
      const engine = await createMockEngine(graph);
      const text = stringifyLoadResult(await engine.run("/entry.pc"));
      expect(text).to.eql(
        "<style>div[data-pc-80f4925f] { color:orange; }</style>"
      );
    });
    it("Displays an error if an imported mixin is not found", async () => {
      const graph = {
        "/entry.pc": `<import as="mod" src="./module.pc"><style>
          div {
            @include mod.a;
          }
        </style>`,
        "/module.pc": `<style>
        </style>`
      };
      const engine = await createMockEngine(graph);
      let err;
      try {
        await engine.run("/entry.pc");
      } catch (e) {
        err = e;
      }
      expect(err).to.eql({
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 84, end: 85 },
        message: "Reference not found or used before it was declared."
      });
    });
    it("Displays an error if the import is not found", async () => {
      const graph = {
        "/entry.pc": `<style>
          div {
            @include mod.a;
          }
        </style>`
      };
      const engine = await createMockEngine(graph);
      let err;
      try {
        await engine.run("/entry.pc");
      } catch (e) {
        err = e;
      }
      expect(err).to.eql({
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 45, end: 48 },
        message: "Reference not found or used before it was declared."
      });
    });

    // expectation is still incorrect, just want to make sure that this doesn't break the engine
    it("Smoke -- can use nested refs", async () => {
      const graph = {
        "/entry.pc": `<style>
          div {
            @include a.b.c;
          }
        </style>`
      };
      const engine = await createMockEngine(graph);
      let err;
      try {
        await engine.run("/entry.pc");
      } catch (e) {
        err = e;
      }
      expect(err).to.eql({
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 45, end: 46 },
        message: "Reference not found or used before it was declared."
      });
    });

    it("Displays an error if a mixin is used but not exported", async () => {
      const graph = {
        "/entry.pc": `<import as="mod" src="./module.pc"><style>
          div {
            @include mod.abcde;
          }
        </style>`,
        "/module.pc": `<style>
          @mixin abcde {
            color: orange;
          }
        </style>`
      };
      const engine = await createMockEngine(graph);
      let err;
      try {
        await engine.run("/entry.pc");
      } catch (e) {
        err = e;
      }
      expect(err).to.eql({
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 84, end: 89 },
        message: "This mixin is private."
      });
    });

    it("Display an error if a mixins is already defined in the upper scope", async () => {
      const graph = {
        "/entry.pc": `<style>
          @mixin abcde {
            color: blue;
          }
          
          @mixin abcde {
            color: orange;
          }
        </style>`
      };
      const engine = await createMockEngine(graph);
      let err;
      try {
        await engine.run("/entry.pc");
      } catch (e) {
        err = e;
      }
      expect(err).to.eql({
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 98, end: 103 },
        message: "This mixin is already declared in the upper scope."
      });
    });

    it("properly concats using multiple &", async () => {
      const graph = {
        "/entry.pc": `<style>
          .company_list {
            list-style: none;
            margin: 0;
            padding: 0;
        
            & li {
        
              display: block;
              padding: var(--spacing-600) 0;
        
              & + & {
                border-top: 1px solid var(--color-black-100);
              }
            }
          }
        </style>`
      };

      const engine = await createMockEngine(graph);
      const result = await engine.run("/entry.pc");
      expect(stringifyLoadResult(result)).to.eql(
        `<style>[class]._80f4925f_company_list { list-style:none; margin:0; padding:0; } [class]._80f4925f_company_list li[data-pc-80f4925f] { display:block; padding:var(--spacing-600) 0; } [class]._80f4925f_company_list li[data-pc-80f4925f] + [class]._80f4925f_company_list li[data-pc-80f4925f] { border-top:1px solid var(--color-black-100); }</style>`
      );
    });
  });

  it("can use escape key in classname", async () => {
    const graph = {
      "/entry.pc": `<style>
        .a\\:b {
        }
      </style>`
    };

    const engine = await createMockEngine(graph);
    const result = await engine.run("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>[class]._80f4925f_a\\:b { }</style>`
    );
  });

  it("can use single line comment", async () => {
    const graph = {
      "/entry.pc": `<style>


      // :checked
      input:checked {
        & + .tab-label {
          background: var(--midnight-darker);
          &::after {
            transform: rotate(90deg);
          }
        }
        & ~ .tab-content {
          max-height: 100vh;
          padding: 1em;
        }
      }
      
      </style>`
    };

    const engine = await createMockEngine(graph);
    const result = await engine.run("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>input:checked[data-pc-80f4925f] { } input:checked[data-pc-80f4925f] + [class]._80f4925f_tab-label { background:var(--midnight-darker); } input:checked[data-pc-80f4925f] + [class]._80f4925f_tab-label::after { transform:rotate(90deg); } input:checked[data-pc-80f4925f] ~ [class]._80f4925f_tab-content { max-height:100vh; padding:1em; }</style>`
    );
  });

  it("errors if comment is unterminated", async () => {
    const graph = {
      "/entry.pc": `<style>
        /* foreverrrrrr
      </style>`
    };

    const engine = await createMockEngine(graph);
    let err;
    try {
      await engine.run("/entry.pc");
    } catch (e) {
      err = e;
    }
    expect(err).to.eql({
      errorKind: "Graph",
      uri: "/entry.pc",
      info: {
        kind: "Unterminated",
        message: "Unterminated element.",
        location: { start: 0, end: 7 }
      }
    });
  });

  it("CSS vars are collected in the evaluated output", async () => {
    const graph = {
      "/entry.pc": `<style>
        .element {
          --color: test;
        }
      </style>ab`
    };
    const engine = await createMockEngine(graph);
    const result = await engine.run("/entry.pc");

    expect(result.exports.style.variables["--color"]).to.eql({
      name: "--color",
      value: "test",
      source: {
        uri: "/entry.pc",
        location: {
          start: 37,
          end: 51
        }
      }
    });
  });

  it("CSS class names are pulled out", async () => {
    const graph = {
      "/entry.pc": `<style>

        // comment test
        [a] {
          & .color {

          }
        }
        @export {
          .div {

          }
        }
        .element {
          &.child {

          }
          &--child {

          }
        }
      </style>ab`
    };
    const engine = await createMockEngine(graph);
    const result = await engine.run("/entry.pc");

    expect(result.exports.style.classNames).to.eql({
      color: { name: "color", public: false, scopedName: "_80f4925f_color" },
      div: { name: "div", public: true, scopedName: "_80f4925f_div" },
      child: { name: "child", public: false, scopedName: "child" },
      "element--child": {
        name: "element--child",
        public: false,
        scopedName: "_80f4925f_element--child"
      },
      element: {
        name: "element",
        public: false,
        scopedName: "_80f4925f_element"
      }
    });
  });

  it("maintains space with & selector", async () => {
    const graph = {
      "/entry.pc": `<style>
      .todo {
        &:hover .destroy {
            display: inline-block;
        }
        & .todo {
          &--item .destroy {
            display: inline-block;
          }
        }
      }
    </style>`
    };

    const engine = await createMockEngine(graph);
    const result = await engine.run("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>[class]._80f4925f_todo { } [class]._80f4925f_todo:hover [class]._80f4925f_destroy { display:inline-block; } [class]._80f4925f_todo [class]._80f4925f_todo { } [class]._80f4925f_todo [class]._80f4925f_todo--item [class]._80f4925f_destroy { display:inline-block; }</style>`
    );
  });

  it("can parse nested tag selectors", async () => {
    const graph = {
      "/entry.pc": `<style>
      a {
        & svg:a {
          margin-right: 4px;
        }
      }
    </style>`
    };

    const engine = await createMockEngine(graph);
    const result = await engine.run("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>a[data-pc-80f4925f] { } a[data-pc-80f4925f] svg:a[data-pc-80f4925f] { margin-right:4px; }</style>`
    );
  });

  it("can render keyframes with a dash in the name", async () => {
    const graph = {
      "/entry.pc": `<style>
      @keyframes lds-something3 {

      }

      div {
        animation: lds-something3 1s;
      }
    </style>`
    };

    const engine = await createMockEngine(graph);
    const result = await engine.run("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>@keyframes _80f4925f_lds-something3 { } div[data-pc-80f4925f] { animation:_80f4925f_lds-something3 1s; }</style>`
    );
  });

  it("can evaluated multiple nested selectors without &", async () => {
    const graph = {
      "/entry.pc": `<style>
      a {
        > b {
          
        }
        + c {
          
        }
        ~ d {
          
        }
        :not(.div) {

        }
        ::active {

        }
      }
    </style>`
    };

    const engine = await createMockEngine(graph);
    const result = await engine.run("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>a[data-pc-80f4925f] { } a[data-pc-80f4925f] > b[data-pc-80f4925f] { } a[data-pc-80f4925f] + c[data-pc-80f4925f] { } a[data-pc-80f4925f] ~ d[data-pc-80f4925f] { } a[data-pc-80f4925f] [data-pc-80f4925f]:not([class]._80f4925f_div) { } a[data-pc-80f4925f] [data-pc-80f4925f]::active { }</style>`
    );
  });

  it("AST location is correct with unicode characters", async () => {
    const graph = {
      "/entry.pc": `<style>
      /* 👍🏻 */
      // 👍🏻
      .div {
        content: "👌"
      }
      .another {
      }
    </style>`
    };
    const engine = await createMockEngine(graph);
    await engine.run("/entry.pc");
    const ast = engine.getLoadedAst("/entry.pc") as any;
    expect(ast.children[0].sheet.rules[1].location).to.eql({
      start: 88,
      end: 111
    });
  });

  it("includes keyframes in export", async () => {
    const graph = {
      "/entry.pc": `<style>
      @keyframes a {

      }
      @export {
        @keyframes b {

        }
      }

    </style>`
    };

    const engine = await createMockEngine(graph);
    const result = await engine.run("/entry.pc");
    expect(result.exports.style.keyframes).to.eql({
      b: {
        name: "b",
        public: true,
        source: {
          uri: "/entry.pc",
          location: {
            start: 73,
            end: 94
          }
        }
      },
      a: {
        name: "a",
        public: false,
        source: {
          uri: "/entry.pc",
          location: {
            start: 25,
            end: 44
          }
        }
      }
    });
  });

  it("can export class names with _ prefix", async () => {
    const graph = {
      "/entry.pc": `<style>
      @export {
        ._b {

        }
      }

    </style>`
    };

    const engine = await createMockEngine(graph);
    const result = await engine.run("/entry.pc");
    expect(result.exports.style.classNames).to.eql({
      _b: { name: "_b", scopedName: "_80f4925f__b", public: true }
    });
  });

  // Addresses https://github.com/crcn/paperclip/issues/319
  it("shows an error if including a mixin that doesn't exist within a mixin that's exported", async () => {
    const graph = {
      "/entry.pc": `<style>
      @export {
        @mixin {
          @include no-boom;
        }
      }
    </style>`
    };

    const engine = await createMockEngine(graph);

    let err;

    try {
      await engine.run("/entry.pc");
    } catch (e) {
      err = e;
    }
    expect(err).to.eql({
      errorKind: "Runtime",
      uri: "/entry.pc",
      location: { start: 60, end: 67 },
      message: "Reference not found or used before it was declared."
    });
  });

  // Addresses https://github.com/crcn/paperclip/issues/326
  it("can have nested pseudo selectors", async () => {
    const graph = {
      "/entry.pc": `<style>
      .parent {
        .child:first-child {
          color: blue
        }
      }
    </style>`
    };

    const engine = await createMockEngine(graph);

    const text = stringifyLoadResult(await engine.run("/entry.pc"));
    expect(text).to.eql(
      "<style>[class]._80f4925f_parent { } [class]._80f4925f_child:first-child { color:blue ; }</style>"
    );
  });

  // Addresses: https://github.com/crcn/paperclip/issues/340
  it("Can use mixins in other style blocks defined in the same page", async () => {
    const graph = {
      "/entry.pc": `<style>
      @mixin a {
        color: blue;
      }
    </style>
    <style>
      .div {
        @include a;
      }
    </style>`
    };

    const engine = await createMockEngine(graph);

    const text = stringifyLoadResult(await engine.run("/entry.pc"));
    expect(text).to.eql("<style>[class]._80f4925f_div { color:blue; }</style>");
  });

  // Addresses https://github.com/crcn/paperclip/issues/417
  it("properly renders global * selector", async () => {
    const graph = {
      "/entry.pc": `<style>
      div {
        > :global(*) {
          color: blue;
        }
      }
    </style>`
    };

    const engine = await createMockEngine(graph);

    const text = stringifyLoadResult(await engine.run("/entry.pc"));
    expect(text).to.eql(
      "<style>div[data-pc-80f4925f] { } div[data-pc-80f4925f] > * { color:blue; }</style>"
    );
  });
});
