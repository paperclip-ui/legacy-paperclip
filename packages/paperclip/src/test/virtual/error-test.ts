import { expect } from "chai";
import { createMockEngine, stringifyLoadResult } from "../utils";

import { noop } from "../../core/utils";
import { LoadedPCData, stringifyCSSSheet } from "../../core";

describe(__filename + "#", () => {
  it("displays the correct line & column number for error", async () => {
    const graph = {
      "/entry.pc": `
        <a>
          blagh
      `
    };
    const engine = await createMockEngine(graph);
    const text = stringifyLoadResult(await engine.open("/entry.pc"));
    expect(text).to.eql("<style>[class]._80f4925f_a { color:b; }</style>");
  });
});
