import * as React from "react";
import { expect } from "chai";
import { compile } from "..";
import {
  TEST_SUITE,
  compileModules
} from "@paperclipui/compiler-base-jsx/lib/test";

describe(__filename + "#", () => {
  TEST_SUITE.forEach(([title, graph, contexts, config, expected]: any) => {
    it(title, async () => {
      const modules = await compileModules(
        compile,
        {
          react: React
        },
        "mjs"
      )(graph, config);

      const entry = modules["/entry.pc"]();

      for (const componentName in contexts) {
        const render = entry[componentName];
        expect(render(contexts[componentName])).to.eql(expected[componentName]);
      }
    });
  });
});
