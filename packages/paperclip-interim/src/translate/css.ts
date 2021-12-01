import {
  CSSExports,
  PCExports,
  stringifyCSSSheet,
  VirtSheet
} from "paperclip-utils";
import { InterimCSS } from "../state";
import { InterimCompilerOptions } from "./options";

export const translateCSS = (
  sheet: VirtSheet,
  exports: PCExports,
  filePath: string,
  options: InterimCompilerOptions,
): InterimCSS => {
  return {
    sheetText: stringifyCSSSheet(sheet),
    exports: {
      classNames: (Object as any).fromEntries(
        Object.keys(exports.style.classNames)
          .filter(className => {
            return exports.style.classNames[className].public;
          })
          .map(className => {
            return [className, exports.style.classNames[className].scopedName];
          })
      )
    }
  };
};
