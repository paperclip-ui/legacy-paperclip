import { EngineDelegate, Node, VirtSheet } from "paperclip";
import * as path from "path";
import * as fs from "fs";
import * as URL from "url";

import {
  getAttributeStringValue,
  getImports,
  getStyleScopeId,
  hasAttribute,
  isNode,
  NodeKind,
  PCExports,
  isCSSFile,
  getScopedCSSFileName,
  traverseExpression
} from "paperclip-utils";
import { getAssets } from "./assets";
import { translateCSS } from "./css";
import { translateComponents } from "./html";
import { FIO, InterimCompilerOptions } from "./options";
import { InterimModule, InterimImport } from "../state";

const castAsFilePath = (filePath: string) => {
  if (filePath.indexOf("file://") === 0) {
    filePath = URL.fileURLToPath(filePath);
  }
  return filePath;
};

const defaultFIO: FIO = {
  readFile(filePath: string) {
    return fs.readFileSync(castAsFilePath(filePath));
  },
  getFileSize(filePath: string) {
    return fs.lstatSync(castAsFilePath(filePath)).size;
  }
};

export class InterimCompiler {
  readonly options: InterimCompilerOptions;
  constructor(
    private _engine: EngineDelegate,
    options: InterimCompilerOptions
  ) {
    this.options = {
      io: defaultFIO,
      ...options
    };
  }
  parseFile(filePath: string): InterimModule {
    const { sheet, exports } = this._engine.open(filePath);
    const ast = this._engine.parseFile(filePath);
    if (ast.error) {
      throw ast.error;
    }
    if (sheet.error) {
      throw sheet.error;
    }
    return translateInterim(
      ast,
      sheet,
      castAsFilePath(filePath),
      this._engine,
      exports as PCExports,
      this.options
    );
  }
}

const translateInterim = (
  ast: Node,
  sheet: VirtSheet,
  filePath: string,
  engine: EngineDelegate,
  exports: PCExports,
  options: InterimCompilerOptions
): InterimModule => {
  const imports: InterimImport[] = translateImports(
    ast,
    filePath,
    engine,
    options
  );
  const assets = getAssets(filePath, ast, sheet, engine, options);
  const components = translateComponents(
    ast,
    filePath,
    engine,
    imports,
    assets
  );
  return {
    imports,
    components,
    css: translateCSS(sheet, exports, assets),
    assets
  };
};

const translateImports = (
  ast: Node,
  filePath: string,
  engine: EngineDelegate,
  options: InterimCompilerOptions
): InterimImport[] => {
  return getImports(ast)
    .map(imp => {
      if (!hasAttribute("src", imp)) {
        return null;
      }

      const src = getAttributeStringValue("src", imp);

      // do not include css
      if (
        isCSSFile(src) &&
        !options.config.compilerOptions.importAssetsAsModules
      ) {
        return null;
      }

      let resolvedFilePath = castAsFilePath(engine.resolveFile(filePath, src));

      if (isCSSFile(resolvedFilePath)) {
        resolvedFilePath = getScopedCSSFileName(resolvedFilePath);
      }

      const usedTagNames: any = {};

      const namespace = getAttributeStringValue("as", imp);

      traverseExpression(ast, node => {
        if (
          isNode(node) &&
          node.nodeKind === NodeKind.Element &&
          node.tagName.includes(".")
        ) {
          const [tagNamespace, tagName] = node.tagName.split(".");
          if (tagNamespace === namespace) {
            usedTagNames[tagName] = 1;
          }
        }
      });

      return {
        filePath: resolvedFilePath,
        relativePath: relative(
          path.relative(path.dirname(filePath), resolvedFilePath)
        ),
        publicScopeId: `_pub-${getStyleScopeId(resolvedFilePath)}`,
        namespace,
        usedTagNames: Object.keys(usedTagNames) as string[],
        injectedStyles: hasAttribute("inject-styles", imp)
      };
    })
    .filter(Boolean);
};

const relative = (path: string) =>
  path.charAt(0) === "." ? path : "./" + path;
