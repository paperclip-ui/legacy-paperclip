import { InterimModule } from "paperclip-interim";
import * as path from "path";
import { Node, ClassNameExport } from "paperclip";
import { compile as compile2Code } from "./code-compiler";
import { compile as compileDefinition } from "./definition-compiler";

type Options = {
  importCSS?: boolean;
};


export const compile = (
  module: InterimModule,
  filePath: string,
  options: Options = {}
) => {
  const {importCSS = true} = options;
  const {code, map} = compile2Code(module, filePath, importCSS ? [`./${path.basename(filePath)}.css`]: []);

  return {
    "js": code,
    "js.map": map.toString(),
    "d.ts": compileDefinition(module, filePath),
    "css": module.css.sheetText
  };
};
