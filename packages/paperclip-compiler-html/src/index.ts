import { CompileOptions } from "paperclip-interim";
import { compile as compile2Code } from "./code-compiler";

export const compile = ({
  module,
  fileUrl,
  includes,
  config
}: CompileOptions) => {
  const { code, map } = compile2Code(module, fileUrl, config, includes);

  return {
    ".mjs": code,
    ".mjs.map": map.toString()
  };
};
