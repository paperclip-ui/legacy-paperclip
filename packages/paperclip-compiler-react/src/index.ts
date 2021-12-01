import { InterimModule } from "paperclip-interim";
import * as path from "path";
import { compile as compile2Code } from "./code-compiler";
import { compile as compileDefinition } from "./definition-compiler";
import { PaperclipConfig } from "paperclip-utils";

export const compile = (
  module: InterimModule,
  filePath: string,
  config: PaperclipConfig
) => {
  const { code, map } = compile2Code(
    module,
    filePath,
    config,
    config.compilerOptions?.importAssetsAsModules
      ? [`./${path.basename(filePath)}.css`]
      : []
  );

  return {
    js: code,
    "js.map": map.toString(),
    "d.ts": compileDefinition(module, filePath, config),
    css: module.css.sheetText
  };
};
