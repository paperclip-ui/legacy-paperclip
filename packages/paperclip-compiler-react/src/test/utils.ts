import { compile } from "../code-compiler";
import { createEngine } from "paperclip";
import * as babel from "@babel/core";
import * as React from "react";

const builtin = {
  react: React
};

export const compileModules = async (graph: Record<string, string>) => {
  const engine = await createEngine({
    io: {
      readFile: uri => graph[uri],
      fileExists: uri => Boolean(graph[uri]),
      resolveFile: (from, to) => {
        return to;
      }
    }
  });

  const modules = {};

  for (const path in graph) {
    const { sheet, exports } = await engine.run(path);
    const ast = engine.getLoadedAst(path) as any;
    const es6 = compile(
      { ast, sheet, classNames: exports.style.classNames },
      path
    );
    const es5 = babel.transformSync(es6, { presets: ["@babel/preset-env"] });
    const module = new Function(
      `require`,
      `
      const module = {
        exports: {}
      };

      const exports = module.exports;

      ${es5.code}

      return exports;
    `
    );
    const wrapper = () => module(path => builtin[path] || modules[path]);
    modules[path] = wrapper;
  }

  return modules;
};
