import { InterimModule } from "paperclip-interim";
import * as path from "path";
import { compile as compile2Code } from "./code-compiler";
import { compile as compileDefinition } from "./definition-compiler";
import { PaperclipConfig } from "paperclip-utils";

export const compile = (
  module: InterimModule,
  filePath: string,
  includes: string[],
  config: PaperclipConfig
) => {
  const { code, map } = compile2Code(module, filePath, config, includes);

  return {
    ".js": code,
    ".js.map": map.toString(),
    ".d.ts": compileDefinition(module, filePath, config)
  };
};
