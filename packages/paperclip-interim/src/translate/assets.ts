import * as path from "path";
import {
  VirtSheet,
  stringifyCSSSheet,
  VirtRule,
  VirtRuleKind,
  VirtStyleRule,
  VirtFontFace,
  Expression,
  Node,
  traverseExpression,
  isAttribute,
  AttributeKind,
  AttributeValueKind
} from "paperclip-utils";
import { InterimCompilerOptions } from "./options";
import { InterimAsset } from "../state/assets";
import { EngineDelegate } from "paperclip";
import * as mime from "mime";

export const getAssets = (
  modulePath: string,
  node: Node,
  sheet: VirtSheet,
  engine: EngineDelegate,
  options: InterimCompilerOptions
): InterimAsset[] => {
  return collectAssetPaths(node, sheet).map(assetPath => {
    const filePath = engine.resolveFile(modulePath, assetPath);
    const fileSize = options.io.getFileSize(filePath);

    let content: string;

    if (fileSize <= options.config.compilerOptions?.embedAssetMaxSize) {
      content =
        `data:${mime.getType(filePath)};base64,` +
        options.io.readFile(filePath).toString("base64");
    } else if (options.config.compilerOptions.assetOutDir) {
      const srcDir = path.join(options.cwd, options.config.srcDir);

      const outputDir = path.join(
        options.cwd,
        options.config.compilerOptions.assetOutDir
      );
      content = path.join(outputDir, filePath.replace(srcDir, ""));
    }

    return {
      relativePath: assetPath,
      filePath,
      content
    };
  });
};

const collectAssetPaths = (root: Node, sheet: VirtSheet) => {
  const relativeAssets = {};

  traverseExpression(root, nested => {
    if (isAttribute(nested)) {
      if (
        nested.attrKind === AttributeKind.KeyValueAttribute &&
        nested.name === "src" &&
        nested.value.attrValueKind === AttributeValueKind.String
      ) {
        relativeAssets[nested.value.value] = 1;
      }
    }
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
