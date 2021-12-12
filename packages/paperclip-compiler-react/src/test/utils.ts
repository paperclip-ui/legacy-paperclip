import { compile } from "../code-compiler";
import { createEngineDelegate } from "paperclip";
import * as babel from "@babel/core";
import * as React from "react";
import { InterimCompiler } from "paperclip-interim";
import { isPaperclipFile, PaperclipConfig } from "paperclip-utils";

const builtin = {
  react: React
};

export const compileModules = async (
  graph: Record<string, string>,
  config: PaperclipConfig
) => {
  const engine = await createEngineDelegate({
    io: {
      readFile: uri => graph[uri],
      fileExists: uri => Boolean(graph[uri]),
      resolveFile: (from, to) => {
        return to;
      }
    }
  });

  const intermCompiler = new InterimCompiler(engine, {
    config,
    cwd: "/",
    io: {
      readFile(filePath) {
        return Buffer.from(graph[filePath]);
      },
      getFileSize(filePath) {
        return 0;
      }
    }
  });

  const modules = {};

  for (const path in graph) {
    if (!isPaperclipFile(path)) {
      modules[path] = () => graph[path];
      continue;
    }
    const es6 = compile(intermCompiler.parseFile(path), path, config, []).code;
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

    const executed = {};

    const wrapper = () =>
      module(path => {
        const mod = modules[path] || modules[path.substr(1)];
        const ex = executed[path] || (executed[path] = mod && mod());
        return builtin[path] || ex;
      });
    modules[path] = wrapper;
  }

  return modules;
};
