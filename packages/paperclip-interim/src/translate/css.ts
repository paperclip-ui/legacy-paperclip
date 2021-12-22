import {
  CSSExports,
  PCExports,
  stringifyCSSSheet,
  VirtSheet
} from "paperclip-utils";
import { InterimCSS } from "../state";
import { InterimAsset } from "../state/assets";

export const translateCSS = (
  sheet: VirtSheet,
  exports: CSSExports,
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
        Object.keys(exports.classNames)
          .filter(className => {
            return exports.classNames[className].public;
          })
          .map(className => {
            return [className, exports.classNames[className].scopedName];
          })
      )
    }
  };
};
