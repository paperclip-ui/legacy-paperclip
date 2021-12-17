import { InterimModule } from "paperclip-interim";
import * as path from "path";
import { compile as compile2Code } from "./code-compiler";
import { PaperclipConfig } from "paperclip-utils";

export const compile = (
  module: InterimModule,
  filePath: string,
  includes: string[],
  config: PaperclipConfig,
  cwd: string
) => {
  const code = compile2Code(module, filePath, config, cwd);
  return {
    ".php": code
  };
};
