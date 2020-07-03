import { expect } from "chai";
import { createMockEngine, stringifyLoadResult } from "./utils";
import { EngineEventKind, stringifyVirtualNode } from "paperclip-utils";

describe(__filename + "#", () => {
  it("can render a simple style", async () => {
    const graph = {
      "/entry.pc": `<style>
        .a {
          color: b;
        }
      </style>`,
      "/module.pc": `<import src="/entry.pc">`
    };
    const engine = createMockEngine(graph);
    const text = stringifyLoadResult(await engine.load("/module.pc"));
    expect(text).to.eql("<style>._80f4925f_a { color:b; }</style>");
  });

  describe("Mixins", () => {});
});
