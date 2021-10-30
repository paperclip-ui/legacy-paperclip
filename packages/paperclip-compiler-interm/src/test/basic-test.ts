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
    `Translates static attributes`,
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
  ],
  [
    `Translates variant attributes`,
    {
      "/entry.pc": `
        <div export component as="Test" a:b="c">
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
              pos: 64,
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
                  range: {
                    start: {
                      pos: 41,
                      line: 2,
                      column: 41
                    },
                    end: {
                      pos: 48,
                      line: 2,
                      column: 48
                    }
                  },
                  variantName: "b",
                  parts: [
                    {
                      kind: "Static",
                      value: "c",
                      range: {
                        start: {
                          pos: 46,
                          line: 2,
                          column: 46
                        },
                        end: {
                          pos: 47,
                          line: 2,
                          column: 47
                        }
                      }
                    }
                  ]
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
  ],
  [
    `If attributes same the same variant name, the first one will be overridden`,
    {
      "/entry.pc": `
        <div export component as="Test" a="a" a="b" a:b="c" a:b="c2">
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
              pos: 85,
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
                  range: {
                    start: {
                      pos: 47,
                      line: 2,
                      column: 47
                    },
                    end: {
                      pos: 52,
                      line: 2,
                      column: 52
                    }
                  },
                  variantName: null,
                  parts: [
                    {
                      kind: "Static",
                      value: "b",
                      range: {
                        start: {
                          pos: 50,
                          line: 2,
                          column: 50
                        },
                        end: {
                          pos: 51,
                          line: 2,
                          column: 51
                        }
                      }
                    }
                  ]
                },
                {
                  range: {
                    start: {
                      pos: 61,
                      line: 2,
                      column: 61
                    },
                    end: {
                      pos: 69,
                      line: 2,
                      column: 69
                    }
                  },
                  variantName: "b",
                  parts: [
                    {
                      kind: "Static",
                      value: "c2",
                      range: {
                        start: {
                          pos: 66,
                          line: 2,
                          column: 66
                        },
                        end: {
                          pos: 68,
                          line: 2,
                          column: 68
                        }
                      }
                    }
                  ]
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
    // console.log(JSON.stringify(module, null, 2));
    expect(module).to.be.eql(output);
  });
});
