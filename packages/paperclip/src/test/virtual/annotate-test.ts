import { createMockEngine } from "../utils";
import { expect } from "chai";
import { Comment, computeVirtScriptObject, Fragment } from "paperclip-utils";
import { EngineMode } from "../../core";

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
    const result = engine.open("/entry.pc");
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
    const result = engine.open("/entry.pc");

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
    const result = engine.open("/entry.pc");

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
    const result = await engine.open("/entry.pc");

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

    const result2 = await engine.open("/entry.pc");
    expect(
      (result2 as any).preview.children[0].annotations.values.frame.value
    ).to.eql("b");
  });

  it("Can have multiple annotations", async () => {
    const graph = {
      "/entry.pc": `
        <!--
        @frame { title: "Preview", width: 1024, height: 768, x: -1145, y: -28 }
        @tags { a: "b"}
        -->
        <span as="Test">
          Hello
        </span>


        <Test />
      `
    };

    const engine = await createMockEngine(graph);
    const result = engine.open("/entry.pc");

    const metadata = computeVirtScriptObject(
      (result as any).preview.children[0].annotations
    );

    expect(metadata).to.eql({
      tags: { a: "b" },
      frame: { x: -1145, y: -28, title: "Preview", width: 1024, height: 768 }
    });
  });

  it("Does not render invisible component frames", async () => {
    const graph = {
      "/entry.pc": `
        <!--
          @frame { visible: false }
        -->

        <span component as="Test">
          Hello
        </span>


        <Test />
      `
    };

    const engine = await createMockEngine(
      graph,
      null,
      {},
      EngineMode.MultiFrame
    );
    const result = engine.open("/entry.pc");

    expect((result as any).preview.children.length).to.eql(1);
  });
  it("Does not render invisible element frames", async () => {
    const graph = {
      "/entry.pc": `
        <!--
        @frame { visible: false }
        -->
        <span component as="Test">
          Hello
        </span>


        <div />
      `
    };

    const engine = await createMockEngine(
      graph,
      null,
      {},
      EngineMode.MultiFrame
    );
    const result = engine.open("/entry.pc");

    expect((result as any).preview.children.length).to.eql(1);
  });
  it("Does not render invisible text elements", async () => {
    const graph = {
      "/entry.pc": `

        <!--
        @frame { visible: false }
        -->
        <span component as="Test">
          Hello
        </span>


        <div />

        <!--
        @frame { visible: false }
        -->

        
      `
    };

    const engine = await createMockEngine(
      graph,
      null,
      {},
      EngineMode.MultiFrame
    );
    const result = engine.open("/entry.pc");

    expect((result as any).preview.children.length).to.eql(1);
  });

  it("Can escape @ signs", async () => {
    const graph = {
      "/entry.pc": `

        <!--\\@frame-->
        <span component as="Test">
          Hello
        </span>
        
      `
    };

    const engine = await createMockEngine(
      graph,
      null,
      {},
      EngineMode.MultiFrame
    );
    engine.open("/entry.pc");
    const ast = engine.getLoadedAst("/entry.pc") as Fragment;
    expect((ast.children[0] as Comment).annotation.properties).to.eql([
      {
        kind: "Text",
        raws: { before: "", after: "" },
        value: "\\@frame",
        range: {
          start: { pos: 14, line: 3, column: 13 },
          end: { pos: 21, line: 3, column: 20 }
        }
      }
    ]);
  });

  it("Can comment out HTML comments", async () => {
    const graph = {
      "/entry.pc": `

        <!--span component as="Test">
        Hello
      </span-->
        <span component as="Test">
          Hello
        </span>
        
      `
    };

    const engine = await createMockEngine(
      graph,
      null,
      {},
      EngineMode.MultiFrame
    );
    engine.open("/entry.pc");
    const ast = engine.getLoadedAst("/entry.pc") as Fragment;
    expect((ast.children[0] as Comment).annotation.properties).to.eql([
      {
        kind: "Text",
        raws: { before: "", after: "" },
        value: 'span component as="Test">\n        Hello\n      </span',
        range: {
          start: { pos: 14, line: 3, column: 13 },
          end: { pos: 66, line: 5, column: 13 }
        }
      }
    ]);
  });
});
