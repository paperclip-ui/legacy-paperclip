import { InterimModule } from "paperclip-compiler-interim";
import * as path from "path";
import { Node, ClassNameExport } from "paperclip";
import { compile as compile2Code } from "./code-compiler";
// import { compile as compileDefinition } from "./definition-compiler";

type Options = {
  definition?: boolean;
  includeCSS?: boolean;
};

export const getOutputFilePath = (filePath: string, options: Options = {}) => {
  if (options.definition) {
    return filePath + ".d.ts";
  } else {
    return filePath + ".js";
  }
};

export const compile = (
  module: InterimModule,
  filePath: string,
  options: Options = {
  }
) => {
  return {
    js: compile2Code(module, filePath, options.includeCSS !== false ? [
      "./" + path.basename(filePath) + ".css"
    ] : []),
    css: module.css.sheetText
  };
};

export const compileFile = compile;