import { stringifyCSSSheet, VirtSheet } from "paperclip-utils";
import { InterimCSS } from "../state";
import { interimCompilerOptions } from "./options";

export const translateCSS = (
  sheet: VirtSheet,
  options: interimCompilerOptions
): InterimCSS => {
  return {
    sheetText: stringifyCSSSheet(sheet),
    exports: null
  };
};
