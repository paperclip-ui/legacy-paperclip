import { expect } from "chai";
import { createMockEngine } from "../utils";

xdescribe(__filename + "#", () => {
  it("can parse a text annotation", async () => {
    const graph = {
      "/entry.pc": `
        <!--
          Something
        -->

        <div />
      `
    };
    const engine = await createMockEngine(graph);
    const result = engine.run("/entry.pc");

    expect(result).to.eql("k");
  });
});
