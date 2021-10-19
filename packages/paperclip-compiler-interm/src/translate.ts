import { EngineDelegate, Node, stringifyCSSSheet, VirtSheet } from "paperclip";
import { IntermediatModule, IntermediateCSS } from "./state";

type IntermediateCompilerOptions = {};

export class IntermediateCompiler {
  constructor(
    private _engine: EngineDelegate,
    readonly options: IntermediateCompilerOptions = {}
  ) {}
  parseFile(filePath: string): IntermediatModule {
    const { sheet } = this._engine.open(filePath);
    const ast = this._engine.parseFile(filePath);
    return translateIntermediate(ast, sheet, this.options);
  }
}

const translateIntermediate = (
  ast: Node,
  sheet: VirtSheet,
  options: IntermediateCompilerOptions
): IntermediatModule => {
  // console.log(ast, sheet);

  return {
    components: translateComponents(ast, options),
    css: translateCSS(sheet, options),
    assets: getAssets(ast, sheet, options)
  };
};

const translateCSS = (
  sheet: VirtSheet,
  options: IntermediateCompilerOptions
): IntermediateCSS => {
  return {
    sheetText: stringifyCSSSheet(sheet),
    exports: null
  };
};

const translateComponents = (
  ast: Node,
  options: IntermediateCompilerOptions
) => {
  return [];
};

const getAssets = (
  ast: Node,
  sheet: VirtSheet,
  options: IntermediateCompilerOptions
) => {
  return [];
};
