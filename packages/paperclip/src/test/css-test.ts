import { expect } from "chai";
import { createMockEngine, stringifyLoadResult, waitForError } from "./utils";
import { EngineEventKind, stringifyVirtualNode } from "paperclip-utils";

describe(__filename + "#", () => {
  it("can render a simple style", async () => {
    const graph = {
      "/entry.pc": `<style>
        .a {
          color: b;
        }
      </style>`
    };
    const engine = createMockEngine(graph);
    const text = stringifyLoadResult(await engine.load("/entry.pc"));
    expect(text).to.eql("<style>._80f4925f_a { color:b; }</style>");
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
      const engine = createMockEngine(graph);
      const text = stringifyLoadResult(await engine.load("/entry.pc"));
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
      const engine = createMockEngine(graph);
      const p = waitForError(engine);
      engine.load("/entry.pc");
      const e = await p;
      expect(e).to.eql({
        kind: "Error",
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 45, end: 46 },
        message: "Reference not found."
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
      const engine = createMockEngine(graph);
      const text = stringifyLoadResult(await engine.load("/entry.pc"));
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
      const engine = createMockEngine(graph);
      const p = waitForError(engine);
      engine.load("/entry.pc");
      const e = await p;
      expect(e).to.eql({
        kind: "Error",
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 84, end: 85 },
        message: "Reference not found."
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
      const engine = createMockEngine(graph);
      const p = waitForError(engine);
      engine.load("/entry.pc");
      const e = await p;
      expect(e).to.eql({
        kind: "Error",
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 45, end: 48 },
        message: "Reference not found."
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
      const engine = createMockEngine(graph);
      const p = waitForError(engine);
      engine.load("/entry.pc");
      const e = await p;
      // expect(e).to.eql({
      //   kind: 'Error',
      //   errorKind: 'Runtime',
      //   uri: '/entry.pc',
      //   location: { start: 45, end: 48 },
      //   message: 'Reference not found.'
      // });
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
      const engine = createMockEngine(graph);
      const p = waitForError(engine);
      engine.load("/entry.pc");
      const e = await p;
      expect(e).to.eql({
        kind: "Error",
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
      const engine = createMockEngine(graph);
      const p = waitForError(engine);
      engine.load("/entry.pc");
      const e = await p;
      expect(e).to.eql({
        kind: "Error",
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 98, end: 103 },
        message: "This mixin is already declared in the upper scope."
      });
    });
  });
});
