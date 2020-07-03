import { expect } from "chai";
import { createMockEngine, cleanHTML, waitForError } from "./utils";
import { EngineEventKind, stringifyVirtualNode } from "paperclip-utils";

describe(__filename + "#", () => {
  it("prevents circular dependencies", async () => {
    const graph = {
      "/entry.pc": `<import src="/module.pc">`,
      "/module.pc": `<import src="/entry.pc">`
    };
    const engine = createMockEngine(graph);
    const p = new Promise<any>(resolve => {
      engine.onEvent(event => {
        if (event.kind === EngineEventKind.Error) {
          resolve(event);
        }
      });
    });
    engine.load("/module.pc");
    const err = await p;
    expect(err.message).to.eql("Circular dependencies are not supported yet.");
  });

  it("dynamic attributes work", async () => {
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
    const engine = createMockEngine(graph);
    const { preview } = await engine.load("/entry.pc");
    const buffer = `${stringifyVirtualNode(preview)}`;

    expect(cleanHTML(buffer)).to.eql(
      `<div class="_80f4925f_primary primary" data-pc-80f4925f></div><div class="_80f4925f_alt alt _80f4925f_primary primary" data-pc-80f4925f></div><div class="_80f4925f_alt2 alt2 _80f4925f_primary primary" data-pc-80f4925f></div>`
    );
  });

  it("Doesn't crash if importing module with parse error", async () => {
    const graph = {
      "/entry.pc": `
        <import src="/module.pc">

        <div>
        </div>
      `,
      "/module.pc": `<bad!`
    };
    const engine = createMockEngine(graph);
    const e = waitForError(engine);
    engine.load("/entry.pc");
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

  it("Doesn't crash if importing module with evaluation error", async () => {
    const graph = {
      "/entry.pc": `
        <import as="test" src="/module.pc">

        <div>
        </div>
      `,
      "/module.pc": `
        <style>
          .style {
            @include b;
          }
        </style>
      `
    };

    let _e;

    const engine = createMockEngine(graph, e => (_e = e));
    const e = waitForError(engine, e => {
      return (
        e.message === "Cannot import this module since it contains an error."
      );
    });
    engine.load("/entry.pc");
    const err = await e;

    expect(_e).to.eql(undefined);
    expect(err).to.eql({
      kind: "Error",
      errorKind: "Runtime",
      uri: "/entry.pc",
      location: { start: 9, end: 44 },
      message: "Cannot import this module since it contains an error."
    });
  });

  xit("displays an error if a default component is used but not exported", async () => {});
});
