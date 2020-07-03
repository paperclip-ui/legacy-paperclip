import { Engine, infer, Inference, InferenceKind, ShapeInference } from "../..";
import { expect } from "chai";

describe(__filename + "#", () => {
  const cases = [
    [
      `{a}`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          a: {
            optional: false,
            value: {
              kind: 2
            }
          }
        }
      }
    ],
    [
      `{a.b}`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          a: {
            optional: false,
            value: {
              kind: 0,
              fromSpread: false,
              properties: {
                b: {
                  optional: false,
                  value: {
                    kind: 2
                  }
                }
              }
            }
          }
        }
      }
    ],
    [
      `{{a, b, c: [d, {e, f: b.d}]}}`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          a: {
            optional: false,
            value: {
              kind: 2
            }
          },
          b: {
            optional: false,
            value: {
              kind: 0,
              fromSpread: false,
              properties: {
                d: {
                  optional: false,
                  value: {
                    kind: 2
                  }
                }
              }
            }
          },
          d: {
            optional: false,
            value: {
              kind: 2
            }
          },
          e: {
            optional: false,
            value: {
              kind: 2
            }
          }
        }
      }
    ],
    [
      `{a.b} {a.c}`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          a: {
            optional: false,
            value: {
              kind: 0,
              fromSpread: false,
              properties: {
                b: {
                  optional: false,
                  value: {
                    kind: 2
                  }
                },
                c: {
                  optional: false,
                  value: {
                    kind: 2
                  }
                }
              }
            }
          }
        }
      }
    ],
    [
      `<span {a}></span>`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          a: {
            optional: false,
            value: {
              kind: 2
            }
          }
        }
      }
    ],
    [
      `<span a={a}></span>`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          a: {
            optional: false,
            value: {
              kind: 2
            }
          }
        }
      }
    ],
    [
      `<span {...a}></span>`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          a: {
            optional: false,
            value: {
              kind: 0,
              fromSpread: true,
              properties: {}
            }
          }
        }
      }
    ],
    [
      `{#each items as item}{/}`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          items: {
            optional: false,
            value: {
              kind: 1,
              value: {
                kind: 2
              }
            }
          }
        }
      }
    ],
    [
      `{#if a}{/}`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          a: {
            optional: false,
            value: {
              kind: 2
            }
          }
        }
      }
    ],
    [
      `{#if a}{/else if b} {/}`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          a: {
            optional: false,
            value: {
              kind: 2
            }
          },
          b: {
            optional: false,
            value: {
              kind: 2
            }
          }
        }
      }
    ],
    [
      `{#if true}{cc} {/}`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          cc: {
            optional: false,
            value: {
              kind: 2
            }
          }
        }
      }
    ],
    [
      `<div a={<div>{a}</div>}></div>`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          a: {
            optional: false,
            value: {
              kind: 2
            }
          }
        }
      }
    ],
    [
      `<div component as="a">
        {a}
      </div>{b}`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          a: {
            optional: false,
            value: {
              kind: 2
            }
          },
          b: {
            optional: false,
            value: {
              kind: 2
            }
          }
        }
      }
    ],
    [
      `<div component as="a" class:test>
      </div>`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          test: {
            optional: true,
            value: {
              kind: 2
            }
          }
        }
      }
    ],
    [
      `<div component as="a" class:test>
        {test}
      </div>`,
      {
        kind: 0,
        fromSpread: false,
        properties: {
          test: {
            optional: false,
            value: {
              kind: 2
            }
          }
        }
      }
    ]
  ];

  const engine = new Engine({}, () => {});
  for (const [source, inference] of cases) {
    it(`can infer ${source}`, () => {
      const ast = engine.parseContent(String(source));
      expect(infer(ast)).to.eql(inference);
    });
  }
});
