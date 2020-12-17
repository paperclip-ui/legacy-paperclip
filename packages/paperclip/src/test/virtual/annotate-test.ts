import { VirtJsObject, VirtualElement, VirtualFragment } from "paperclip-utils";
import { createMockEngine } from "../utils";
import { expect } from "chai";

describe(__filename + "#", () => {
  it("can parse a @desc", async () => {
    const graph = {
      "/entry.pc": `
        <!--
          @desc "some description"
        -->
        <div />

        <!--
          okay
        -->

        something
      `
    };
    const engine = await createMockEngine(graph);
    const result = engine.run("/entry.pc");
    expect(
      (result as any).preview.children[0].annotations.values.desc.value
    ).to.eql("some description");
  });

  xit("can parse an object", async () => {
    const graph = {
      "/entry.pc": `
        <!--
          @frame {width: 100, height: 100}
        -->

        <div />
      `
    };
  });

  xit("can parse an array", async () => {
    const graph = {
      "/entry.pc": `
        <!--
          @tags ["a", "b", "c"]
        -->

        <div />
      `
    };
  });
});
