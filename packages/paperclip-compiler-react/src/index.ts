import { CompileOptions } from "paperclip-interim";
import { compile as compile2Code } from "./code-compiler";
import { compile as compileDefinition } from "./definition-compiler";

export const compile = ({
  module,
  fileUrl,
  includes,
  config
}: CompileOptions) => {
  const { code, map } = compile2Code(module, fileUrl, config, includes);

  return {
    ".js": code,
    ".js.map": map.toString(),
    ".d.ts": compileDefinition(module, fileUrl, config)
  };
};
