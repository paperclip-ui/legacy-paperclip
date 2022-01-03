import * as React from "react";
import { expect } from "chai";
import { compile } from "..";
import * as ez from "enzyme";

import * as Adapter from "enzyme-adapter-react-16";
import {
  TEST_SUITE,
  compileModules
} from "paperclip-compiler-base-jsx/lib/test";

ez.configure({ adapter: new Adapter() });

describe(__filename + "#", () => {
  TEST_SUITE.forEach(([title, graph, contexts, config, expected]: any) => {
    it(title, async () => {
      const modules = await compileModules(compile, {
        react: React
      })(graph, config);

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
