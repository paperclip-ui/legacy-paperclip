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
        HelloWorld: `<div data-pc-3402f12b="true">Hello</div>`
      }
    ],
    [
      "can render various slots",
      {
        "/entry.pc": `<div export component as="Entry" className="{className} b" className:test>
          {message}
        </div>`
      },
      {
        Entry: {
          message: "bbb"
        }
      },
      {
        Entry: `<div data-pc-3402f12b="true" class="undefined _3402f12b_b b">bbb</div>`
      }
    ],
    [
      "Can include style from other another module",
      {
        "/entry.pc": `
          <import src="/colors.pc" as="colors">
          <div export component as="Entry" className=">>>colors.text-red"></div>
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
        Entry: `<div data-pc-3402f12b="true" class="_b7823a60_text-red text-red"></div>`
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
        Entry: `<div data-pc-3402f12b="true"><div data-pc-3402f12b="true">b</div></div>`
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
        Entry: `<div data-pc-3402f12b="true" style="color:red"></div>`
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
