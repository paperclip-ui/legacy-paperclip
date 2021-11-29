import { InterimModule } from "paperclip-compiler-interim";
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
  return {
    "js": compile2Code(module, filePath, importCSS ? [`./${path.basename(filePath)}.css`]: []),

    // TODO
    "map": null,

    // TODO
    "d.ts": null,
    "css": module.css.sheetText
  };
};
