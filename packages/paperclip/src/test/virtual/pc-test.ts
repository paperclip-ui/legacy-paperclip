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
  it("prevents circular dependencies", async () => {
    const graph = {
      "/entry.pc": `<import src="/module.pc">`,
      "/module.pc": `<import src="/entry.pc">`
    };
    const engine = await createMockEngine(graph);
    const p = new Promise<any>(resolve => {
      engine.onEvent(event => {
        if (event.kind === EngineEventKind.Error) {
          resolve(event);
        }
      });
    });
    engine.run("/module.pc").catch(noop);
    const err = await p;
    expect(err.message).to.eql("Circular dependencies are not supported yet.");
  });

  it("dynamic attributes work", async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Component" class="primary" class:alt="alt" class:alt2="alt2">
          {children}
        </div>

        <Component />
        <Component alt />
        <Component alt2 />
      `
    };
    const engine = await createMockEngine(graph);
    const { preview } = await engine.run("/entry.pc");
    const buffer = `${stringifyVirtualNode(preview)}`;

    expect(cleanHTML(buffer)).to.eql(
      `<div class="_80f4925f_primary primary" data-pc-80f4925f></div><div class="_80f4925f_alt alt _80f4925f_primary primary" data-pc-80f4925f></div><div class="_80f4925f_alt2 alt2 _80f4925f_primary primary" data-pc-80f4925f></div>`
    );
  });

  it("Can import keyframes", async () => {
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
    const engine = await createMockEngine(graph);
    const result = await engine.run("/entry.pc");

    const buffer = `${stringifyLoadResult(result)}`;

    expect(cleanHTML(buffer)).to.eql(
      `<style>@keyframes _139cec8e_a { } [class]._80f4925f_rule { animation:_139cec8e_a 5s; }</style>`
    );
  });

  it("Doesn't crash if importing module with parse error", async () => {
    const graph = {
      "/entry.pc": `
        <import src="/module.pc">

        <div>
        </div>
      `,
      "/module.pc": `<bad`
    };
    const engine = await createMockEngine(graph);
    const e = waitForError(engine);
    engine.run("/entry.pc").catch(noop);
    const err = await e;
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
  });

  it("Doesn't crash if incorrect token is found in tag", async () => {
    const graph = {
      "/entry.pc": `
        <import src="/module.pc">

        <div>
        </div>
      `,
      "/module.pc": `<bad!`
    };
    const engine = await createMockEngine(graph);
    const e = waitForError(engine);
    engine.run("/entry.pc").catch(noop);
    const err = await e;
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
  });

  it("displays an error if a default component is used but not exported", async () => {
    const graph = {
      "/entry.pc": `
        <import as="module" src="/module.pc">

        <module>
        </module>
      `,
      "/module.pc": `nothing to export!`
    };
    const engine = await createMockEngine(graph);
    const e = waitForError(engine);
    engine.run("/entry.pc").catch(noop);
    const err = await e;
    expect(err).to.eql({
      kind: "Error",
      errorKind: "Runtime",
      uri: "/entry.pc",
      location: { start: 56, end: 64 },
      message: "Unable to find component, or it's not exported."
    });
  });

  it("displays error if img src not found", async () => {
    const graph = {
      "/entry.pc": `
        <img src="/not/found.png">
      `
    };
    const engine = await createMockEngine(graph, noop, {
      resolveFile() {
        return null;
      }
    });

    const e = waitForError(engine);
    engine.run("/entry.pc").catch(noop);
    const err = await e;
    expect(err).to.eql({
      kind: "Error",
      errorKind: "Runtime",
      uri: "/entry.pc",
      location: { start: 19, end: 33 },
      message: "Unable to resolve file: /not/found.png from /entry.pc"
    });
  });

  describe("Slots", async () => {
    it("Can render attributes with element bindings", async () => {
      const graph = {
        "/entry.pc": `
          <div a={<div />}></div>
        `
      };
      const engine = await createMockEngine(graph);
      const { preview } = await engine.run("/entry.pc");
      const buffer = `${stringifyVirtualNode(preview)}`;

      expect(cleanHTML(buffer)).to.eql(
        `<div a="[Object object]" data-pc-80f4925f></div>`
      );
    });
    xit("Can render text bindings", async () => {
      const graph = {
        "/entry.pc": `
          <div component as="Component" {class}>
            {children}
          </div>
  
          <Component class="a">b</Component>
        `
      };
      const engine = await createMockEngine(graph);
      const { preview } = await engine.run("/entry.pc");
      const buffer = `${stringifyVirtualNode(preview)}`;

      expect(cleanHTML(buffer)).to.eql(
        `<div class="a" data-pc-80f4925f>b</div>`
      );
    });
    xit("Displays an error if text binding is defined outside of component", async () => {
      const graph = {
        "/entry.pc": `
          <a {class}></a>
        `
      };
      const engine = await createMockEngine(graph);
      const e = waitForError(engine);
      engine.run("/entry.pc");
      const err = await e;
      expect(err).to.eql({
        kind: "Error",
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 12, end: 19 },
        message: "Bindings can only be defined within components."
      });
    });
    xit("Displays error for key-value binding outside of component", async () => {
      const graph = {
        "/entry.pc": `
          <a a={class}></a>
        `
      };
      const engine = await createMockEngine(graph);
      const e = waitForError(engine);
      engine.run("/entry.pc").catch(noop);
      const err = await e;
      expect(err).to.eql({
        kind: "Error",
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 14, end: 21 },
        message: "Bindings can only be defined within components."
      });
    });

    xit("Displays error for spread binding outside of component", async () => {
      const graph = {
        "/entry.pc": `
          <a {...class}></a>
        `
      };
      const engine = await createMockEngine(graph);
      const e = waitForError(engine);
      engine.run("/entry.pc").catch(noop);
      const err = await e;
      expect(err).to.eql({
        kind: "Error",
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 12, end: 22 },
        message: "Bindings can only be defined within components."
      });
    });

    xit("Displays error for text binding outside of component", async () => {
      const graph = {
        "/entry.pc": `
          {a}
        `
      };
      const engine = await createMockEngine(graph);
      const e = waitForError(engine);
      engine.run("/entry.pc").catch(noop);
      const err = await e;
      expect(err).to.eql({
        kind: "Error",
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 9, end: 12 },
        message: "Bindings can only be defined within components."
      });
    });

    xit("Displays error for class binding outside of component", async () => {
      const graph = {
        "/entry.pc": `
          <div class:a="a">
          </div>
        `
      };
      const engine = await createMockEngine(graph);
      const e = waitForError(engine);
      engine.run("/entry.pc").catch(noop);
      const err = await e;
      expect(err).to.eql({
        kind: "Error",
        errorKind: "Runtime",
        uri: "/entry.pc",
        location: { start: 14, end: 21 },
        message: "Bindings can only be defined within components."
      });
    });
  });

  it("Engine can't reload a file if there's an error", async () => {
    const graph = {
      "/entry.pc": `
        abc
      `
    };

    const engine = await createMockEngine(graph);
    const result = stringifyLoadResult(await engine.run("/entry.pc"));
    expect(result).to.eql(`<style></style> abc`);

    const e = waitForError(engine);
    engine.updateVirtualFileContent(`/entry.pc`, `<a `);
    const err = await e;
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
      err2 = await engine.run("/entry.pc");
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

    const result2 = stringifyLoadResult(await engine.run("/entry.pc"));
    expect(result2).to.eql(`<style></style><a data-pc-80f4925f></a>`);
  });

  it("Engine can't reload content if module errors", async () => {
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

    const engine = await createMockEngine(graph);
    const result = stringifyLoadResult(await engine.run("/entry.pc"));
    expect(result).to.eql(
      `<style></style><div data-pc-139cec8e>abc cde </div>`
    );

    // make the parse error
    await engine.updateVirtualFileContent(
      "/module.pc",
      `<div export component as="default">
    {chi`
    );

    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<import as="Component" src="./module.pc">
    <Component>defg</Component>`
    );

    let err;

    // shouldn't be able to load /entry.pc now
    try {
      await engine.run("/entry.pc");
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
    await engine.updateVirtualFileContent(
      "/module.pc",
      `<div export component as="default">
      cde {children}
    </div>`
    );

    const result3 = stringifyLoadResult(await engine.run("/entry.pc"));
    expect(result3).to.eql(
      `<style></style><div data-pc-139cec8e>cde defg</div>`
    );
  });

  it("Errors for incorrectly formatted slot number", async () => {
    const graph = {
      "/entry.pc": `
        {10.10.10}
      `
    };

    const engine = await createMockEngine(graph);
    const p = waitForError(engine);
    engine.run("/entry.pc").catch();
    expect(await p).to.eql({
      kind: "Error",
      errorKind: "Runtime",
      uri: "/entry.pc",
      location: { start: 10, end: 18 },
      message: "Invalid number."
    });
  });

  it("Entities are encoded", async () => {
    const graph = {
      "/entry.pc": `
        &times;
      `
    };

    const engine = await createMockEngine(graph);

    expect(stringifyLoadResult(await engine.run("/entry.pc"))).to.eql(
      "<style></style> ×"
    );
  });

  it("Returns component properties", async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test" class:a="a" {f} {b} className="{c}">
          {d}
          {e?}
          {f?}
        </div>
        <div export component as="Test2">
        </div>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.run("/entry.pc");

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
  });

  it("Cannot declare a component twice", async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test">
        </div>
        <div export component as="Test">
        </div>
      `
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
      location: { start: 58, end: 105 },
      message: "Component name is already declared."
    });
  });

  it("Throws an error if an imported module has a CSS error", async () => {
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
        location: { start: 9, end: 34 }
      }
    });
  });

  it("Displays an error if open tag is unclosed", async () => {
    const graph = {
      "/entry.pc": `
        <div <div />
      `
    };

    const engine = await createMockEngine(graph);

    let err;

    try {
      await engine.run("/entry.pc");
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
  });

  it("Can apply a class to {className?} without needing >>>", async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test" {className}>
        </div>
        <Test className="ok" />
      `
    };

    const engine = await createMockEngine(graph);

    const buffer = stringifyLoadResult(await engine.run("/entry.pc"));
    expect(buffer).to.eql(
      `<style></style><div className="_80f4925f_ok ok" data-pc-80f4925f></div>`
    );
  });

  it(`Can apply a class to className={className?} without needing >>>`, async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test" className={className?}>
        </div>
        <Test className="ok" />
      `
    };

    const engine = await createMockEngine(graph);

    const buffer = stringifyLoadResult(await engine.run("/entry.pc"));
    expect(buffer).to.eql(
      `<style></style><div className="_80f4925f_ok ok" data-pc-80f4925f></div>`
    );
  });

  it(`Can apply a class to className="a {className?}" without needing >>>`, async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test" className="a {className?}">
        </div>
        <Test className="ok" />
      `
    };

    const engine = await createMockEngine(graph);

    const buffer = stringifyLoadResult(await engine.run("/entry.pc"));
    expect(buffer).to.eql(
      `<style></style><div className="_80f4925f_a a _80f4925f_ok ok" data-pc-80f4925f></div>`
    );
  });

  it(`Doesn't apply scope if >>> is provided`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="./module.pc" as="module">
        <module.Test className=">>>ok" />
      `,
      "/module.pc": `
        <div export component as="Test" className="a {className?}">
        </div>
      `
    };

    const engine = await createMockEngine(graph);

    const buffer = stringifyLoadResult(await engine.run("/entry.pc"));
    expect(buffer).to.eql(
      `<style></style><div className="_139cec8e_a a _80f4925f_ok ok" data-pc-139cec8e></div>`
    );
  });

  // addresses https://github.com/crcn/paperclip/issues/336
  it(`Dynamic styles are ommitted if their associated prop is undefined`, async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test" style="--color: {color?}; --background: {background?};">
        </div>

        <Test color="a" />
        <Test background="b" />
        <Test color="a" background="b" />
        <Test />
      `
    };

    const engine = await createMockEngine(graph);

    const buffer = stringifyLoadResult(await engine.run("/entry.pc"));
    expect(buffer).to.eql(
      `<style></style><div data-pc-80f4925f style="--color: a;"></div><div data-pc-80f4925f style="--background: b;"></div><div data-pc-80f4925f style="--color: a; --background: b;"></div><div data-pc-80f4925f></div>`
    );
  });

  // addresses https://github.com/crcn/paperclip/issues/362
  it(`Can have class names with underscores in them`, async () => {
    const graph = {
      "/entry.pc": `
        <style>
          .its_a_match {

          }
        </style>
        <div className="its_a_match"></div>
      `
    };

    const engine = await createMockEngine(graph);

    const buffer = stringifyLoadResult(await engine.run("/entry.pc"));
    expect(buffer).to.eql(
      `<style>[class]._80f4925f_its_a_match { }</style><div className="_80f4925f_its_a_match its_a_match" data-pc-80f4925f></div>`
    );
  });

  it(`Errors if style block isn't defined at the root`, async () => {
    const graph = {
      "/entry.pc": `
        <div>
          <style>
          </style>
        </div>
      `
    };

    const engine = await createMockEngine(graph);

    let err;

    try {
      await engine.run("/entry.pc");
      const ast = engine.getLoadedAst("/entry.pc");
      console.log(JSON.stringify(ast, null, 2));
    } catch (e) {
      err = e;
    }

    expect(err).to.eql({
      errorKind: "Runtime",
      uri: "/entry.pc",
      location: { start: 25, end: 51 },
      message: "Style blocks needs to be defined at the root."
    });
  });

  // Addresses https://github.com/crcn/paperclip/issues/299
  it(`Errors if component is not defined at the root`, async () => {
    const graph = {
      "/entry.pc": `
        <div>
          <div component as="Test">
          </div>
        </div>
      `
    };

    const engine = await createMockEngine(graph);

    let err;

    try {
      await engine.run("/entry.pc");
      const ast = engine.getLoadedAst("/entry.pc");
      console.log(JSON.stringify(ast, null, 2));
    } catch (e) {
      err = e;
    }

    expect(err).to.eql({
      errorKind: "Runtime",
      uri: "/entry.pc",
      location: { start: 25, end: 67 },
      message: "Components need to be defined at the root."
    });
  });

  it(`Errors if component defined in element within a slot`, async () => {
    const graph = {
      "/entry.pc": `
        <div test={<div component as="blarg" />}>
          
        </div>
      `
    };

    const engine = await createMockEngine(graph);

    let err;

    try {
      await engine.run("/entry.pc");
      const ast = engine.getLoadedAst("/entry.pc");
      console.log(JSON.stringify(ast, null, 2));
    } catch (e) {
      err = e;
    }

    expect(err).to.eql({
      errorKind: "Runtime",
      uri: "/entry.pc",
      location: { start: 20, end: 48 },
      message: "Components need to be defined at the root."
    });
  });

  // Addresses https://github.com/crcn/paperclip/issues/372
  it(`Displays an error if a shadow pierce import is missing`, async () => {
    const graph = {
      "/entry.pc": `
        <div className=">>>tw.test">
          
        </div>
      `
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
      location: { start: 24, end: 35 },
      message: "Reference not found."
    });
  });

  // addresses: https://github.com/crcn/paperclip/issues/389
  it(`Displays an error if a class name is not found for shadow pierce`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="./module.pc" as="tw">
        <div className=">>>tw.test">
          
        </div>
      `,
      "/module.pc": `
        <style>

        </style>
      `
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
      location: { start: 67, end: 78 },
      message: "Class name not found."
    });
  });

  it(`Display an error if class name is private for shadow pierce`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="./module.pc" as="tw">
        <div className=">>>tw.test">
          
        </div>
      `,
      "/module.pc": `
        <style>
          .test {

          }
        </style>
      `
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
      location: { start: 67, end: 78 },
      message: "This class reference is private."
    });
  });

  it(`Can use a public class pierce`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="./module.pc" as="tw">
        <div className=">>>tw.test">
          
        </div>
      `,
      "/module.pc": `
        <style>
          @export {
            .test {

            }
          }
        </style>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.run("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>[class]._139cec8e_test { }</style><div className="_139cec8e_test" data-pc-80f4925f></div>`
    );
  });
});
