import { expect } from "chai";
import { createMockEngine } from "../utils";
import { VirtualFragment } from "paperclip-utils";

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

    console.log(
      JSON.stringify((result.preview as VirtualFragment).children[0])
    );
    expect(result).to.eql("k");
  });
});
