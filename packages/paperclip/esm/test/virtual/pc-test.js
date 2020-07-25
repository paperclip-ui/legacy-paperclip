var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function(resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { expect } from "chai";
import {
  createMockEngine,
  cleanHTML,
  waitForError,
  stringifyLoadResult,
  noop
} from "../utils";
import { EngineEventKind, stringifyVirtualNode } from "paperclip-utils";
describe(__filename + "#", () => {
  it("prevents circular dependencies", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `<import src="/module.pc">`,
        "/module.pc": `<import src="/entry.pc">`
      };
      const engine = yield createMockEngine(graph);
      const p = new Promise(resolve => {
        engine.onEvent(event => {
          if (event.kind === EngineEventKind.Error) {
            resolve(event);
          }
        });
      });
      engine.run("/module.pc").catch(noop);
      const err = yield p;
      expect(err.message).to.eql(
        "Circular dependencies are not supported yet."
      );
    }));
  it("dynamic attributes work", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `
        <div component as="Component" class="primary" class:alt="alt" class:alt2>
          {children}
        </div>

        <Component />
        <Component alt />
        <Component alt2 />
      `
      };
      const engine = yield createMockEngine(graph);
      const { preview } = yield engine.run("/entry.pc");
      const buffer = `${stringifyVirtualNode(preview)}`;
      expect(cleanHTML(buffer)).to.eql(
        `<div class="_80f4925f_primary primary" data-pc-80f4925f></div><div class="_80f4925f_alt alt _80f4925f_primary primary" data-pc-80f4925f></div><div class="_80f4925f_alt2 alt2 _80f4925f_primary primary" data-pc-80f4925f></div>`
      );
    }));
  it("Can import keyframes", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `
        <import as="ab" src="./module.pc">
        <style>
          .rule {
            animation: ab.a 5s;
          }
        </style>
      `,
        "/module.pc": `
        <style>
          @keyframes a {
          }
        </style>
      `
      };
      const engine = yield createMockEngine(graph);
      const result = yield engine.run("/entry.pc");
      const buffer = `${stringifyLoadResult(result)}`;
      expect(cleanHTML(buffer)).to.eql(
        `<style>@keyframes _139cec8e_a { } [class]._80f4925f_rule { animation:_139cec8e_a 5s; }</style>`
      );
    }));
  it("Doesn't crash if importing module with parse error", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `
        <import src="/module.pc">

        <div>
        </div>
      `,
        "/module.pc": `<bad`
      };
      const engine = yield createMockEngine(graph);
      const e = waitForError(engine);
      engine.run("/entry.pc").catch(noop);
      const err = yield e;
      expect(err).to.eql({
        kind: "Error",
        errorKind: "Graph",
        uri: "/module.pc",
        info: {
          kind: "EndOfFile",
          message: "End of file",
          location: { start: 0, end: 1 }
        }
      });
    }));
  it("Doesn't crash if incorrect token is found in tag", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `
        <import src="/module.pc">

        <div>
        </div>
      `,
        "/module.pc": `<bad!`
      };
      const engine = yield createMockEngine(graph);
      const e = waitForError(engine);
      engine.run("/entry.pc").catch(noop);
      const err = yield e;
      expect(err).to.eql({
        kind: "Error",
        errorKind: "Graph",
        uri: "/module.pc",
        info: {
          kind: "Unexpected",
          message: "Unexpected token",
          location: { start: 4, end: 5 }
        }
      });
    }));
  it("displays an error if a default component is used but not exported", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `
        <import as="module" src="/module.pc">

        <module>
        </module>
      `,
        "/module.pc": `nothing to export!`
      };
      const engine = yield createMockEngine(graph);
      const e = waitForError(engine);
      engine.run("/entry.pc").catch(noop);
      const err = yield e;
      expect(err).to.eql({
        kind: "Error",
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 56, end: 64 },
        message: "Unable to find component, or it's not exported."
      });
    }));
  it("displays error if img src not found", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `
        <img src="/not/found.png">
      `
      };
      const engine = yield createMockEngine(graph, noop, {
        resolveFile() {
          return null;
        }
      });
      const e = waitForError(engine);
      engine.run("/entry.pc").catch(noop);
      const err = yield e;
      expect(err).to.eql({
        kind: "Error",
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 19, end: 33 },
        message: "Unable to resolve file: /not/found.png from /entry.pc"
      });
    }));
  describe("Slots", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      it("Can render attributes with element bindings", () =>
        __awaiter(void 0, void 0, void 0, function*() {
          const graph = {
            "/entry.pc": `
          <div a={<div />}></div>
        `
          };
          const engine = yield createMockEngine(graph);
          const { preview } = yield engine.run("/entry.pc");
          const buffer = `${stringifyVirtualNode(preview)}`;
          expect(cleanHTML(buffer)).to.eql(
            `<div a="[Object object]" data-pc-80f4925f></div>`
          );
        }));
      xit("Can render text bindings", () =>
        __awaiter(void 0, void 0, void 0, function*() {
          const graph = {
            "/entry.pc": `
          <div component as="Component" {class}>
            {children}
          </div>
  
          <Component class="a">b</Component>
        `
          };
          const engine = yield createMockEngine(graph);
          const { preview } = yield engine.run("/entry.pc");
          const buffer = `${stringifyVirtualNode(preview)}`;
          expect(cleanHTML(buffer)).to.eql(
            `<div class="a" data-pc-80f4925f>b</div>`
          );
        }));
      xit("Displays an error if text binding is defined outside of component", () =>
        __awaiter(void 0, void 0, void 0, function*() {
          const graph = {
            "/entry.pc": `
          <a {class}></a>
        `
          };
          const engine = yield createMockEngine(graph);
          const e = waitForError(engine);
          engine.run("/entry.pc");
          const err = yield e;
          expect(err).to.eql({
            kind: "Error",
            errorKind: "Runtime",
            uri: "/entry.pc",
            location: { start: 12, end: 19 },
            message: "Bindings can only be defined within components."
          });
        }));
      xit("Displays error for key-value binding outside of component", () =>
        __awaiter(void 0, void 0, void 0, function*() {
          const graph = {
            "/entry.pc": `
          <a a={class}></a>
        `
          };
          const engine = yield createMockEngine(graph);
          const e = waitForError(engine);
          engine.run("/entry.pc").catch(noop);
          const err = yield e;
          expect(err).to.eql({
            kind: "Error",
            errorKind: "Runtime",
            uri: "/entry.pc",
            location: { start: 14, end: 21 },
            message: "Bindings can only be defined within components."
          });
        }));
      xit("Displays error for spread binding outside of component", () =>
        __awaiter(void 0, void 0, void 0, function*() {
          const graph = {
            "/entry.pc": `
          <a {...class}></a>
        `
          };
          const engine = yield createMockEngine(graph);
          const e = waitForError(engine);
          engine.run("/entry.pc").catch(noop);
          const err = yield e;
          expect(err).to.eql({
            kind: "Error",
            errorKind: "Runtime",
            uri: "/entry.pc",
            location: { start: 12, end: 22 },
            message: "Bindings can only be defined within components."
          });
        }));
      xit("Displays error for text binding outside of component", () =>
        __awaiter(void 0, void 0, void 0, function*() {
          const graph = {
            "/entry.pc": `
          {a}
        `
          };
          const engine = yield createMockEngine(graph);
          const e = waitForError(engine);
          engine.run("/entry.pc").catch(noop);
          const err = yield e;
          expect(err).to.eql({
            kind: "Error",
            errorKind: "Runtime",
            uri: "/entry.pc",
            location: { start: 9, end: 12 },
            message: "Bindings can only be defined within components."
          });
        }));
      xit("Displays error for class binding outside of component", () =>
        __awaiter(void 0, void 0, void 0, function*() {
          const graph = {
            "/entry.pc": `
          <div class:a>
          </div>
        `
          };
          const engine = yield createMockEngine(graph);
          const e = waitForError(engine);
          engine.run("/entry.pc").catch(noop);
          const err = yield e;
          expect(err).to.eql({
            kind: "Error",
            errorKind: "Runtime",
            uri: "/entry.pc",
            location: { start: 14, end: 21 },
            message: "Bindings can only be defined within components."
          });
        }));
    }));
  it("Engine can't reload a file if there's an error", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `
        abc
      `
      };
      const engine = yield createMockEngine(graph);
      const result = stringifyLoadResult(yield engine.run("/entry.pc"));
      expect(result).to.eql(`<style></style> abc`);
      const e = waitForError(engine);
      engine.updateVirtualFileContent(`/entry.pc`, `<a `);
      const err = yield e;
      expect(err).to.eql({
        kind: "Error",
        errorKind: "Graph",
        uri: "/entry.pc",
        info: {
          kind: "EndOfFile",
          message: "End of file",
          location: { start: 0, end: 1 }
        }
      });
      let err2;
      try {
        err2 = yield engine.run("/entry.pc");
      } catch (e) {
        err2 = e;
      }
      expect(err2).to.eql({
        errorKind: "Graph",
        uri: "/entry.pc",
        info: {
          kind: "EndOfFile",
          message: "End of file",
          location: { start: 0, end: 1 }
        }
      });
      engine.updateVirtualFileContent(`/entry.pc`, `<a></a>`);
      const result2 = stringifyLoadResult(yield engine.run("/entry.pc"));
      expect(result2).to.eql(`<style></style><a data-pc-80f4925f></a>`);
    }));
  it("Engine can't reload content if module errors", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `
        <import as="Component" src="./module.pc">
        <Component>abc</Component>
      `,
        "/module.pc": `
        <div export component as="default">
          {children} cde
        </div>
      `
      };
      const engine = yield createMockEngine(graph);
      const result = stringifyLoadResult(yield engine.run("/entry.pc"));
      expect(result).to.eql(
        `<style></style><div data-pc-139cec8e>abc cde </div>`
      );
      // make the parse error
      yield engine.updateVirtualFileContent(
        "/module.pc",
        `<div export component as="default">
    {chi`
      );
      yield engine.updateVirtualFileContent(
        "/entry.pc",
        `<import as="Component" src="./module.pc">
    <Component>defg</Component>`
      );
      let err;
      // shouldn't be able to load /entry.pc now
      try {
        yield engine.run("/entry.pc");
      } catch (e) {
        err = e;
      }
      expect(err).to.eql({
        errorKind: "Graph",
        uri: "/module.pc",
        info: {
          kind: "Unterminated",
          message: "Unterminated slot.",
          location: { start: 41, end: 44 }
        }
      });
      // introduce fix
      yield engine.updateVirtualFileContent(
        "/module.pc",
        `<div export component as="default">
      cde {children}
    </div>`
      );
      const result3 = stringifyLoadResult(yield engine.run("/entry.pc"));
      expect(result3).to.eql(
        `<style></style><div data-pc-139cec8e>cde defg</div>`
      );
    }));
  it("Errors for incorrectly formatted slot number", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `
        {10.10.10}
      `
      };
      const engine = yield createMockEngine(graph);
      const p = waitForError(engine);
      engine.run("/entry.pc").catch();
      expect(yield p).to.eql({
        kind: "Error",
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 10, end: 18 },
        message: "Invalid number."
      });
    }));
  it("Entities are encoded", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `
        &times;
      `
      };
      const engine = yield createMockEngine(graph);
      expect(stringifyLoadResult(yield engine.run("/entry.pc"))).to.eql(
        "<style></style> ×"
      );
    }));
  it("Returns component properties", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `
        <div component as="Test" class:a {f} {b} className="{c}">
          {d}
          {e?}
          {f?}
        </div>
        <div export component as="Test2">
        </div>
      `
      };
      const engine = yield createMockEngine(graph);
      const result = yield engine.run("/entry.pc");
      expect(result.exports.components).to.eql({
        Test: {
          name: "Test",
          properties: {
            c: {
              name: "c",
              optional: false
            },
            e: {
              name: "e",
              optional: true
            },
            a: {
              name: "a",
              optional: true
            },
            b: {
              name: "b",
              optional: false
            },
            f: {
              name: "f",
              optional: false
            },
            d: {
              name: "d",
              optional: false
            }
          },
          public: false
        },
        Test2: {
          name: "Test2",
          properties: {},
          public: true
        }
      });
    }));
  it("Cannot declare a component twice", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `
        <div component as="Test">
        </div>
        <div export component as="Test">
        </div>
      `
      };
      const engine = yield createMockEngine(graph);
      let err;
      try {
        yield engine.run("/entry.pc");
      } catch (e) {
        err = e;
      }
      expect(err).to.eql({
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 58, end: 105 },
        message: "Component name is already declared."
      });
    }));
  it("Throws an error if an imported module has a CSS error", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `
        <module src="/module.pc">
      `,
        "/module.pc": `
        <style>
          .a {
            b {
              color: blue;
            }
          }
        </style>
      `
      };
      const engine = yield createMockEngine(graph);
      let err;
      try {
        yield engine.run("/entry.pc");
      } catch (e) {
        err = e;
      }
      expect(err).to.eql({
        errorKind: "Graph",
        uri: "/entry.pc",
        info: {
          kind: "Unterminated",
          message: "Unterminated element.",
          location: { start: 9, end: 34 }
        }
      });
    }));
  it("Displays an error if open tag is unclosed", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const graph = {
        "/entry.pc": `
        <div <div />
      `
      };
      const engine = yield createMockEngine(graph);
      let err;
      try {
        yield engine.run("/entry.pc");
        const ast = engine.getLoadedAst("/entry.pc");
        console.log(JSON.stringify(ast, null, 2));
      } catch (e) {
        err = e;
      }
      expect(err).to.eql({
        errorKind: "Graph",
        uri: "/entry.pc",
        info: {
          kind: "Unexpected",
          message: "Unexpected token",
          location: { start: 14, end: 15 }
        }
      });
    }));
});
