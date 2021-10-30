import { EngineDelegate, Node, VirtSheet } from "paperclip";
import {
  getAttributeStringValue,
  getImports,
  hasAttribute
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
    return translateIntermediate(ast, sheet, filePath, this.options);
  }
}

const translateIntermediate = (
  ast: Node,
  sheet: VirtSheet,
  filePath: string,
  options: IntermediateCompilerOptions
): IntermediatModule => {
  return {
    imports: translateImports(ast, options),
    components: translateComponents(ast, options, filePath),
    css: translateCSS(sheet, options),
    assets: getAssets(ast, sheet, options)
  };
};

const translateImports = (
  ast: Node,
  options: IntermediateCompilerOptions
): IntermImport[] => {
  return getImports(ast)
    .map(imp => {
      if (!hasAttribute("as", imp) || !hasAttribute("src", imp)) {
        return null;
      }

      return {
        src: getAttributeStringValue("src", imp),
        namespace: getAttributeStringValue("as", imp)
      };
    })
    .filter(Boolean);
};
