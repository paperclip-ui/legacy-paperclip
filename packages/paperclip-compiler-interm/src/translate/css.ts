import { stringifyCSSSheet, VirtSheet } from "paperclip-utils";
import { IntermCSS } from "../state";
import { IntermediateCompilerOptions } from "./options";

export const translateCSS = (
  sheet: VirtSheet,
  options: IntermediateCompilerOptions
): IntermCSS => {
  return {
    sheetText: stringifyCSSSheet(sheet),
    exports: null
  };
};
