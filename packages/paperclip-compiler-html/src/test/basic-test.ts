import * as React from "react";
import { expect } from "chai";
import { compile } from "../code-compiler";
import {
  TEST_SUITE,
  compileModules
} from "paperclip-compiler-base-jsx/lib/test";

describe(__filename + "#", () => {
  TEST_SUITE.forEach(([title, graph, contexts, config, expected]: any) => {
    it(title, async () => {
      const modules = await compileModules(compile, {
        react: React
      })(graph, config);

      const entry = modules["/entry.pc"]();

      for (const componentName in contexts) {
        const render = entry[componentName];
        expect(render(contexts[componentName])).to.eql(expected[componentName]);
      }
    });
  });
});
