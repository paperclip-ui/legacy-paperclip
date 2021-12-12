import * as path from "path";
import * as URL from "url";
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
  AttributeValueKind,
  isNode,
  NodeKind
} from "paperclip-utils";
import { InterimCompilerOptions } from "./options";
import { InterimAsset } from "../state/assets";
import { EngineDelegate } from "paperclip";
import * as mime from "mime";
import * as crypto from "crypto";

export const getAssets = (
  modulePath: string,
  node: Node,
  sheet: VirtSheet,
  engine: EngineDelegate,
  options: InterimCompilerOptions
): InterimAsset[] => {
  const outModulePath = options.config.compilerOptions?.outDir
    ? modulePath.replace(
        path.join(options.cwd, options.config.srcDir),
        path.join(options.cwd, options.config.compilerOptions.outDir)
      )
    : modulePath;

  return collectAssetPaths(modulePath, node, sheet).map(assetPath => {
    const filePath = engine.resolveFile(modulePath, assetPath);
    const fileSize = options.io.getFileSize(filePath);

    let moduleContent: string;
    let outputFilePath = filePath;

    if (
      fileSize <= options.config.compilerOptions?.embedAssetMaxSize ||
      options.config.compilerOptions?.embedAssetMaxSize === -1
    ) {
      moduleContent =
        `data:${mime.getType(filePath)};base64,` +
        options.io.readFile(filePath).toString("base64");
    } else if (options.config.compilerOptions.assetOutDir) {
      const srcDir = path.join(options.cwd, options.config.srcDir);

      const outputDir = path.join(
        options.cwd,
        options.config.compilerOptions.assetOutDir
      );

      if (options.config.compilerOptions?.useAssetHashNames !== false) {
        const buffer = options.io.readFile(filePath);
        const md5Name = crypto
          .createHash("md5")
          .update(buffer)
          .digest("hex");
        outputFilePath = path.join(outputDir, md5Name + path.extname(filePath));
      } else {
        outputFilePath = path.join(outputDir, filePath.replace(srcDir, ""));
      }

      moduleContent = resolvePath(outModulePath, outputFilePath);
    }

    return {
      relativePath: assetPath,
      filePath,
      outputFilePath,
      moduleContent
    };
  });
};

const collectAssetPaths = (
  modulePath: string,
  root: Node,
  sheet: VirtSheet
) => {
  const relativeAssets = {};

  traverseExpression(root, nested => {
    if (
      isNode(nested) &&
      nested.nodeKind === NodeKind.Element &&
      nested.tagName === "import"
    ) {
      return false;
    }

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
        let url = parts && parts[1];
        if (url && !url.includes("http")) {
          if (url.indexOf("file") === 0) {
            url = URL.fileURLToPath(url);
            url = resolvePath(modulePath, url);
          }
          relativeAssets[url] = 1;
        }
      }
    }
  });

  return Object.keys(relativeAssets);
};

const resolvePath = (from: string, to: string) => {
  let resolved = path.relative(path.dirname(from), to);
  if (resolved.charAt(0) !== ".") {
    resolved = "./" + resolved;
  }
  return resolved;
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
