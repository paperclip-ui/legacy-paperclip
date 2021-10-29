import { expect } from "chai";
import { EngineDelegate } from "paperclip";
import { createMockEngine } from "paperclip/lib/test/utils";
import { IntermediateCompiler } from "..";

[
  [
    `It can compile a simple PC template`,
    {
      "/entry.pc": `
        <div export component as="Test">
        </div>
      `
    },
    {
      components: [
        {
          tagName: "div",
          as: "Test",
          exported: true,
          range: {
            start: {
              pos: 9,
              line: 2,
              column: 9
            },
            end: {
              pos: 56,
              line: 3,
              column: 15
            }
          },
          kind: "Component",
          attributes: [],
          children: []
        }
      ],
      css: {
        sheetText: "",
        exports: null
      },
      assets: []
    }
  ]
].forEach(([title, source, output]: any) => {
  it(title, () => {
    const engine: EngineDelegate = createMockEngine(source);
    const compiler = new IntermediateCompiler(engine);
    const module = compiler.parseFile("/entry.pc");
    expect(module).to.eql(output);
  });
});
