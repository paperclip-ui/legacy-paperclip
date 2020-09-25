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
        HelloWorld: `<div data-pc-ff04cdb7="true" data-pc-3402f12b="true">Hello</div>`
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
        Entry: `<div data-pc-f63ae49a="true" data-pc-3402f12b="true" class=" _3402f12b_b b">bbb</div>`
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
        Entry: `<div data-pc-b70e3da="true" data-pc-3402f12b="true" class="_b7823a60_text-red text-red"></div>`
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
        Entry: `<div data-pc-c4982d55="true" data-pc-3402f12b="true"><div data-pc-76c025ae="true" data-pc-3402f12b="true">b</div></div>`
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
        Entry: `<div data-pc-ca3fafe5="true" data-pc-3402f12b="true" style="color:red"></div>`
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
        Entry: `<div data-pc-e8a4b00d="true" data-pc-3402f12b="true" style="color:red"></div>`
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
        Entry: `<div data-pc-e8a4b00d="true" data-pc-3402f12b="true" style="color:red"></div>`
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
        Entry: `<div data-pc-86b8b1da="true" data-pc-3402f12b="true" style="color:red"></div>`
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
        Entry: `<div data-pc-68b6d0f6="true" data-pc-3402f12b="true" style="a:red"></div>`
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
        Entry: `<div data-pc-ef2ecc39="true" data-pc-3402f12b="true" class="_3402f12b_ab ab"></div>`
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
        Entry: `<div data-pc-86b8b1da="true" data-pc-3402f12b="true" class="_3402f12b_ab ab"></div>`
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
        Entry: `<div data-pc-120ad15="true" data-pc-3402f12b="true" class="_3402f12b_ab ab"></div>`
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
        Entry: `<div data-pc-64d690c="true" data-pc-3402f12b="true" class="_3402f12b_ab ab"></div>`
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
        Entry: `<span data-pc-a08584c0="true" data-pc-3402f12b="true"><span data-pc-6d9daab6="true" data-pc-3402f12b="true"></span><h1 data-pc-6d9daab6="true" data-pc-3402f12b="true"></h1><div data-pc-6d9daab6="true" data-pc-3402f12b="true"></div></span>`
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
        Entry: `<span data-pc-7d8b7cdd="true" data-pc-3402f12b="true"><div data-pc-84fe0f83="true" data-pc-3402f12b="true" class="_3402f12b__f347d198 _f347d198"></div></span>`
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
        Entry: `<span data-pc-281753a3="true" data-pc-3402f12b="true"><div data-pc-84fe0f83="true" data-pc-3402f12b="true" class="_3402f12b__3402f12b_another-test another-test _d5778291 _3402f12b_another-test another-test _d5778291"></div></span>`
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
        Entry: `<span data-pc-f76f97d="true" data-pc-3402f12b="true"><div data-pc-84fe0f83="true" data-pc-3402f12b="true" class="_3402f12b__3402f12b_blaaaa blaaaa _3402f12b__3402f12b_another-test another-test _d3bb99a3 _3402f12b_another-test another-test _d3bb99a3 _b7ad9c7c _3402f12b_blaaaa blaaaa _3402f12b__3402f12b_another-test another-test _d3bb99a3 _3402f12b_another-test another-test _d3bb99a3 _b7ad9c7c"></div></span>`
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
