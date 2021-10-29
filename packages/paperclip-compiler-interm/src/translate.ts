import {
  EngineDelegate,
  Node,
  stringifyCSSSheet,
  VirtSheet,
  getParts,
  Element
} from "paperclip";
import {
  getAttributeStringValue,
  hasAttribute,
  NodeKind,
  Slot,
  Text
} from "paperclip-utils";
import { IntermElement, IntermSlotNode } from ".";
import {
  IntermComponent,
  IntermChildNode,
  IntermNodeKind,
  IntermText
} from "./state";
import { IntermediatModule, IntermCSS } from "./state";

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
): IntermCSS => {
  return {
    sheetText: stringifyCSSSheet(sheet),
    exports: null
  };
};

const translateComponents = (
  ast: Node,
  options: IntermediateCompilerOptions
) => {
  const components = getParts(ast);

  return components.map(translateComponent(options));
};

const translateComponent = (options: IntermediateCompilerOptions) => (
  component: Element
): IntermComponent => {
  const as = getAttributeStringValue("as", component);

  return {
    tagName: component.tagName,
    as,
    exported: hasAttribute("export", component),
    range: component.range,
    kind: IntermNodeKind.Component,
    attributes: [],
    children: translateChildren(options)(component.children)
  };
};

const translateChildren = (options: IntermediateCompilerOptions) => (
  children: Node[]
): IntermChildNode[] => children.map(translateChild(options)).filter(Boolean);

const translateChild = (options: IntermediateCompilerOptions) => (
  node: Node
): IntermChildNode => {
  switch (node.nodeKind) {
    case NodeKind.Text: {
      return translateText(node);
    }
    case NodeKind.Element: {
      return translateElement(options)(node);
    }
    case NodeKind.Slot: {
      return translateSlotNode(options)(node);
    }
  }
};

const translateText = (text: Text): IntermText => {
  return {
    value: text.value,
    kind: IntermNodeKind.Text,
    range: text.range
  };
};

const translateElement = (options: IntermediateCompilerOptions) => (
  element: Element
): IntermElement => {
  return {
    kind: IntermNodeKind.Element,
    tagName: element.tagName,
    attributes: [],
    range: element.range,
    children: translateChildren(options)(element.children)
  };
};

const translateSlotNode = (options: IntermediateCompilerOptions) => (
  slot: Slot
): IntermSlotNode => {
  return {
    kind: IntermNodeKind.Slot,
    script: null,
    range: slot.range
  };
};

const getAssets = (
  ast: Node,
  sheet: VirtSheet,
  options: IntermediateCompilerOptions
) => {
  return [];
};
