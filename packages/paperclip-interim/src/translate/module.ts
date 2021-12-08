import { EngineDelegate, Node, VirtSheet } from "paperclip";
import * as path from "path";

import {
  CSSExports,
  getAttributeStringValue,
  getImports,
  getStyleScopeId,
  hasAttribute,
  isNode,
  NodeKind,
  PCExports,
  traverseExpression
} from "paperclip-utils";
import { InterimModule, InterimImport } from "../state";
import { getAssets } from "./assets";
import { translateCSS } from "./css";
import { translateComponents } from "./html";
import { InterimCompilerOptions } from "./options";

export class InterimCompiler {
  constructor(
    private _engine: EngineDelegate,
    readonly options: InterimCompilerOptions
  ) {}
  parseFile(filePath: string): InterimModule {
    const { sheet, exports } = this._engine.open(filePath);
    const ast = this._engine.parseFile(filePath);
    if (ast.error) {
      throw ast.error;
    }
    if (sheet.error) {
      throw sheet.error;
    }
    return translateinterim(
      ast,
      sheet,
      filePath,
      this._engine,
      exports as PCExports,
      this.options
    );
  }
}

const translateinterim = (
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
  return {
    imports,
    components: translateComponents(ast, options, filePath, imports),
    css: translateCSS(sheet, exports, filePath, options),
    assets: getAssets(ast, sheet, options)
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

      const resolvedFilePath = engine.resolveFile(
        filePath,
        getAttributeStringValue("src", imp)
      );

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
