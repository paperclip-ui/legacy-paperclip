import * as path from "path";
import {
  VirtSheet,
  stringifyCSSSheet,
  VirtRule,
  VirtRuleKind,
  VirtStyleRule,
  VirtFontFace
} from "paperclip-utils";
import { InterimCompilerOptions } from "./options";
import {
  InterimComponent,
  InterimNodeKind,
  traverseInterimExpression,
  InterimAttributeValuePartKind
} from "../state";
import { InterimAsset } from "../state/assets";
import { EngineDelegate } from "paperclip";

export const getAssets = (
  modulePath: string,
  components: InterimComponent[],
  sheet: VirtSheet,
  engine: EngineDelegate,
  options: InterimCompilerOptions
): InterimAsset[] => {
  return collectAssetPaths(components, sheet).map(assetPath => {
    const filePath = engine.resolveFile(modulePath, assetPath);
    const fileSize = options.io.getFileSize(filePath);
    return {
      relativePath: assetPath,
      filePath,
      content:
        fileSize < options.config.compilerOptions?.embedFileSizeLimit
          ? options.io.readFile(filePath).toString("base64")
          : null
    };
  });
};

const collectAssetPaths = (
  components: InterimComponent[],
  sheet: VirtSheet
) => {
  const relativeAssets = {};

  components.forEach(component => {
    traverseInterimExpression(component, node => {
      if (
        node.kind === InterimNodeKind.Element ||
        node.kind === InterimNodeKind.Component
      ) {
        if (node.tagName === "img" && node.attributes.src) {
          for (const variant of node.attributes.src.variants) {
            if (variant.variantName != null || !variant.parts?.length) {
              continue;
            }
            const mainPart = variant.parts[0];
            if (mainPart.kind === InterimAttributeValuePartKind.Static) {
              relativeAssets[mainPart.value] = 1;
            }
          }
        }
      }
      return true;
    });
  });

  traverseVirtSheet(sheet, rule => {
    for (const { value } of rule.style) {
      if (/url\(/.test(value)) {
        const parts = value.match(/url\(['"]?(.*?)['"]?\)/);
        const url = parts && parts[1];
        if (url && !url.includes("http")) {
          relativeAssets[url] = 1;
        }
      }
    }
  });

  return Object.keys(relativeAssets);
};

const traverseVirtSheet = (
  sheet: VirtSheet,
  each: (rule: VirtStyleRule | VirtFontFace) => void
) => {
  const each2 = (rule: VirtRule) => {
    if (rule.kind === VirtRuleKind.Media) {
      for (const rule2 of rule.rules) {
        each2(rule);
      }
    } else {
      each(rule);
    }
  };
  for (const rule of sheet.rules) {
    each2(rule);
  }
};
