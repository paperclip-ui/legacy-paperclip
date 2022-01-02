export const TEST_SUITE = [
  [
    "can render a simple module",
    {
      "/entry.pc": `<div export component as="HelloWorld">Hello</div>`
    },
    {
      HelloWorld: {}
    },
    {},
    {
      HelloWorld: `<div class="_406d2856 _80f4925f _pub-80f4925f">Hello</div>`
    }
  ],
  [
    "can render various slots",
    {
      "/entry.pc": `<div export component as="Entry" class="{class} b" class:test="c">
          {message}
        </div>`
    },
    {
      Entry: {
        message: "bbb"
      }
    },
    {},
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f  _80f4925f_b _pub-80f4925f_b b">bbb</div>`
    }
  ],
  [
    "Can include style from another module",
    {
      "/entry.pc": `
          <import src="/colors.pc" as="colors" />
          <div export component as="Entry" class="$colors.text-red"></div>
        `,
      "/colors.pc": `
          <style>
            @export {
              .text-red {
                color: red;
              }
            }
          </style>
        `
    },
    {
      Entry: {}
    },
    {},
    {
      Entry: `<div class="_376a18c0 _80f4925f _pub-80f4925f _e05e7926_text-red _pub-e05e7926_text-red text-red"></div>`
    }
  ],
  [
    "Can render a component from within the same document",
    {
      "/entry.pc": `
          <div export component as="Message">{children}</div>
          <div export component as="Entry"><Message>{children}</Message></div>
        `
    },
    {
      Entry: {
        children: "b"
      }
    },
    {},
    {
      Entry: `<div class="_376a18c0 _80f4925f _pub-80f4925f"><div class="_406d2856 _80f4925f _pub-80f4925f">b</div></div>`
    }
  ],
  [
    "Can render styles with the shorthand prop",
    {
      "/entry.pc": `
          <div export component as="Entry" {style?}></div>
        `
    },
    {
      Entry: {
        style: { color: "red" }
      }
    },
    {},
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f" style="color:red"></div>`
    }
  ],
  [
    "Can render styles with the long form prop",
    {
      "/entry.pc": `
          <div export component as="Entry" style={style?}></div>
        `
    },
    {
      Entry: {
        style: { color: "red" }
      }
    },
    {},
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f" style="color:red"></div>`
    }
  ],
  [
    "can render style string",
    {
      "/entry.pc": `
          <div export component as="Entry" style={style?}></div>
        `
    },
    {
      Entry: {
        style: "color: red"
      }
    },
    {},
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f" style="color:red"></div>`
    }
  ],
  [
    "can render a dynamic style string",
    {
      "/entry.pc": `
          <div export component as="Entry" style="color: {color?}"></div>
        `
    },
    {
      Entry: {
        color: "red"
      }
    },
    {},
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f" style="color:red"></div>`
    }
  ],
  [
    "Can render a dynamic string when the value is undefined",
    {
      "/entry.pc": `
          <div export component as="Entry" style="a: {a1}; b: {b2};"></div>
        `
    },
    {
      Entry: {
        a1: "red"
      }
    },
    {},
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f" style="a:red"></div>`
    }
  ],
  [
    "Doesn't apply scoped classes when dynamic string applied to component",
    {
      "/entry.pc": `
          <div export component as="Entry" class="{className?}">
          </div>
        `
    },
    {
      Entry: {
        className: "ab"
      }
    },
    {},
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f ab"></div>`
    }
  ],
  [
    "Can change the tag name of a component",
    {
      "/entry.pc": `

          <div export component as="Test" {tagName?}>
          </div>

          <div export component as="Entry">
            <Test {tagName?} />
            <Test tagName={tagName2?} />
            <Test tagName={tagName3?} />
          </div>
        `
    },
    {
      Entry: {
        tagName: "span",
        tagName2: "h1"
      }
    },
    {},
    {
      Entry: `<div class="_376a18c0 _80f4925f _pub-80f4925f"><span class="_406d2856 _80f4925f _pub-80f4925f"></span><h1 class="_406d2856 _80f4925f _pub-80f4925f"></h1><div class="_406d2856 _80f4925f _pub-80f4925f"></div></div>`
    }
  ],
  [
    "Can apply scoped styles to component instance",
    {
      "/entry.pc": `

          <div export component as="Test" {class?}>
          </div>

          <div export component as="Entry">
            <Test>
              <style>
                color: blue;
              </style>
            </Test>
          </div>
        `
    },
    {
      Entry: {}
    },
    {},
    {
      Entry: `<div class="_376a18c0 _80f4925f _pub-80f4925f"><div class="_406d2856 _80f4925f _pub-80f4925f _9fbc00ce"></div></div>`
    }
  ],
  // [
  //   "Can apply scoped styles to component instance that already has a class",
  //   {
  //     "/entry.pc": `

  //       <div export component as="Test" {className?}>
  //       </div>

  //       <div export component as="Entry">
  //         <Test className="another-test">
  //           <style>
  //             color: blue;
  //           </style>
  //         </Test>
  //       </div>
  //     `
  //   },
  //   {
  //     Entry: {}
  //   },
  //   {
  //     Entry: `<div class="_376a18c0 _80f4925f _pub-80f4925f"><div class="_406d2856 _80f4925f _pub-80f4925f _80f4925f_another-test _pub-80f4925f_another-test another-test _80f4925f__9fbc00ce _pub-80f4925f__9fbc00ce _9fbc00ce"></div></div>`
  //   }
  // ],

  // class names need to be made _explicit_. A DX problem with this is where we're passing
  // class names within the same doc - the developer needs to prefix with $ in this case. The reason for this
  // is to ensure that class names _outside_ of the doc aren't accidentally triggering class names within this doc, especially
  // for JSX.
  [
    "class names applied in the same doc aren't prefixed with scope",
    {
      "/entry.pc": `

          <div export component as="Test" class={class?}>
          </div>

          <div export component as="Entry">
            <Test class="another-test">
              <style>
                color: blue;
              </style>
            </Test>
          </div>
        `
    },
    {
      Entry: {}
    },
    {},
    {
      Entry: `<div class="_376a18c0 _80f4925f _pub-80f4925f"><div class="_406d2856 _80f4925f _pub-80f4925f _9fbc00ce another-test"></div></div>`
    }
  ],
  [
    "Can apply scoped styles to a instance of instaance of component",
    {
      "/entry.pc": `

          <div export component as="Test" {class?}>
          </div>

          <Test component as="Test2" class="blaaaa {class?}">
            <style>
              color: orange;
            </style>
          </Test>

          <div export component as="Entry">
            <Test2 class="$another-test">
              <style>
                color: blue;
              </style>
            </Test2>
          </div>
        `
    },

    {
      Entry: {}
    },
    {},
    {
      Entry: `<div class="_ae63497a _80f4925f _pub-80f4925f"><div class="_406d2856 _80f4925f _pub-80f4925f _376a18c0 blaaaa  _9dfabe97 _80f4925f_another-test _pub-80f4925f_another-test another-test"></div></div>`
    }
  ],
  [
    "Can import elements that are used in slots",
    {
      "/entry.pc": `
          <import src="/button.pc" as="Button" />
          <div export component as="Test">
            {something}
          </div>

          <Test export component as="Entry" something={<Button.Button />} />
        `,
      "/button.pc": `
          <div export component as="Button">click me!</div>
        `
    },
    {
      Entry: {}
    },
    {},
    {
      Entry: `<div class="_376a18c0 _80f4925f _pub-80f4925f"><div class="_348c8067 _1d7dbc06 _pub-1d7dbc06">click me!</div></div>`
    }
  ],
  [
    "Can render nodes with &&, !, and ||",
    {
      "/entry.pc": `
          <div export component as="Entry">
            {show && <span>A</span>}
            {!show && <span>B</span>}
            {false && <span>C</span>}
            {!false && <span>D</span>}
            {true && <span>E</span>}
            {0 && <span>F</span>}
            {0 && <span>G</span> || <span>H</span>}
            {false || <span>I</span>}
            {!!show && <span>J</span>}
            {(1 || 2) && <span>K</span>}
            
          </div>
        `
    },
    {
      Entry: {
        show: true
      }
    },
    {},
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f"><span class="_3024ebf3 _80f4925f _pub-80f4925f">A</span><span class="_1b09b830 _80f4925f _pub-80f4925f">D</span><span class="_54482ef7 _80f4925f _pub-80f4925f">E</span>0<span class="_667e4c75 _80f4925f _pub-80f4925f">H</span><span class="_7f657d34 _80f4925f _pub-80f4925f">I</span><span class="_f8fd61fb _80f4925f _pub-80f4925f">J</span><span class="_e1e650ba _80f4925f _pub-80f4925f">K</span></div>`
    }
  ],
  [
    "Can render && and || in attribute",
    {
      "/entry.pc": `
          <div export component as="Entry" data-a={b || "test"} c={d && "d" || "e"}>
          </div>

          <div export component as="Test">
            <Entry />
            <Entry a />
            <Entry d />
            <Entry b />
          </div>
        `
    },
    {
      Test: {}
    },
    {},
    {
      Test: `<div class="_376a18c0 _80f4925f _pub-80f4925f"><div class="_406d2856 _80f4925f _pub-80f4925f" data-a="test" c="e"></div><div class="_406d2856 _80f4925f _pub-80f4925f" data-a="test" c="e"></div><div class="_406d2856 _80f4925f _pub-80f4925f" data-a="test" c="d"></div><div class="_406d2856 _80f4925f _pub-80f4925f" data-a="true" c="e"></div></div>`
    }
  ],
  [
    "Maintains attribute casing",
    {
      "/entry.pc": `
          <div export component as="Entry" allow-1password="no">
          </div>
        `
    },
    {
      Entry: {}
    },
    {},
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f" allow-1password="no"></div>`
    }
  ],
  [
    "Cannot change tag name if tagName isn't present",
    {
      "/entry.pc": `
          <div export component as="Entry">
          </div>
        `
    },
    {
      Entry: {
        tagName: "test"
      }
    },
    {},
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f"></div>`
    }
  ],
  [
    "inject-style prop works",
    {
      "/entry.pc": `
          <import src="/module.pc" inject-styles />
          <div export component as="Entry" class="abb">
          </div>
        `,
      "/module.pc": `
        `
    },
    {
      Entry: {
        tagName: "test"
      }
    },
    {},
    {
      Entry: `<div class="_376a18c0 _80f4925f _pub-80f4925f _pub-139cec8e _80f4925f_abb _pub-80f4925f_abb _pub-139cec8e_abb abb"></div>`
    }
  ],
  [
    "explicit reference doesn't get mixed with injected scopes",
    {
      "/entry.pc": `
          <import src="/a.pc" inject-styles />
          <import src="/b.pc" as="b" />
          <div export component as="Entry" class="$b.test blah">
          </div>
        `,
      "/a.pc": `
        `,
      "/b.pc": `
          <style>
            @export {
              .test {
                color: red;
              }
            }
          </style>
        `
    },
    {
      Entry: {
        tagName: "test"
      }
    },
    {},
    {
      Entry: `<div class="_ae63497a _80f4925f _pub-80f4925f _pub-98523c41 _8ae793af_test _pub-8ae793af_test test  _80f4925f_blah _pub-80f4925f_blah _pub-98523c41_blah blah"></div>`
    }
  ],
  [
    "Can reference injected classes within class variants",
    {
      "/entry.pc": `
          <import src="/a.pc" inject-styles />
          <div export component as="Entry" class="a" class:test="test">
          </div>
        `,
      "/a.pc": `
          <style>
            @export {
              .test {
                color: red;
              }
            }
          </style>
        `
    },
    {
      Entry: {
        test: true
      }
    },
    {},
    {
      Entry: `<div class="_376a18c0 _80f4925f _pub-80f4925f _pub-98523c41 _80f4925f_a _pub-80f4925f_a _pub-98523c41_a a _80f4925f_test _pub-80f4925f_test _pub-98523c41_test test"></div>`
    }
  ],
  [
    "Can render an import within a block",
    {
      "/entry.pc": `
          <import src="/module.pc" as="mod" />
          <div export component as="Entry">
            {<mod.Test />}
            {a && <mod.Test />}
            {!b? && <mod.Test />}
          </div>
        `,
      "/module.pc": `
          <div export component as="Test">Hello</div>
        `,
      "/a.pc": `
          <style>
            @export {
              .test {
                color: red;
              }
            }
          </style>
        `
    },
    {
      Entry: {
        a: true,
        b: false
      }
    },
    {},
    {
      Entry: `<div class="_376a18c0 _80f4925f _pub-80f4925f"><div class="_bf0b262 _139cec8e _pub-139cec8e">Hello</div><div class="_bf0b262 _139cec8e _pub-139cec8e">Hello</div><div class="_bf0b262 _139cec8e _pub-139cec8e">Hello</div></div>`
    }
  ],
  [
    "Can define styles on component with prop bound class and no class binding",
    {
      "/entry.pc": `
          <div export component as="Entry" class:active="active">
            <style>
              color: red;
            </style>
          </div>
        `
    },
    {
      Entry: {
        a: true,
        b: false
      }
    },
    {},
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f"></div>`
    }
  ],
  [
    "Can pass propery bound attributes to components",
    {
      "/entry.pc": `
          <div component as="Test" {class?}>
            <style>
              color: blue;
            </style>
          </div>
          <Test export component as="Entry" class:active="$active">
            <style>
              color: red;
            </style>
          </Test>
        `
    },
    {
      Entry: {
        active: true
      }
    },
    {},
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f _376a18c0 _80f4925f_active _pub-80f4925f_active active"></div>`
    }
  ],
  [
    "Can render a fragment",
    {
      "/entry.pc": `
          <fragment component as="Test">
            <span>{children}!</span>
            <br />
          </fragment>
          <Test export component as="Entry">Hello!</Test>
        `
    },
    {
      Entry: {
        active: true
      }
    },
    {},
    {
      Entry: `<span class="_9e7e6af9 _80f4925f _pub-80f4925f">Hello!!</span><br class="_e9795a6f _80f4925f _pub-80f4925f"/>`
    }
  ],
  [
    "Can change tagName of fragment",
    {
      "/entry.pc": `
          <fragment component as="Test" {tagName?}>
            <span>{children}!</span>
            <br />
          </fragment>
          <Test export component as="Entry" tagName="div">Hello!</Test>
        `
    },
    {
      Entry: {
        active: true
      }
    },
    {},
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f"><span class="_9e7e6af9 _80f4925f _pub-80f4925f">Hello!!</span><br class="_e9795a6f _80f4925f _pub-80f4925f"/></div>`
    }
  ],
  [
    "Can define class on fragment if tagname is changed",
    {
      "/entry.pc": `
          <fragment component as="Test" {tagName?} {class?}>
            {children}
          </fragment>
          <Test export component as="Entry" tagName="div" class="blah">Hello!</Test>
        `
    },
    {
      Entry: {
        active: true
      }
    },
    {},
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f _376a18c0 blah">Hello!</div>`
    }
  ],
  [
    "Can render default component",
    {
      "/entry.pc": `
          <import src="/test.pc" as="test" />
          <test export component as="Entry">ok</test>
        `,
      "/test.pc": `
          <div export component as="default">{children}!</div>
        `
    },
    {
      Entry: {
        active: true
      }
    },
    {},
    {
      Entry: `<div class="_d754a2e6 _6bcf0994 _pub-6bcf0994">ok!</div>`
    }
  ],
  [
    "Can embed assets",
    {
      "/entry.pc": `
          <img export component as="Entry" src="/test.svg"></img>
        `,
      "/test.svg": "aa"
    },
    {
      Entry: {
        active: true
      }
    },
    {
      compilerOptions: {
        importAssetsAsModules: true
      }
    },
    {
      Entry: `<img class="_406d2856 _80f4925f _pub-80f4925f" src="aa"/>`
    }
  ],
  [
    "Leaves src as-is if importAssetsAsModules is undefined",
    {
      "/entry.pc": `
          <img export component as="Entry" src="/test.svg"></img>
        `,
      "/test.svg": "aa"
    },
    {
      Entry: {
        active: true
      }
    },
    {
      compilerOptions: {}
    },
    {
      Entry: `<img class="_406d2856 _80f4925f _pub-80f4925f" src="/test.svg"/>`
    }
  ],
  [
    "Does not import asset if src is of instance",
    {
      "/entry.pc": `
          <img export component as="Test" {src?}></img>
          <Test export component as="Entry" src="/test.svg" />
        `,
      "/test.svg": "aa"
    },
    {
      Entry: {
        active: true
      }
    },
    {
      compilerOptions: {
        importAssetsAsModules: true
      }
    },
    {
      Entry: `<img class="_406d2856 _80f4925f _pub-80f4925f" src="/test.svg"/>`
    }
  ],
  [
    "Can render default components within the same doc",
    {
      "/entry.pc": `
          <div component as="default">Hello</div>
          <default export component as="Entry" />
        `,
      "/test.svg": "aa"
    },
    {
      Entry: {
        active: true
      }
    },
    {
      compilerOptions: {
        importAssetsAsModules: true
      }
    },
    {
      Entry: `<div class="_406d2856 _80f4925f _pub-80f4925f">Hello</div>`
    }
  ]
];
