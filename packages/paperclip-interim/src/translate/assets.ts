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
  node: Node | null,
  sheet: VirtSheet,
  engine: EngineDelegate,
  options: InterimCompilerOptions
): InterimAsset[] => {
  const outModulePath = options.targetOptions.outDir
    ? modulePath.replace(
        path.join(options.cwd, options.config.srcDir),
        path.join(options.cwd, options.targetOptions.outDir)
      )
    : modulePath;

  const { html, css } = collectAssetPaths(node, sheet);

  return [
    ...html.map(mapAsset(modulePath, outModulePath, engine, options)),
    ...css.map(
      mapAsset(
        modulePath,
        options.targetOptions.mainCSSFileName
          ? path.join(
              options.cwd,
              options.targetOptions.assetOutDir || options.targetOptions.outDir,
              options.targetOptions.mainCSSFileName
            )
          : outModulePath,
        engine,
        options
      )
    )
  ];
};

const mapAsset = (
  modulePath: string,
  outModulePath: string,
  engine: EngineDelegate,
  options: InterimCompilerOptions
) => (originalPath: string) => {
  let relativeAssetPath = originalPath;

  if (relativeAssetPath.indexOf("file") === 0) {
    relativeAssetPath = URL.fileURLToPath(relativeAssetPath);
    relativeAssetPath = resolvePath(modulePath, relativeAssetPath);
  }

  const filePath = engine.resolveFile(modulePath, relativeAssetPath);

  let moduleContent: string;
  let outputFilePath = filePath;

  const fileSize = options.io.getFileSize(filePath);
  if (
    fileSize <= options.targetOptions.embedAssetMaxSize ||
    options.targetOptions.embedAssetMaxSize === -1
  ) {
    moduleContent =
      `data:${mime.getType(filePath)};base64,` +
      options.io.readFile(filePath).toString("base64");
  } else if (options.targetOptions.assetOutDir) {
    const srcDir = path.join(options.cwd, options.config.srcDir);

    const outputDir = path.join(options.cwd, options.targetOptions.assetOutDir);

    if (options.targetOptions.useAssetHashNames !== false) {
      const buffer = options.io.readFile(filePath);
      const md5Name = crypto
        .createHash("md5")
        .update(buffer)
        .digest("hex");
      outputFilePath = path.join(outputDir, md5Name + path.extname(filePath));
    } else {
      outputFilePath = path.join(outputDir, filePath.replace(srcDir, ""));
    }
    if (options.targetOptions.assetPrefix) {
      moduleContent =
        options.targetOptions.assetPrefix +
        path.relative(options.cwd, outputFilePath);
    } else {
      moduleContent = resolvePath(outModulePath, outputFilePath);
    }
  }

  return {
    originalPath,
    filePath,
    outputFilePath,
    moduleContent
  };
};

const collectAssetPaths = (root: Node | null, sheet: VirtSheet) => {
  const html = {};
  const css = {};

  if (root) {
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
          html[nested.value.value] = 1;
        }
      }
    });
  }

  traverseVirtSheet(sheet, rule => {
    if (rule.style) {
      for (const { value } of rule.style) {
        if (/url\(/.test(value)) {
          const parts = value.match(/url\(['"]?(.*?)['"]?\)/);
          let url = parts && parts[1];
          if (url && !url.includes("http")) {
            css[url] = 1;
          }
        }
      }
    }
  });

  return {
    html: Object.keys(html),
    css: Object.keys(css)
  };
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
        each2(rule2);
      }
    } else {
      each(rule);
    }
  };
  for (const rule of sheet.rules) {
    each2(rule);
  }
};
