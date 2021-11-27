import { stringifyCSSSheet, VirtSheet } from "paperclip-utils";
import { InterimCSS } from "../state";
import { InterimCompilerOptions } from "./options";

export const translateCSS = (
  sheet: VirtSheet,
  options: InterimCompilerOptions
): InterimCSS => {
  return {
    sheetText: stringifyCSSSheet(sheet),
    exports: null
  };
};
