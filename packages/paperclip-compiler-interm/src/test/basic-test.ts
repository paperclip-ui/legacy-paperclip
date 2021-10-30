import { expect } from "chai";
import { EngineDelegate } from "paperclip";
import { createMockEngine } from "paperclip/lib/test/utils";
import { IntermediateCompiler } from "..";

/*

TODOs:

- import module
- dynamic attributes on non-components
- filter out imports
*/

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
      imports: [],
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
  ],
  [
    `Translates basic attributes`,
    {
      "/entry.pc": `
        <div export component as="Test" a="b">
        </div>
      `
    },
    {
      imports: [],
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
              pos: 62,
              line: 3,
              column: 15
            }
          },
          kind: "Component",
          attributes: [
            {
              name: "a",
              variants: [
                {
                  parts: [
                    {
                      kind: "Static",
                      value: "b",
                      range: {
                        start: {
                          pos: 44,
                          line: 2,
                          column: 44
                        },
                        end: {
                          pos: 45,
                          line: 2,
                          column: 45
                        }
                      }
                    }
                  ],
                  range: {
                    start: {
                      pos: 41,
                      line: 2,
                      column: 41
                    },
                    end: {
                      pos: 46,
                      line: 2,
                      column: 46
                    }
                  },
                  variantName: null
                }
              ]
            }
          ],
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
    console.log(JSON.stringify(module, null, 2));
    expect(module).to.be.eql(output);
  });
});
