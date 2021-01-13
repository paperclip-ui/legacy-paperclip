import * as React from "react";
import { expect } from "chai";
import { compileModules } from "./utils";
import * as ez from "enzyme";

import * as Adapter from "enzyme-adapter-react-16";

ez.configure({ adapter: new Adapter() });

describe(__filename + "#", () => {
  [
    [
      "can render a simple module",
      {
        "/entry.pc": `<div export component as="HelloWorld">Hello</div>`
      },
      {
        HelloWorld: {}
      },
      {
        HelloWorld: `<div data-pc-19fba394="true" data-pc-3402f12b="true">Hello</div>`
      }
    ],
    [
      "can render various slots",
      {
        "/entry.pc": `<div export component as="Entry" className="{className} b" className:test="b">
          {message}
        </div>`
      },
      {
        Entry: {
          message: "bbb"
        }
      },
      {
        Entry: `<div data-pc-19fba394="true" data-pc-3402f12b="true" class=" _3402f12b_b b">bbb</div>`
      }
    ],
    [
      "Can include style from other another module",
      {
        "/entry.pc": `
          <import src="/colors.pc" as="colors" />
          <div export component as="Entry" className="$colors.text-red"></div>
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
      {
        Entry: `<div data-pc-6efc9302="true" data-pc-3402f12b="true" class="_b7823a60_text-red text-red"></div>`
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
      {
        Entry: `<div data-pc-6efc9302="true" data-pc-3402f12b="true"><div data-pc-19fba394="true" data-pc-3402f12b="true">b</div></div>`
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
      {
        Entry: `<div data-pc-19fba394="true" data-pc-3402f12b="true" style="color:red"></div>`
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
      {
        Entry: `<div data-pc-19fba394="true" data-pc-3402f12b="true" style="color:red"></div>`
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
      {
        Entry: `<div data-pc-19fba394="true" data-pc-3402f12b="true" style="color:red"></div>`
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
      {
        Entry: `<div data-pc-19fba394="true" data-pc-3402f12b="true" style="color:red"></div>`
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
      {
        Entry: `<div data-pc-19fba394="true" data-pc-3402f12b="true" style="a:red"></div>`
      }
    ],
    [
      "Applies scope classes when class names dynamic string in component",
      {
        "/entry.pc": `
          <div export component as="Entry" className="{className?}">
          </div>
        `
      },
      {
        Entry: {
          className: "ab"
        }
      },
      {
        Entry: `<div data-pc-19fba394="true" data-pc-3402f12b="true" class="_3402f12b_ab ab"></div>`
      }
    ],
    [
      "Applies scope classes when {className?} applied to component",
      {
        "/entry.pc": `
          <div export component as="Entry" {className?}>
          </div>
        `
      },
      {
        Entry: {
          className: "ab"
        }
      },
      {
        Entry: `<div data-pc-19fba394="true" data-pc-3402f12b="true" class="_3402f12b_ab ab"></div>`
      }
    ],
    [
      "Applies scope classes for className={className?} applied to component",
      {
        "/entry.pc": `
          <div export component as="Entry" className={className?}>
          </div>
        `
      },
      {
        Entry: {
          className: "ab"
        }
      },
      {
        Entry: `<div data-pc-19fba394="true" data-pc-3402f12b="true" class="_3402f12b_ab ab"></div>`
      }
    ],
    [
      "Applies scope classes for class={className?} applied to component",
      {
        "/entry.pc": `
          <div export component as="Entry" class={className?}>
          </div>
        `
      },
      {
        Entry: {
          className: "ab"
        }
      },
      {
        Entry: `<div data-pc-19fba394="true" data-pc-3402f12b="true" class="_3402f12b_ab ab"></div>`
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
      {
        Entry: `<span data-pc-6efc9302="true" data-pc-3402f12b="true"><span data-pc-19fba394="true" data-pc-3402f12b="true"></span><h1 data-pc-19fba394="true" data-pc-3402f12b="true"></h1><div data-pc-19fba394="true" data-pc-3402f12b="true"></div></span>`
      }
    ],
    [
      "Can apply scoped styles to component instance",
      {
        "/entry.pc": `

          <div export component as="Test" {className?}>
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
        Entry: {
          tagName: "span",
          tagName2: "h1"
        }
      },
      {
        Entry: `<span data-pc-6efc9302="true" data-pc-3402f12b="true"><div data-pc-19fba394="true" data-pc-3402f12b="true" class="_3402f12b__1c1ab63c _1c1ab63c"></div></span>`
      }
    ],
    [
      "Can apply scoped styles to component instance that already has a class",
      {
        "/entry.pc": `

          <div export component as="Test" {className?}>
          </div>

          <div export component as="Entry">
            <Test className="another-test">
              <style>
                color: blue;
              </style>
            </Test>
          </div>
        `
      },
      {
        Entry: {
          tagName: "span",
          tagName2: "h1"
        }
      },
      {
        Entry: `<span data-pc-6efc9302="true" data-pc-3402f12b="true"><div data-pc-19fba394="true" data-pc-3402f12b="true" class="_3402f12b__3402f12b_another-test another-test _1c1ab63c _3402f12b_another-test another-test _1c1ab63c"></div></span>`
      }
    ],
    [
      "Can apply scoped styles to a instance of instaance of component",
      {
        "/entry.pc": `

          <div export component as="Test" {className?}>
          </div>
          <Test component as="Test2" className="blaaaa {className?}">
            <style>
              color: orange;
            </style>
          </Test>

          <div export component as="Entry">
            <Test2 className="another-test">
              <style>
                color: blue;
              </style>
            </Test2>
          </div>
        `
      },
      {
        Entry: {
          tagName: "span",
          tagName2: "h1"
        }
      },
      {
        Entry: `<span data-pc-f7f5c2b8="true" data-pc-3402f12b="true"><div data-pc-19fba394="true" data-pc-3402f12b="true" class="_3402f12b__3402f12b_blaaaa blaaaa _3402f12b__3402f12b_another-test another-test _1e5c0865 _3402f12b_another-test another-test _1e5c0865 _6efc9302 _3402f12b_blaaaa blaaaa _3402f12b__3402f12b_another-test another-test _1e5c0865 _3402f12b_another-test another-test _1e5c0865 _6efc9302"></div></span>`
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
      {
        Entry: `<div data-pc-6efc9302="true" data-pc-3402f12b="true"><div data-pc-b9b0d72d="true" data-pc-4aa1ff40="true">click me!</div></div>`
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
      {
        Entry: `<div data-pc-19fba394="true" data-pc-3402f12b="true"><span data-pc-98ff9580="true" data-pc-3402f12b="true">A</span><span data-pc-98ff9580="true" data-pc-3402f12b="true">D</span><span data-pc-98ff9580="true" data-pc-3402f12b="true">E</span>0<span data-pc-98ff9580="true" data-pc-3402f12b="true">H</span><span data-pc-98ff9580="true" data-pc-3402f12b="true">I</span><span data-pc-98ff9580="true" data-pc-3402f12b="true">J</span><span data-pc-98ff9580="true" data-pc-3402f12b="true">K</span></div>`
      }
    ]
  ].forEach(([title, graph, contexts, expected]: any) => {
    it(title, async () => {
      const modules = await compileModules(graph);

      const entry = modules["/entry.pc"]();

      for (const componentName in contexts) {
        const Component = entry[componentName];
        const renderedElement = ez.shallow(
          <Component {...contexts[componentName]} />
        );
        expect(renderedElement.html()).to.eql(expected[componentName]);
      }
    });
  });
});
