var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function(resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { createEngine, infer } from "../../..";
import { expect } from "chai";
describe(__filename + "#", () =>
  __awaiter(void 0, void 0, void 0, function*() {
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
    const engine = yield createEngine({});
    for (const [source, inference] of cases) {
      it(`can infer ${source}`, () => {
        const ast = engine.parseContent(String(source));
        expect(infer(ast)).to.eql(inference);
      });
    }
  })
);
