import { expect } from "chai";
import {
  createMockEngine,
  cleanHTML,
  waitForError,
  stringifyLoadResult,
  noop
} from "../utils";
import {
  EngineDelegateEventKind,
  LoadedPCData,
  PCExports,
  stringifyVirtualNode
} from "paperclip-utils";

describe(__filename + "#", () => {
  it("prevents circular dependencies", async () => {
    const graph = {
      "/entry.pc": `<import src="/module.pc"  />`,
      "/module.pc": `<import src="/entry.pc"  />`
    };
    const engine = await createMockEngine(graph);
    let err;
    try {
      await engine.open("/entry.pc");
    } catch (e) {
      err = e;
    }
    expect(err.message).to.eql("Circular dependencies are not supported");
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
    const { preview } = (await engine.open("/entry.pc")) as LoadedPCData;
    const buffer = `${stringifyVirtualNode(preview)}`;

    expect(cleanHTML(buffer)).to.eql(
      `<div class="_80f4925f_primary _pub-80f4925f_primary primary _80f4925f _pub-80f4925f"></div><div class="_80f4925f_alt _pub-80f4925f_alt alt _80f4925f_primary _pub-80f4925f_primary primary _80f4925f _pub-80f4925f"></div><div class="_80f4925f_alt2 _pub-80f4925f_alt2 alt2 _80f4925f_primary _pub-80f4925f_primary primary _80f4925f _pub-80f4925f"></div>`
    );
  });

  it("Can import keyframes", async () => {
    const graph = {
      "/entry.pc": `
        <import as="ab" src="./module.pc"  />
        <style>
          .rule {
            animation: ab.a 5s;
          }
        </style>
      `,
      "/module.pc": `
        <style>
          @export {
            @keyframes a {
            }
          }
        </style>
      `
    };
    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");

    const buffer = `${stringifyLoadResult(result)}`;

    expect(cleanHTML(buffer)).to.eql(
      `<style>@keyframes _pub-139cec8e_a { } @keyframes _139cec8e_a { } [class]._80f4925f_rule { animation:_pub-139cec8e_a 5s; }</style>`
    );
  });

  it("Doesn't crash if importing module with parse error", async () => {
    const graph = {
      "/entry.pc": `
        <import src="/module.pc" />

        <div>
        </div>
      `,
      "/module.pc": `<bad`
    };
    const engine = await createMockEngine(graph);
    let err;
    try {
      engine.open("/entry.pc");
    } catch (e) {
      err = e;
    }
    expect(err).to.eql({
      errorKind: "Graph",
      uri: "/module.pc",
      info: {
        kind: "EndOfFile",
        message: "End of file",
        range: {
          start: { pos: 0, line: 0, column: 0 },
          end: { pos: 0, line: 0, column: 0 }
        }
      }
    });
  });

  it("Doesn't crash if incorrect token is found in tag", async () => {
    const graph = {
      "/entry.pc": `
        <import src="/module.pc" />

        <div>
        </div>
      `,
      "/module.pc": `<bad!`
    };
    const engine = await createMockEngine(graph);
    let err;
    try {
      engine.open("/entry.pc");
    } catch (e) {
      err = e;
    }
    expect(err).to.eql({
      errorKind: "Graph",
      uri: "/module.pc",
      info: {
        kind: "Unexpected",
        message: "Unexpected token",
        range: {
          start: { pos: 4, line: 1, column: 5 },
          end: { pos: 4, line: 1, column: 5 }
        }
      }
    });
  });

  it("displays an error if a default component is used but not exported", async () => {
    const graph = {
      "/entry.pc": `
        <import as="module" src="/module.pc" />

        <module>
        </module>
      `,
      "/module.pc": `nothing to export!`
    };
    const engine = await createMockEngine(graph);
    let err;
    try {
      engine.open("/entry.pc");
    } catch (e) {
      err = e;
    }
    expect(err).to.eql({
      errorKind: "Runtime",
      uri: "/entry.pc",
      range: {
        start: { pos: 58, line: 4, column: 9 },
        end: { pos: 66, line: 4, column: 17 }
      },
      message: "Unable to find component, or it's not exported."
    });
  });

  it("displays error if img src not found", async () => {
    const graph = {
      "/entry.pc": `
        <img src="/not/found.png" />
      `
    };
    const engine = await createMockEngine(graph, noop, {
      resolveFile() {
        return null;
      }
    });

    let err;
    try {
      engine.open("/entry.pc");
    } catch (e) {
      err = e;
    }
    expect(err).to.eql({
      errorKind: "Runtime",
      uri: "/entry.pc",
      range: {
        start: { pos: 19, line: 2, column: 19 },
        end: { pos: 33, line: 2, column: 33 }
      },
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
      const { preview } = (await engine.open("/entry.pc")) as LoadedPCData;
      const buffer = `${stringifyVirtualNode(preview)}`;

      expect(cleanHTML(buffer)).to.eql(
        `<div a="[Object object]" class="_80f4925f _pub-80f4925f"></div>`
      );
    });
    it(`Can render a slot with a negative number`, async () => {
      const graph = {
        "/entry.pc": `<span>{-1}</span>`
      };
      const engine = await createMockEngine(graph);
      const { preview } = (await engine.open("/entry.pc")) as LoadedPCData;
      expect(cleanHTML(stringifyVirtualNode(preview))).to.eql(
        `<span class="_80f4925f _pub-80f4925f">-1</span>`
      );
    });
  });

  it("Engine can't reload a file if there's an error", async () => {
    const graph = {
      "/entry.pc": `
        abc
      `
    };

    const engine = await createMockEngine(graph);
    const result = stringifyLoadResult(await engine.open("/entry.pc"));
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
        range: {
          start: { pos: 0, line: 0, column: 0 },
          end: { pos: 0, line: 0, column: 0 }
        }
      }
    });

    let err2;
    try {
      err2 = await engine.open("/entry.pc");
    } catch (e) {
      err2 = e;
    }

    expect(err2).to.eql({
      errorKind: "Graph",
      uri: "/entry.pc",
      info: {
        kind: "EndOfFile",
        message: "End of file",
        range: {
          start: { pos: 0, line: 0, column: 0 },
          end: { pos: 0, line: 0, column: 0 }
        }
      }
    });

    engine.updateVirtualFileContent(`/entry.pc`, `<a></a>`);

    const result2 = stringifyLoadResult(await engine.open("/entry.pc"));
    expect(result2).to.eql(
      `<style></style><a class="_80f4925f _pub-80f4925f"></a>`
    );
  });

  it("Engine can't reload content if module errors", async () => {
    const graph = {
      "/entry.pc": `
        <import as="Component" src="./module.pc" />
        <Component>abc</Component>
      `,
      "/module.pc": `
        <div export component as="default">
          {children} cde
        </div>
      `
    };

    const engine = await createMockEngine(graph);
    const result = stringifyLoadResult(await engine.open("/entry.pc"));
    expect(result).to.eql(
      `<style></style><div class="_139cec8e _pub-139cec8e">abc cde </div>`
    );

    // make the parse error
    await engine.updateVirtualFileContent(
      "/module.pc",
      `<div export component as="default">
    {chi`
    );

    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<import as="Component" src="./module.pc" />
    <Component>defg</Component>`
    );

    let err;

    // shouldn't be able to load /entry.pc now
    try {
      await engine.open("/entry.pc");
    } catch (e) {
      err = e;
    }

    expect(err).to.eql({
      errorKind: "Graph",
      uri: "/module.pc",
      info: {
        kind: "Unterminated",
        message: "Unterminated slot.",
        range: {
          start: { pos: 41, line: 2, column: 6 },
          end: { pos: 44, line: 2, column: 9 }
        }
      }
    });

    // introduce fix
    await engine.updateVirtualFileContent(
      "/module.pc",
      `<div export component as="default">
      cde {children}
    </div>`
    );

    const result3 = stringifyLoadResult(await engine.open("/entry.pc"));
    expect(result3).to.eql(
      `<style></style><div class="_139cec8e _pub-139cec8e"> cde defg</div>`
    );
  });

  it("Errors for incorrectly formatted slot number", async () => {
    const graph = {
      "/entry.pc": `
        {10.10.10}
      `
    };

    const engine = await createMockEngine(graph);
    let err;
    try {
      engine.open("/entry.pc");
    } catch (e) {
      err = e;
    }
    expect(err).to.eql({
      errorKind: "Runtime",
      uri: "/entry.pc",
      range: {
        start: { pos: 10, line: 2, column: 10 },
        end: { pos: 18, line: 2, column: 18 }
      },
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

    expect(stringifyLoadResult(await engine.open("/entry.pc"))).to.eql(
      "<style></style> ×"
    );
  });

  it("Returns component properties", async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test" class:a="a" {f} {b} class="{c}">
          {d}
          {e?}
          {f?}
        </div>
        <div export component as="Test2">
        </div>
      `
    };

    const engine = await createMockEngine(graph);
    const result = (await engine.open("/entry.pc")) as LoadedPCData;

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

  it("Exports are updated", async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test">
        </div>
      `
    };

    const engine = await createMockEngine(graph);
    const result = (await engine.open("/entry.pc")) as LoadedPCData;

    expect(result.exports.components).to.eql({
      Test: {
        name: "Test",
        properties: {},
        public: false
      }
    });

    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<div component as="Test2">
    </div>`
    );
    const result2 = engine.getLoadedData("/entry.pc");

    expect((result2.exports as PCExports).components).to.eql({
      Test2: {
        name: "Test2",
        properties: {},
        public: false
      }
    });
  });

  it("Conditional blocks are collected in export props", async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test">
          {a && b? && (c) && <b>{d}</b>}
        </div>
      `
    };

    const engine = await createMockEngine(graph);
    const result = (await engine.open("/entry.pc")) as LoadedPCData;

    expect(result.exports.components).to.eql({
      Test: {
        name: "Test",
        properties: {
          a: {
            name: "a",
            optional: false
          },
          b: {
            name: "b",
            optional: true
          },
          c: {
            name: "c",
            optional: false
          },
          d: {
            name: "d",
            optional: false
          }
        },
        public: false
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
      await engine.open("/entry.pc");
    } catch (e) {
      err = e;
    }
    expect(err).to.eql({
      errorKind: "Runtime",
      uri: "/entry.pc",
      range: {
        start: { pos: 58, line: 4, column: 9 },
        end: { pos: 105, line: 5, column: 15 }
      },
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
      await engine.open("/entry.pc");
    } catch (e) {
      err = e;
    }

    expect(err).to.eql({
      errorKind: "Graph",
      uri: "/entry.pc",
      info: {
        kind: "Unterminated",
        message: "Unterminated element.",
        range: {
          start: { pos: 9, line: 2, column: 9 },
          end: { pos: 34, line: 2, column: 34 }
        }
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
      await engine.open("/entry.pc");
      engine.getLoadedAst("/entry.pc");
    } catch (e) {
      err = e;
    }
    expect(err).to.eql({
      errorKind: "Graph",
      uri: "/entry.pc",
      info: {
        kind: "Unexpected",
        message: "Unexpected token",
        range: {
          start: { pos: 14, line: 2, column: 14 },
          end: { pos: 14, line: 2, column: 14 }
        }
      }
    });
  });

  // we don't want this since it is _implicit_
  xit("Can apply a class to {class?} without needing $", async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test" {class}>
        </div>
        <Test class="ok" />
      `
    };

    const engine = await createMockEngine(graph);

    const buffer = stringifyLoadResult(await engine.open("/entry.pc"));
    expect(buffer).to.eql(
      `<style></style><div class="_80f4925f_ok _pub-80f4925f_ok ok _80f4925f _pub-80f4925f"></div>`
    );
  });

  xit(`Can apply a class to className={className?} without needing $`, async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test" className={className?}>
        </div>
        <Test className="ok" />
      `
    };

    const engine = await createMockEngine(graph);

    const buffer = stringifyLoadResult(await engine.open("/entry.pc"));
    expect(buffer).to.eql(
      `<style></style><div class="_80f4925f_ok _pub-80f4925f_ok ok _80f4925f _pub-80f4925f"></div>`
    );
  });

  xit(`Can apply a class to className="a {className?}" without needing $`, async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test" className="a {className?}">
        </div>
        <Test className="ok" />
      `
    };

    const engine = await createMockEngine(graph);

    const buffer = stringifyLoadResult(await engine.open("/entry.pc"));
    expect(buffer).to.eql(
      `<style></style><div class="_80f4925f_a _pub-80f4925f_a a _80f4925f_ok _pub-80f4925f_ok ok _80f4925f _pub-80f4925f"></div>`
    );
  });

  it(`Doesn't apply scope if $ is provided`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="./module.pc" as="module" />
        <module.Test className="$ok" />
      `,
      "/module.pc": `
        <div export component as="Test" class="a {className?}">
        </div>
      `
    };

    const engine = await createMockEngine(graph);

    const buffer = stringifyLoadResult(await engine.open("/entry.pc"));
    expect(buffer).to.eql(
      `<style></style><div class="_139cec8e_a _pub-139cec8e_a a _80f4925f_ok _pub-80f4925f_ok ok _139cec8e _pub-139cec8e"></div>`
    );
  });

  // addresses https://github.com/paperclipui/paperclip/issues/336
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

    const buffer = stringifyLoadResult(await engine.open("/entry.pc"));
    expect(buffer).to.eql(
      `<style></style><div class="_80f4925f _pub-80f4925f" style="--color: a;"></div><div class="_80f4925f _pub-80f4925f" style="--background: b;"></div><div class="_80f4925f _pub-80f4925f" style="--color: a; --background: b;"></div><div class="_80f4925f _pub-80f4925f"></div>`
    );
  });

  // addresses https://github.com/paperclipui/paperclip/issues/362
  it(`Can have class names with underscores in them`, async () => {
    const graph = {
      "/entry.pc": `
        <style>
          .its_a_match {
            color: blue;
          }
        </style>
        <div class="its_a_match"></div>
      `
    };

    const engine = await createMockEngine(graph);
    const buffer = stringifyLoadResult(await engine.open("/entry.pc"));
    expect(buffer).to.eql(
      `<style>[class]._80f4925f_its_a_match { color:blue; }</style><div class="_80f4925f_its_a_match _pub-80f4925f_its_a_match its_a_match _80f4925f _pub-80f4925f"></div>`
    );
  });

  // Addresses https://github.com/paperclipui/paperclip/issues/299
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
      await engine.open("/entry.pc");
      engine.getLoadedAst("/entry.pc");
    } catch (e) {
      err = e;
    }

    expect(err).to.eql({
      errorKind: "Runtime",
      uri: "/entry.pc",
      range: {
        start: { pos: 25, line: 3, column: 11 },
        end: { pos: 67, line: 4, column: 17 }
      },
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
      await engine.open("/entry.pc");
      engine.getLoadedAst("/entry.pc");
    } catch (e) {
      err = e;
    }

    expect(err).to.eql({
      errorKind: "Runtime",
      uri: "/entry.pc",
      range: {
        start: { pos: 20, line: 2, column: 20 },
        end: { pos: 48, line: 2, column: 48 }
      },
      message: "Components need to be defined at the root."
    });
  });

  // Addresses https://github.com/paperclipui/paperclip/issues/372
  it(`Displays an error if a shadow pierce import is missing`, async () => {
    const graph = {
      "/entry.pc": `
        <div class="$tw.test">
          
        </div>
      `
    };

    const engine = await createMockEngine(graph);

    let err;

    try {
      await engine.open("/entry.pc");
    } catch (e) {
      err = e;
    }

    expect(err).to.eql({
      errorKind: "Runtime",
      uri: "/entry.pc",
      range: {
        start: { pos: 20, line: 2, column: 20 },
        end: { pos: 29, line: 2, column: 29 }
      },
      message: "Reference not found."
    });
  });

  // addresses: https://github.com/paperclipui/paperclip/issues/389
  it(`Displays an error if a class name is not found for shadow pierce`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="./module.pc" as="tw" />
        <div className="$tw.test">
          
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
      await engine.open("/entry.pc");
    } catch (e) {
      err = e;
    }

    expect(err).to.eql({
      errorKind: "Runtime",
      uri: "/entry.pc",
      range: {
        start: { pos: 69, line: 3, column: 24 },
        end: { pos: 78, line: 3, column: 33 }
      },
      message: "Class name not found."
    });
  });

  it(`Display an error if class name is private for shadow pierce`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="./module.pc" as="tw" />
        <div className="$tw.test">
          
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
      await engine.open("/entry.pc");
    } catch (e) {
      err = e;
    }

    expect(err).to.eql({
      errorKind: "Runtime",
      uri: "/entry.pc",
      range: {
        start: { pos: 69, line: 3, column: 24 },
        end: { pos: 78, line: 3, column: 33 }
      },
      message: "This class reference is private."
    });
  });

  it(`Can use a public class pierce`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="./module.pc" as="tw" />
        <div class="$tw.test">
          
        </div>
      `,
      "/module.pc": `
        <style>
          @export {
            .test {
              color: blue;
            }
          }
        </style>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>[class]._pub-139cec8e_test { color:blue; }</style><div class="_pub-139cec8e_test test _80f4925f _pub-80f4925f"></div>`
    );
  });

  it(`Deprecated >>> works`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="./module.pc" as="tw" />
        <div class=">>>tw.test">
          
        </div>
      `,
      "/module.pc": `
        <style>
          @export {
            .test {
              color: orange;
            }
          }
        </style>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>[class]._pub-139cec8e_test { color:orange; }</style><div class="_pub-139cec8e_test test _80f4925f _pub-80f4925f"></div>`
    );
  });
  it(`Can use a public class pierce on a component`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="./module.pc" as="tw" />
        <div export component as="Test" class="$tw.test">
          
        </div>
        <Test />
      `,
      "/module.pc": `
        <style>
          @export {
            .test {
              background: blue;
            }
          }
        </style>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>[class]._pub-139cec8e_test { background:blue; }</style><div class="_pub-139cec8e_test test _80f4925f _pub-80f4925f"></div>`
    );
  });
  it(`Can use a component that's referencing a public class`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="./module.pc" as="mod" />
        <mod.Test />
      `,
      "/module.pc": `
        <import src="./module2.pc" as="tw" />
        <div export component as="Test" class="$tw.test">
        </div>
      `,
      "/module2.pc": `
        <style>
          @export {
            .test {
              color: blue;
            }
          }
        </style>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>[class]._pub-11a847ab_test { color:blue; }</style><div class="_pub-11a847ab_test test _139cec8e _pub-139cec8e"></div>`
    );
  });

  it(`Prefixes classnames if they come after shadow pierce`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="./module.pc" as="tw" />
        <div export component as="Test" class="$tw.test checkbox">
          
        </div>
        <Test />
      `,
      "/module.pc": `
        <style>
          @export {
            .test {
              color: blue;
            }
          }
        </style>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>[class]._pub-139cec8e_test { color:blue; }</style><div class="_pub-139cec8e_test test checkbox _80f4925f _pub-80f4925f"></div>`
    );
  });

  it(`Can change the tag name of an element`, async () => {
    const graph = {
      "/entry.pc": `
        <div {tagName?} component as="Test">
          
        </div>
        <Test />
        <Test tagName="span" />
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style></style><div class="_80f4925f _pub-80f4925f"></div><span class="_80f4925f _pub-80f4925f"></span>`
    );
  });
  it(`Cannot change tag name if not exposed`, async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test">
          
        </div>
        <Test />
        <Test tagName="span" />
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style></style><div class="_80f4925f _pub-80f4925f"></div><div class="_80f4925f _pub-80f4925f"></div>`
    );
  });
  it(`Does not render undefined if child isn't present`, async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test">
          {children}
          {slot}
        </div>
        <Test />
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style></style><div class="_80f4925f _pub-80f4925f"></div>`
    );
  });

  it(`Doesn't crash when dependency is updated`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="a.pc" />
        <import src="b.pc" as="b" />
        
        <b />
      `,
      "/a.pc": `a`,
      "/b.pc": `
        <div export component as="default">b</div>
      `
    };

    let crashErr;

    const engine = await createMockEngine(graph, e => {
      crashErr = e;
    });

    await engine.open("/entry.pc");
    await engine.open("/b.pc");

    try {
      // write a syntax error
      await engine.updateVirtualFileContent(
        "/b.pc",
        `<div export component as="default">b</div><div value">`
      );
      // eslint-disable-next-line
    } catch (e) {}
    await engine.updateVirtualFileContent("/a.pc", `aa`);

    expect(crashErr).to.eql(undefined);
    await engine.updateVirtualFileContent(
      "/b.pc",
      `<div export component as="default">bb</div>`
    );

    const result = await engine.open("/entry.pc");

    expect(stringifyLoadResult(result)).to.eql(
      `<style></style><div class="_8ae793af _pub-8ae793af">bb</div>`
    );
  });

  it(`Can define nested style blocks`, async () => {
    const graph = {
      "/entry.pc": `
        <div>
          <style>
            :self {
              color: blue;
            }
            :self(.test) {
              color: red;
            }
            
            #test2 {
              color: blue;
            }
          </style>
        </div>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>._406d2856._406d2856 { color:blue; } ._406d2856._406d2856._80f4925f_test { color:red; } ._406d2856 #test2._80f4925f { color:blue; }</style><div class="_80f4925f _pub-80f4925f _406d2856"></div>`
    );
  });

  it(`Can define nested slot style blocks`, async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test"> 
          {test}
        </div>
        <Test test={<span>
          <style> 
            :self {
              color: red;
            }
          </style>
          abba
        </span>} />
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>._6f887789._6f887789 { color:red; }</style><div class="_80f4925f _pub-80f4925f"><span class="_80f4925f _pub-80f4925f _6f887789"> abba </span></div>`
    );
  });

  it(`Can define scoped styles without :self selector`, async () => {
    const graph = {
      "/entry.pc": `
        <div>
          <style>
            color: red;
            background: url("path.png");
            :self(.variant) {
              color: blue;
            }
          </style>
        </div>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>._406d2856._406d2856 { color:red; background:url(/path.png); } ._406d2856._406d2856._80f4925f_variant { color:blue; }</style><div class="_80f4925f _pub-80f4925f _406d2856"></div>`
    );
  });

  it(`Can include mixins within scoped styles`, async () => {
    const graph = {
      "/entry.pc": `
        <style>
          @mixin a {
            color: red;
          }
        </style>
        <div>
          <style>
            @include a;
          </style>
        </div>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>._376a18c0._376a18c0 { color:red; }</style><div class="_80f4925f _pub-80f4925f _376a18c0"></div>`
    );
  });

  it(`Can include mixins within scoped styles with a decl`, async () => {
    const graph = {
      "/entry.pc": `
        <style>
          @mixin a {
            color: red;
          }
        </style>
        <div>
          <style>
            background: blue;
            @include a;
          </style>
        </div>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>._376a18c0._376a18c0 { background:blue; color:red; }</style><div class="_80f4925f _pub-80f4925f _376a18c0"></div>`
    );
  });

  it(`Can define style tag for void elements`, async () => {
    const graph = {
      "/entry.pc": `
        <input>
          <style>
            background: blue;
          </style>
        </input>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>._406d2856._406d2856 { background:blue; }</style><input class="_80f4925f _pub-80f4925f _406d2856"></input>`
    );
  });

  it(`Can scope media queries`, async () => {
    const graph = {
      "/entry.pc": `

        <style>
          @mixin desktop {
            @media screen and (max-width: 1280px) {
              @content;
            }
          }
        </style>
        <input>
          <style>
            @media screen and (max-width: 400px) {
              color: red;
            }

            @include desktop {
              color: black;
            }

            label {
              @include desktop {
                color: blue;
              }
            }
          </style>
        </input>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>@media screen and (max-width: 400px) { ._376a18c0._376a18c0 { color:red; } } @media screen and (max-width: 1280px) { ._376a18c0._376a18c0 { color:black; } } @media screen and (max-width: 1280px) { ._376a18c0 label._80f4925f { color:blue; } }</style><input class="_80f4925f _pub-80f4925f _376a18c0"></input>`
    );
  });

  it(`Can apply styles to a component`, async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test" {class?}>

        </div>
        <Test>
          <style>
            background: blue;
          </style>
        </Test>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>[class]._376a18c0 { background:blue; }</style><div class="_80f4925f__376a18c0 _pub-80f4925f__376a18c0 _376a18c0 _80f4925f _pub-80f4925f"></div>`
    );
  });

  it(`Can apply styles to a component that has a class already defined`, async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test" {class?}>

        </div>
        <Test class="test">
          <style>
            background: blue;
          </style>
        </Test>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>[class]._376a18c0 { background:blue; }</style><div class="_80f4925f_test _pub-80f4925f_test test _80f4925f__376a18c0 _pub-80f4925f__376a18c0 _376a18c0 _80f4925f _pub-80f4925f"></div>`
    );
  });

  it(`Can apply styles to instance of instance of component`, async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test" {class?}>

        </div>
        <Test component as="Test2" class="test {class?}">
          <style>
            background: blue;
          </style>
        </Test>
        <Test2 class="test3">
          <style>
            background: orange;
          </style>
        </Test2>

      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>[class]._376a18c0 { background:blue; } [class]._ae63497a { background:orange; }</style><div class="_80f4925f_test _pub-80f4925f_test test _80f4925f_test3 _pub-80f4925f_test3 test3 _80f4925f__ae63497a _pub-80f4925f__ae63497a _ae63497a _80f4925f__376a18c0 _pub-80f4925f__376a18c0 _376a18c0 _80f4925f _pub-80f4925f"></div>`
    );
  });

  it(`Properly emits correct events`, async () => {
    const graph = {
      "/entry.pc": `
        a
      `
    };

    const engine = await createMockEngine(graph);
    const events = [];
    engine.onEvent(events.push.bind(events));
    await engine.open("/entry.pc");
    await engine.updateVirtualFileContent("/entry.pc", "b");
    await engine.updateVirtualFileContent("/entry.pc", "c");
    expect(events.map(event => event.kind)).to.eql([
      EngineDelegateEventKind.Loaded,
      EngineDelegateEventKind.Evaluated,
      EngineDelegateEventKind.Diffed,
      EngineDelegateEventKind.Diffed
    ]);
  });

  // fixes https://github.com/paperclipui/paperclip/issues/508
  it(`properly applies scoped style for nested & combo`, async () => {
    const graph = {
      "/entry.pc": `
      <div component as="Test">
        <style>
          color: red;

          a {
            background: blue;

            &.b, &.c {
              opacity: 1;
            }

            e {
              color: orange;
            }
          }
        </style>
      </div>
      
      <Test />
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>._406d2856._406d2856 { color:red; } ._406d2856 a._80f4925f { background:blue; } ._406d2856 a._80f4925f._80f4925f_b { opacity:1; } ._406d2856 a._80f4925f._80f4925f_c { opacity:1; } ._406d2856 a._80f4925f e._80f4925f { color:orange; }</style><div class="_80f4925f _pub-80f4925f _406d2856"></div>`
    );
  });

  it(`can use :self with group selectors`, async () => {
    const graph = {
      "/entry.pc": `
      <div component as="Test">
        <style>
          :self(a, :hover) {
            color: blue;
          }
        </style>
      </div>
      
      <Test />
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>._406d2856._406d2856a { color:blue; } ._406d2856._406d2856:hover { color:blue; }</style><div class="_80f4925f _pub-80f4925f _406d2856"></div>`
    );
  });

  it("properly scopes nested selectors in :self", async () => {
    const graph = {
      "/entry.pc": `
      <div>
        <style>
          :self(.a) {
            .b:hover {
              color: blue;
            }
          }
        </style>
      </div>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      `<style>._406d2856._406d2856._80f4925f_a ._80f4925f_b._80f4925f:hover { color:blue; }</style><div class="_80f4925f _pub-80f4925f _406d2856"></div>`
    );
  });

  it(`properly chains nested combo selector`, async () => {
    const graph = {
      "/entry.pc": `
      <style>
        .a {
          &.b.c {
            color: blue;
          }
        }
      </style>
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.open("/entry.pc");
    expect(stringifyLoadResult(result)).to.eql(
      "<style>[class]._80f4925f_a._80f4925f_b._80f4925f_c { color:blue; }</style>"
    );
  });

  it(`last node is removed if it's whitespace`, async () => {
    const graph = {
      "/entry.pc": `
      <span></span>
      `
    };

    const engine = await createMockEngine(graph);
    const result = (await engine.open("/entry.pc")) as any;
    expect(result.preview.children[0].kind).to.eql("Element");
    expect(result.preview.children.length).to.eql(1);
  });

  // Dunno why I added this - empty frames should just be ignored. If someone
  // wants a frame to be visible, they can just add content
  xit(`last node is preserved if it has annotations`, async () => {
    const graph = {
      "/entry.pc": `
      <span></span>
      <!--
        @frame {}
      -->
      `
    };

    const engine = await createMockEngine(graph);
    const result = (await engine.open("/entry.pc")) as any;
    expect(result.preview.children.length).to.eql(2);
    expect(result.preview.children[1].value).to.eql("\n      ");
  });

  it(`scoped styles can be applied to component instances`, async () => {
    const graph = {
      "/entry.pc": `
      <span component as="Test" {class?}>
        <style>
          display: none;
        </style>
      </span>

      <Test component as="Test2" {class?}>
        <style>
          display: block;
          .child {
            color: red;
          }
        </style>
      </Test>

      <Test />
      <Test2>
        <style>
          color: orange;
        </style>
      </Test2>

      `
    };

    const engine = await createMockEngine(graph);
    const result = (await engine.open("/entry.pc")) as any;

    const buffer = `${stringifyLoadResult(result)}`;
    expect(buffer).to.eql(
      `<style>._406d2856._406d2856 { display:none; } [class]._376a18c0 { display:block; } [class]._376a18c0 [class]._80f4925f_child { color:red; } [class]._d96479ec { color:orange; }</style><span class="_80f4925f _pub-80f4925f _406d2856"></span><span class="_80f4925f__d96479ec _pub-80f4925f__d96479ec _d96479ec _80f4925f__376a18c0 _pub-80f4925f__376a18c0 _376a18c0 _80f4925f _pub-80f4925f _406d2856"></span>`
    );
  });

  it(`Works with logical && and nodes`, async () => {
    const graph = {
      "/entry.pc": `
      {0 && <div>A</div>}
      {true && <div>B</div>}
      {1 && <div>C</div>}
      {false && <div>D</div>}
      {false && <div>D</div> || <div>E</div>}
      {false && <div>D</div> || false || 99 \n\n}
      {false && <div>D</div> || false || 0 && "blah" }
      {false || <div>F</div> }
      `
    };

    const engine = await createMockEngine(graph);
    const result = (await engine.open("/entry.pc")) as any;

    const buffer = `${stringifyLoadResult(result)}`;
    expect(buffer).to.eql(
      `<style></style>0<div class="_80f4925f _pub-80f4925f">B</div><div class="_80f4925f _pub-80f4925f">C</div><div class="_80f4925f _pub-80f4925f">E</div>990<div class="_80f4925f _pub-80f4925f">F</div>`
    );
  });

  it(`Works with ! negation`, async () => {
    const graph = {
      "/entry.pc": `
      {!false}
      {!!false}
      {!!!false}
      {!!!0}
      {!0 && <div>A</div>}
      `
    };

    const engine = await createMockEngine(graph);
    const result = (await engine.open("/entry.pc")) as any;

    const buffer = `${stringifyLoadResult(result)}`;
    expect(buffer).to.eql(
      `<style></style>truetruetrue<div class="_80f4925f _pub-80f4925f">A</div>`
    );
  });

  it(`Can parse groups ()`, async () => {
    const graph = {
      "/entry.pc": `
      {(true || true) && <div>Something</div>}
      `
    };

    const engine = await createMockEngine(graph);
    const result = (await engine.open("/entry.pc")) as any;

    const buffer = `${stringifyLoadResult(result)}`;
    expect(buffer).to.eql(
      `<style></style><div class="_80f4925f _pub-80f4925f">Something</div>`
    );
  });

  it(`Can have various tag names`, async () => {
    const graph = {
      "/entry.pc": `
      <a_2 />
      <_a_2 />
      <$a />
      `
    };

    const engine = await createMockEngine(graph);
    const result = (await engine.open("/entry.pc")) as any;

    const buffer = `${stringifyLoadResult(result)}`;
    expect(buffer).to.eql(
      `<style></style><a_2 class="_80f4925f _pub-80f4925f"></a_2><_a_2 class="_80f4925f _pub-80f4925f"></_a_2><$a class="_80f4925f _pub-80f4925f"></$a>`
    );
  });

  it(`Includes style from element defined within conditional block`, async () => {
    const graph = {
      "/entry.pc": `
      <div component as="Test">
        {a && <span>
          <style>
            color: blue;
          </style>
        </span>}
        {b}
      </div>

      <Test a b={true && <div>
        <style>
          color: red;
        </style>
      </div>}/>
      `
    };

    const engine = await createMockEngine(graph);
    const result = (await engine.open("/entry.pc")) as any;

    const buffer = `${stringifyLoadResult(result)}`;
    expect(buffer).to.eql(
      `<style>._3024ebf3._3024ebf3 { color:blue; } ._188f471f._188f471f { color:red; }</style><div class="_80f4925f _pub-80f4925f"><span class="_80f4925f _pub-80f4925f _3024ebf3"></span><div class="_80f4925f _pub-80f4925f _188f471f"></div></div>`
    );
  });
  xit(`Treats class & className the same`, async () => {
    const graph = {
      "/entry.pc": `
        <div component as="Test" class:a="a" class="a2">
        </div>
        <div className="a" />
        <div class="b" />
        <div className="b" class="c" />
        <div class="b" className="c" />
        <div className="a" class />
        <Test />
        <Test a />

      `
    };

    const engine = await createMockEngine(graph);
    const result = (await engine.open("/entry.pc")) as any;

    const buffer = `${stringifyLoadResult(result)}`;
    expect(buffer).to.eql(
      `<style></style><div class="_80f4925f_a _pub-80f4925f_a a _80f4925f _pub-80f4925f"></div><div class="_80f4925f_b _pub-80f4925f_b b _80f4925f _pub-80f4925f"></div><div class="_80f4925f_c _pub-80f4925f_c c _80f4925f _pub-80f4925f"></div><div class="_80f4925f_c _pub-80f4925f_c c _80f4925f _pub-80f4925f"></div><div class="_80f4925f _pub-80f4925f"></div><div class="_80f4925f_a2 _pub-80f4925f_a2 a2 _80f4925f _pub-80f4925f"></div><div class="_80f4925f_a _pub-80f4925f_a a _80f4925f_a2 _pub-80f4925f_a2 a2 _80f4925f _pub-80f4925f"></div>`
    );
  });
  it(`Can delete files from the graph`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="./mod.pc" as="mod" />
        <mod.Test>a</mod.Test>

      `,
      "/mod.pc": `
        <div export component as="Test">
          {children} b
        </div>
      `
    };

    const engine = await createMockEngine(graph);
    let result = (await engine.open("/entry.pc")) as any;

    expect(stringifyLoadResult(result)).to.eql(
      `<style></style><div class="_c938aea3 _pub-c938aea3">a b </div>`
    );

    graph["/mod.pc"] = undefined;

    engine.purgeUnlinkedFiles();

    try {
      await engine.open("/entry.pc");
    } catch (e) {
      expect(e.info.message).to.eql("import not found");
    }

    await engine.updateVirtualFileContent("/entry.pc", "<b>a</b>");
    result = (await engine.open("/entry.pc")) as any;

    expect(stringifyLoadResult(result)).to.eql(
      `<style></style><b class="_80f4925f _pub-80f4925f">a</b>`
    );
  });

  // https://github.com/paperclipui/paperclip/issues/708
  it(`Re-evaluates module after error & no change`, async () => {
    const graph = {
      "/entry.pc": `<div />`
    };

    const engine = await createMockEngine(graph);
    const result = (await engine.open("/entry.pc")) as any;

    let lastEvent;

    engine.onEvent(e => {
      lastEvent = e;
    });

    expect(stringifyLoadResult(result)).to.eql(
      `<style></style><div class="_80f4925f _pub-80f4925f"></div>`
    );

    await engine.updateVirtualFileContent("/entry.pc", "<div /");

    expect(lastEvent).to.eql({
      kind: "Error",
      errorKind: "Graph",
      uri: "/entry.pc",
      info: {
        kind: "Unexpected",
        message: "Unexpected token",
        range: {
          start: { pos: 5, line: 1, column: 6 },
          end: { pos: 5, line: 1, column: 6 }
        }
      }
    });

    await engine.updateVirtualFileContent("/entry.pc", "<div />");

    expect(lastEvent).to.eql({
      kind: "Diffed",
      uri: "/entry.pc",
      data: {
        kind: "PC",
        sheetMutations: [],
        allImportedSheetUris: [],
        dependencies: {},
        exports: {
          style: {
            kind: "Exports",
            classNames: {},
            mixins: {},
            variables: {},
            keyframes: {}
          },
          components: {}
        },
        mutations: []
      }
    });
  });
});
