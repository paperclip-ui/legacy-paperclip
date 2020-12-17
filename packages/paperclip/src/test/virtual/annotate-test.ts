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

  it(`Can add metadata to an instance`, async () => {
    const graph = {
      "/entry.pc": `
        <span component as="Test">
          Hello
        </span>

        <!--
          @desc "abc"
        -->

        <Test />
      `
    };

    const engine = await createMockEngine(graph);
    const result = engine.run("/entry.pc");

    expect(
      (result as any).preview.children[0].annotations.values.desc.value
    ).to.eql("abc");
  });

  it(`Can add metadata to an imported instance`, async () => {
    const graph = {
      "/entry.pc": `
        <import src="/module.pc" as="mod" />

        <!--
          @desc "abc"
        -->

        <mod.Test />
      `,
      "/module.pc": `
        <span export component as="Test">
          Hello
        </span>
      `
    };

    const engine = await createMockEngine(graph);
    const result = engine.run("/entry.pc");

    expect(
      (result as any).preview.children[0].annotations.values.desc.value
    ).to.eql("abc");
  });
});
