import { createMockEngine } from "../utils";
import { expect } from "chai";

describe(__filename + "#", () => {
  const cases = [
    [
      "Can inspect a simple node",
      {
        "/entry.pc": `<div>
          <style>
            color: red;
          </style>
        </div>`
      },
      100,
      [0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: "._406d2856._406d2856",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "406d2856",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-1",
                name: "color",
                value: "red",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "Sets inline style at a higher priority than document class",
      {
        "/entry.pc": `
          <style>
            .item {
              color: blue;
            }
          </style>
          <div class="item">
            <style>
              color: red;
            </style>
          </div>
        `
      },
      100,
      [0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: "._376a18c0._376a18c0",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._376a18c0",
                  scope: {
                    kind: "Element",
                    id: "376a18c0"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._376a18c0",
                  scope: {
                    kind: "Element",
                    id: "376a18c0"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "376a18c0",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-6-1",
                name: "color",
                value: "red",
                active: true
              }
            ],
            specificity: 4
          },
          {
            inherited: false,
            selectorText: "[class]._80f4925f_item",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Attribute",
                  value: "[class]"
                },
                {
                  kind: "Class",
                  name: "item",
                  value: "._80f4925f_item",
                  scope: {
                    kind: "Document",
                    id: "80f4925f"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "80f4925f-1-2",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-1",
                name: "color",
                value: "blue",
                active: false
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "Ignores :hover selector",
      {
        "/entry.pc": `
          <div class:hover="hover">
            <style>
              color: red;
              &:hover {
                color: red;
              }
            </style>
          </div>
        `
      },
      100,
      [0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: "._406d2856._406d2856",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "406d2856",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-4-1",
                name: "color",
                value: "red",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "Combo has different specificity than class",
      {
        "/entry.pc": `
          <style>
            .a {
              color: red;
            }
            .a.b {
              color: blue;
            }
          </style>
          <div class="a b" />
        `
      },
      100,
      [0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: "._80f4925f_a._80f4925f_b._80f4925f",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: "a",
                  value: "._80f4925f_a",
                  scope: {
                    kind: "Document",
                    id: "80f4925f"
                  }
                },
                {
                  kind: "Class",
                  name: "b",
                  value: "._80f4925f_b",
                  scope: {
                    kind: "Document",
                    id: "80f4925f"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._80f4925f",
                  scope: {
                    kind: "Document",
                    id: "80f4925f"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "80f4925f-1-5",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-4",
                name: "color",
                value: "blue",
                active: true
              }
            ],
            specificity: 6
          },
          {
            inherited: false,
            selectorText: "[class]._80f4925f_a",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Attribute",
                  value: "[class]"
                },
                {
                  kind: "Class",
                  name: "a",
                  value: "._80f4925f_a",
                  scope: {
                    kind: "Document",
                    id: "80f4925f"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "80f4925f-1-2",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-1",
                name: "color",
                value: "red",
                active: false
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "Can inspect global styles",
      {
        "/entry.pc": `
          <style>
            :global(.a) {
              color: red;
            }
          </style>
          <div class="a b" />
        `
      },
      100,
      [0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: ".a",
            selectorInfo: {
              kind: "Class",
              name: "a",
              value: ".a",
              scope: null
            },
            pseudoElementName: null,
            sourceId: "80f4925f-1-3",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-2",
                name: "color",
                value: "red",
                active: true
              }
            ],
            specificity: 2
          }
        ]
      }
    ],
    [
      "Can inspect a nested media query",
      {
        "/entry.pc": `
          <style>
            
            @media (min-width: 1024px) {
              @media (min-width: 1280px) {
                .a {
                  color: blue;
                }
              }
            }
          </style>
          <div class="a">
          </div>
        `
      },
      1300,
      [0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: "[class]._80f4925f_a",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Attribute",
                  value: "[class]"
                },
                {
                  kind: "Class",
                  name: "a",
                  value: "._80f4925f_a",
                  scope: {
                    kind: "Document",
                    id: "80f4925f"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "80f4925f-1-2",
            sourceUri: "/entry.pc",
            media: {
              conditionText: "(min-width: 1280px)",
              active: false
            },
            declarations: [
              {
                sourceId: "80f4925f-1-1",
                name: "color",
                value: "blue",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "Can inspect imported styles",
      {
        "/entry.pc": `
          <import src="/test.css" inject-styles />
          <div class="a" />
        `,
        "/test.css": `
          .a {
            color: red;
          }
        `
      },
      100,
      [0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: "[class]._pub-b8a55827_a",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Attribute",
                  value: "[class]"
                },
                {
                  kind: "Class",
                  name: "a",
                  value: "._pub-b8a55827_a",
                  scope: {
                    kind: "Document",
                    id: "b8a55827"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "b8a55827-2",
            sourceUri: "/test.css",
            media: null,
            declarations: [
              {
                sourceId: "b8a55827-1",
                name: "color",
                value: "red",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "Inspect captures escaped selectors",
      {
        "/entry.pc": `
          <style>
            .a\\:b\\:c {
              color: red;
            }
          </style>
          <div class="a:b:c">
          </div>
        `
      },
      100,
      [0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: "[class]._80f4925f_a\\:b\\:c",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Attribute",
                  value: "[class]"
                },
                {
                  kind: "Class",
                  name: "a\\:b\\:c",
                  value: "._80f4925f_a\\:b\\:c",
                  scope: {
                    kind: "Document",
                    id: "80f4925f"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "80f4925f-1-2",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-1",
                name: "color",
                value: "red",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "inherits font-family from parent",
      {
        "/entry.pc": `
          <div>
            <style>
              font-family: sans-serif;
            </style>
            <div />
          </div>
        `
      },
      100,
      [0, 0],
      {
        styleRules: [
          {
            inherited: true,
            selectorText: "._406d2856._406d2856",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "406d2856",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-1",
                name: "font-family",
                value: "sans-serif",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "When inherit is declared, then prop is inherited from parent",
      {
        "/entry.pc": `
          <div>
            <style>
              background: blue;
            </style>
            <div>
              <style>
                background: inherit;
              </style>
            </div>
          </div>
        `
      },
      100,
      [0, 0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: "._e9795a6f._e9795a6f",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._e9795a6f",
                  scope: {
                    kind: "Element",
                    id: "e9795a6f"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._e9795a6f",
                  scope: {
                    kind: "Element",
                    id: "e9795a6f"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "e9795a6f",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-3-1",
                name: "background",
                value: "inherit",
                active: true
              }
            ],
            specificity: 4
          },
          {
            inherited: true,
            selectorText: "._406d2856._406d2856",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "406d2856",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-1",
                name: "background",
                value: "blue",
                active: false
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "Skips duplicated inherited styles",
      {
        "/entry.pc": `
          <div>
            <style>
              font-family: sans-serif;
            </style>
            <div>
              <div />
            </div>
          </div>
        `
      },
      100,
      [0, 0, 0],
      {
        styleRules: [
          {
            inherited: true,
            selectorText: "._406d2856._406d2856",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "406d2856",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-1",
                name: "font-family",
                value: "sans-serif",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "&&& and proceeding :within gets declaration value overrides correct",
      {
        "/entry.pc": `
          <div class="test">
            <div>
              <style>
                &&& {
                  ab: red;
                }
                &:within(.test) {
                  ab: blue;
                }
              </style>
            </div>
          </div>
        `
      },
      100,
      [0, 0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText:
              "._9e7e6af9._9e7e6af9._9e7e6af9._9e7e6af9._9e7e6af9._9e7e6af9",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._9e7e6af9",
                  scope: {
                    kind: "Element",
                    id: "9e7e6af9"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._9e7e6af9",
                  scope: {
                    kind: "Element",
                    id: "9e7e6af9"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._9e7e6af9",
                  scope: {
                    kind: "Element",
                    id: "9e7e6af9"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._9e7e6af9",
                  scope: {
                    kind: "Element",
                    id: "9e7e6af9"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._9e7e6af9",
                  scope: {
                    kind: "Element",
                    id: "9e7e6af9"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._9e7e6af9",
                  scope: {
                    kind: "Element",
                    id: "9e7e6af9"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "80f4925f-4-5",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-4-4",
                name: "ab",
                value: "red",
                active: true
              }
            ],
            specificity: 12
          },
          {
            inherited: false,
            selectorText: "[class]._80f4925f_test ._9e7e6af9._9e7e6af9",
            selectorInfo: {
              kind: "Descendent",
              left: {
                kind: "Combo",
                selectors: [
                  {
                    kind: "Attribute",
                    value: "[class]"
                  },
                  {
                    kind: "Class",
                    name: "test",
                    value: "._80f4925f_test",
                    scope: {
                      kind: "Document",
                      id: "80f4925f"
                    }
                  }
                ]
              },
              right: {
                kind: "Combo",
                selectors: [
                  {
                    kind: "Class",
                    name: null,
                    value: "._9e7e6af9",
                    scope: {
                      kind: "Element",
                      id: "9e7e6af9"
                    }
                  },
                  {
                    kind: "Class",
                    name: null,
                    value: "._9e7e6af9",
                    scope: {
                      kind: "Element",
                      id: "9e7e6af9"
                    }
                  }
                ]
              }
            },
            pseudoElementName: null,
            sourceId: "80f4925f-4-9",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-4-8",
                name: "ab",
                value: "blue",
                active: false
              }
            ],
            specificity: 8
          }
        ]
      }
    ],
    [
      "Can inspect styles in slots",
      {
        "/entry.pc": `
          <div component as="Test">
            {show && <div>
              <style>
                color: red;
              </style>
            </div>}
          </div>

          <Test show />
        `
      },
      100,
      [0, 0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: "._3024ebf3._3024ebf3",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._3024ebf3",
                  scope: {
                    kind: "Element",
                    id: "3024ebf3"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._3024ebf3",
                  scope: {
                    kind: "Element",
                    id: "3024ebf3"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "3024ebf3",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "0-00-2-1-1",
                name: "color",
                value: "red",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "Ignores :focus",
      {
        "/entry.pc": `
          <div>
            <style>
              color: red;
              &:focus {
                color: blue;
              }
            </style>
          </div>
        `
      },
      100,
      [0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: "._406d2856._406d2856",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "406d2856",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-1",
                name: "color",
                value: "red",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "parent selectors with css variables are inherited",
      {
        "/entry.pc": `
          <div>
            <style>
              --color: red;
            </style>
            <div />
          </div>
        `
      },
      100,
      [0, 0],
      {
        styleRules: [
          {
            inherited: true,
            selectorText: "._406d2856._406d2856",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._406d2856",
                  scope: {
                    kind: "Element",
                    id: "406d2856"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "406d2856",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-1",
                name: "--color",
                value: "red",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "classes have priority over :root",
      {
        "/entry.pc": `
          <style>
            :global(:root) {
              --color: red;
            }
            :global(.theme) {
              --color: blue;
            }
          </style>
          <div class="theme">
            <div>
              <style>
                color: var(--color);
              </style>
            </div>
          </div>
        `
      },
      100,
      [0, 0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: "._9fbc00ce._9fbc00ce",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._9fbc00ce",
                  scope: {
                    kind: "Element",
                    id: "9fbc00ce"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._9fbc00ce",
                  scope: {
                    kind: "Element",
                    id: "9fbc00ce"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "9fbc00ce",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-6-1",
                name: "color",
                value: "var(--color)",
                active: true
              }
            ],
            specificity: 4
          },
          {
            inherited: true,
            selectorText: ".theme",
            selectorInfo: {
              kind: "Class",
              name: "theme",
              value: ".theme",
              scope: null
            },
            pseudoElementName: null,
            sourceId: "80f4925f-1-6",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-5",
                name: "--color",
                value: "blue",
                active: true
              }
            ],
            specificity: 2
          },
          {
            inherited: true,
            selectorText: ":root",
            selectorInfo: {
              kind: "PseudoElement",
              value: ":root"
            },
            pseudoElementName: null,
            sourceId: "80f4925f-1-3",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-1-2",
                name: "--color",
                value: "red",
                active: false
              }
            ],
            specificity: 1
          }
        ]
      }
    ],
    [
      "Inspects styles for injected classes",
      {
        "/entry.pc": `
          <import src="/atoms.pc" inject-styles />
          <div class="text-small">
            <div>
              <style>
                color: var(--color);
              </style>
            </div>
          </div>
        `,
        "/atoms.pc": `
        <style>
          @export {
            .text-small {
              font-size: 24px;
            }
          }
        </style>
      `
      },
      100,
      [0, 0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: "._9fbc00ce._9fbc00ce",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Class",
                  name: null,
                  value: "._9fbc00ce",
                  scope: {
                    kind: "Element",
                    id: "9fbc00ce"
                  }
                },
                {
                  kind: "Class",
                  name: null,
                  value: "._9fbc00ce",
                  scope: {
                    kind: "Element",
                    id: "9fbc00ce"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "9fbc00ce",
            sourceUri: "/entry.pc",
            media: null,
            declarations: [
              {
                sourceId: "80f4925f-8-1",
                name: "color",
                value: "var(--color)",
                active: true
              }
            ],
            specificity: 4
          },
          {
            inherited: true,
            selectorText: "[class]._pub-230c4d4a_text-small",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Attribute",
                  value: "[class]"
                },
                {
                  kind: "Class",
                  name: "text-small",
                  value: "._pub-230c4d4a_text-small",
                  scope: {
                    kind: "Document",
                    id: "230c4d4a"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "230c4d4a-1-2",
            sourceUri: "/atoms.pc",
            media: null,
            declarations: [
              {
                sourceId: "230c4d4a-1-1",
                name: "font-size",
                value: "24px",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "Returns correct sourceId for included media rule",
      {
        "/entry.pc": `
          <style>
            @mixin mobile {
              @media screen and (max-width: 500px) {
                @content;
              }
            }
            .item {
              @include mobile {
                background: red;
              }
            }
          </style>
          <div class="item" />
        `
      },
      100,
      [0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: "[class]._80f4925f_item",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Attribute",
                  value: "[class]"
                },
                {
                  kind: "Class",
                  name: "item",
                  value: "._80f4925f_item",
                  scope: {
                    kind: "Document",
                    id: "80f4925f"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "80f4925f-1-8",
            sourceUri: "/entry.pc",
            media: {
              conditionText: "screen and (max-width: 500px)",
              active: true
            },
            declarations: [
              {
                sourceId: "80f4925f-1-7",
                name: "background",
                value: "red",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ],
    [
      "Uses annotation information for screen size",
      {
        "/entry.pc": `
          <style>
            @mixin mobile {
              @media screen and (max-width: 500px) {
                @content;
              }
            }
            .item {
              @include mobile {
                background: red;
              }
            }
          </style>
          
          <!-- 
            @frame { width: 600 }
          -->
          <div class="item" />
        `
      },
      100,
      [0],
      {
        styleRules: [
          {
            inherited: false,
            selectorText: "[class]._80f4925f_item",
            selectorInfo: {
              kind: "Combo",
              selectors: [
                {
                  kind: "Attribute",
                  value: "[class]"
                },
                {
                  kind: "Class",
                  name: "item",
                  value: "._80f4925f_item",
                  scope: {
                    kind: "Document",
                    id: "80f4925f"
                  }
                }
              ]
            },
            pseudoElementName: null,
            sourceId: "80f4925f-1-8",
            sourceUri: "/entry.pc",
            media: {
              conditionText: "screen and (max-width: 500px)",
              active: false
            },
            declarations: [
              {
                sourceId: "80f4925f-1-7",
                name: "background",
                value: "red",
                active: true
              }
            ],
            specificity: 4
          }
        ]
      }
    ]
  ] as any;

  for (const [title, graph, screenWidth, path, result] of cases) {
    it(title, async () => {
      const engine = await createMockEngine(graph);
      await engine.open("/entry.pc");
      const inspection = engine.inspectNodeStyles(
        { path, uri: "/entry.pc" },
        screenWidth
      );

      expect(inspection).to.eql(result);
    });
  }
});
