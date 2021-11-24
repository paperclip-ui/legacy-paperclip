import { EngineDelegate, Node, VirtSheet } from "paperclip";
import {
  getAttributeStringValue,
  getImports,
  getStyleScopeId,
  hasAttribute,
  isNode,
  NodeKind,
  traverseExpression
} from "paperclip-utils";
import { IntermediatModule, IntermImport } from "../state";
import { getAssets } from "./assets";
import { translateCSS } from "./css";
import { translateComponents } from "./html";
import { IntermediateCompilerOptions } from "./options";

export class IntermediateCompiler {
  constructor(
    private _engine: EngineDelegate,
    readonly options: IntermediateCompilerOptions = {}
  ) {}
  parseFile(filePath: string): IntermediatModule {
    const { sheet } = this._engine.open(filePath);
    const ast = this._engine.parseFile(filePath);
    return translateIntermediate(
      ast,
      sheet,
      filePath,
      this._engine,
      this.options
    );
  }
}

const translateIntermediate = (
  ast: Node,
  sheet: VirtSheet,
  filePath: string,
  engine: EngineDelegate,
  options: IntermediateCompilerOptions
): IntermediatModule => {
  const imports: IntermImport[] = translateImports(
    ast,
    filePath,
    engine,
    options
  );
  return {
    imports,
    components: translateComponents(ast, options, filePath, imports),
    css: translateCSS(sheet, options),
    assets: getAssets(ast, sheet, options)
  };
};

const translateImports = (
  ast: Node,
  filePath: string,
  engine: EngineDelegate,
  options: IntermediateCompilerOptions
): IntermImport[] => {
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
        publicScopeId: `_pub-${getStyleScopeId(resolvedFilePath)}`,
        namespace,
        usedTagNames: Object.keys(usedTagNames) as string[],
        injectedStyles: hasAttribute("inject-styles", imp)
      };
    })
    .filter(Boolean);
};
