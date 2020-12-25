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

  it(`properly updates annotations`, async () => {
    const graph = {
      "/entry.pc": `
        <!--
          @frame "a"
        -->
        hello
      `
    };

    const engine = await createMockEngine(graph);
    const result = await engine.run("/entry.pc");

    expect(
      (result as any).preview.children[0].annotations.values.frame.value
    ).to.eql("a");

    engine.updateVirtualFileContent(
      "/entry.pc",
      `
    <!--
      @frame "b"
    -->
    hello
  `
    );

    const result2 = await engine.run("/entry.pc");
    expect(
      (result2 as any).preview.children[0].annotations.values.frame.value
    ).to.eql("b");
  });
});
