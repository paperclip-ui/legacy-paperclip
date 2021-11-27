import { InterimModule } from "paperclip-compiler-interim";
import { Node, ClassNameExport } from "paperclip";
import { compile as compile2Code } from "./code-compiler";
import { compile as compileDefinition } from "./definition-compiler";

type Options = {
  definition?: boolean;
};

export const getOutputFilePath = (filePath: string, options: Options = {}) => {
  if (options.definition) {
    return filePath + ".d.ts";
  } else {
    return filePath + ".js";
  }
};

export const compile = (
  info: { ast: Node; sheet?: any; classNames: Record<string, ClassNameExport> },
  filePath: string,
  options: Options = {}
) => {
  if (options.definition) {
    return compileDefinition(info, filePath, options);
  } else {
    // return compile2Code(info, filePath, options);
    return null;
  }
};

export const compileFile = (
  filePath: string,
  module: InterimModule,
  options: Options = {}
) => {
  const files = {
    [filePath + ".js"]: compile2Code(module, filePath)
  };

  return files;
};
