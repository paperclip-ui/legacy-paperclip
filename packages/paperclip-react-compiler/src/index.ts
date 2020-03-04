import { Node } from "paperclip";
import { compile as compileCode } from "./code-compiler";
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
  info: { ast: Node; sheet?: any },
  filePath: string,
  options: Options = {}
) => {
  if (options.definition) {
    return compileDefinition(info, filePath, options);
  } else {
    return compileCode(info, filePath, options);
  }
};
