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
        "/entry.pc": `<div>
          <style>
            @export {
              .a {
                color: red;
              }
            }
            .b {
              color: blue;
            }
          </style>
        </div>`
      },
      { a: "_pub-80f4925f_a" }
    ]
  ].forEach(([title, graph, expectedCSS]: any) => {
    it(title, async () => {
      const modules = await compileModules(graph, {
        srcDir: null,
        compilerOptions: {
          outDir: null
        }
      });

      const entry = modules["/entry.pc"]();

      expect(entry.classNames).to.eql(expectedCSS);
    });
  });
});