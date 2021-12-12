import {
  CSSExports,
  PCExports,
  stringifyCSSSheet,
  VirtSheet
} from "paperclip-utils";
import { InterimCSS } from "../state";
import { InterimAsset } from "../state/assets";
import { InterimCompilerOptions } from "./options";

export const translateCSS = (
  sheet: VirtSheet,
  exports: PCExports,
  assets: InterimAsset[]
): InterimCSS => {
  return {
    sheetText: stringifyCSSSheet(sheet, {
      resolveUrl(url) {
        return (
          assets.find(asset => asset.originalPath === url)?.moduleContent || url
        );
      }
    }),
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
