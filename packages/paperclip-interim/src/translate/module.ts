import { EngineDelegate, Node, VirtSheet, isErrorResult } from "paperclip";
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
  Module,
  getScopedCSSFilePath,
  traverseExpression,
  ModuleKind,
  CSSExports,
  isCSSExports
} from "paperclip-utils";
import { getAssets } from "./assets";
import { translateCSS } from "./css";
import { translateComponents } from "./html";
import { FIO, InterimCompilerOptions } from "./options";
import { InterimModule, InterimImport, InterimComponent } from "../state";
import { InterimAsset } from "../state/assets";

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
    if (isErrorResult(ast)) {
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
      exports,
      this.options
    );
  }
}

const translateInterim = (
  ast: Module,
  sheet: VirtSheet,
  filePath: string,
  engine: EngineDelegate,
  exports: PCExports | CSSExports,
  options: InterimCompilerOptions
): InterimModule => {
  let components: InterimComponent[] = [];
  let imports: InterimImport[] = [];
  let assets: InterimAsset[] = [];

  if (ast.moduleKind === ModuleKind.PC) {
    imports = translateImports(ast, filePath, engine, options);
    assets = getAssets(filePath, ast, sheet, engine, options);
    components = translateComponents(ast, filePath, engine, imports, assets);
  } else {
    assets = getAssets(filePath, null, sheet, engine, options);
  }

  return {
    imports,
    components,
    css: translateCSS(
      sheet,
      isCSSExports(exports) ? exports : exports.style,
      assets
    ),
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
      if (isCSSFile(src) && !options.targetOptions.importAssetsAsModules) {
        return null;
      }

      let resolvedFilePath = castAsFilePath(engine.resolveFile(filePath, src));

      if (isCSSFile(resolvedFilePath)) {
        resolvedFilePath = getScopedCSSFilePath(resolvedFilePath);
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
