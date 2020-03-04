import { Statement, StatementKind, Reference } from "./js-ast";
import { Sheet } from "./css-ast";
import { SourceLocation } from "./base-ast";
import * as crc32 from "crc32";
import { resolveImportFile } from "./engine";
import * as path from "path";
import {
  PREVIEW_TAG_NAME,
  PART_TAG_NAME,
  LOGIC_TAG_NAME,
  DEFAULT_PART_ID
} from "./constants";

export enum NodeKind {
  Fragment = "Fragment",
  Text = "Text",
  Element = "Element",
  StyleElement = "StyleElement",
  Slot = "Slot",
  Block = "Block"
}

export type BaseNode<TKind extends NodeKind> = {
  kind: TKind;
};

export type Text = {
  value: string;
} & BaseNode<NodeKind.Text>;

export type Element = {
  location: SourceLocation;
  openTagLocation: SourceLocation;
  tagNameLocation: SourceLocation;
  tagName: string;
  attributes: Attribute[];
  value: string;
  children: Node[];
} & BaseNode<NodeKind.Element>;

export type StyleElement = {
  sheet: Sheet;
} & BaseNode<NodeKind.StyleElement>;

export enum AttributeKind {
  ShorthandAttribute = "ShorthandAttribute",
  KeyValueAttribute = "KeyValueAttribute",
  SpreadAttribute = "SpreadAttribute"
}

type BaseAttribute<TKind extends AttributeKind> = {
  kind: TKind;
};

type ShorthandAttribute = {
  reference: Statement;
} & BaseAttribute<AttributeKind.ShorthandAttribute>;

type SpreadAttribute = {
  script: Statement;
} & BaseAttribute<AttributeKind.SpreadAttribute>;

type KeyValueAttribute = {
  name: string;
  value?: AttributeValue;
} & BaseAttribute<AttributeKind.KeyValueAttribute>;

export type Attribute =
  | ShorthandAttribute
  | SpreadAttribute
  | KeyValueAttribute;

export enum AttributeValueKind {
  String = "String",
  Slot = "Slot"
}

export type BaseAttributeValue<TKind extends AttributeValueKind> = {
  attrValueKind: TKind;
};

export type StringAttributeValue = {
  value: string;
  location: SourceLocation;
} & BaseAttributeValue<AttributeValueKind.String>;

export type SlotAttributeValue = Statement &
  BaseAttributeValue<AttributeValueKind.Slot>;

export type AttributeValue = StringAttributeValue | SlotAttributeValue;

export type Fragment = {
  value: string;
  children: Node[];
} & BaseNode<NodeKind.Fragment>;

export type Slot = {
  script: Statement;
} & BaseNode<NodeKind.Slot>;

export enum BlockKind {
  Each = "Each",
  Conditional = "Conditional"
}

export type BaseBlock<TBlockKind extends BlockKind> = {
  blockKind: TBlockKind;
  body?: Node;
} & BaseNode<NodeKind.Block>;

export type EachBlock = {
  source: Statement;
  valueName: string;
  keyName: string;
} & BaseBlock<BlockKind.Each>;

export enum ConditionalBlockKind {
  PassFailBlock = "PassFailBlock",
  FinalBlock = "FinalBlock"
}

export type BaseConditional<
  TconditionalBlockKind extends ConditionalBlockKind
> = {
  conditionalBlockKind: TconditionalBlockKind;
  body: Node;
};

export type PassFailConditional = {
  condition: Statement;
  fail?: Conditional;
} & BaseConditional<ConditionalBlockKind.PassFailBlock>;

export type FinalConditional = {} & BaseConditional<
  ConditionalBlockKind.FinalBlock
>;

export type Conditional = PassFailConditional | FinalConditional;

export type ConditionalBlock = PassFailConditional &
  BaseBlock<BlockKind.Conditional>;

export type Block = EachBlock | ConditionalBlock;

export type Node = Text | Element | StyleElement | Fragment | Slot | Block;

export const getImports = (ast: Node): Element[] =>
  getChildrenByTagName("import", ast).filter(child => {
    return hasAttribute("src", child);
  });

export const getRelativeFilePath = (
  fromFilePath: string,
  importFilePath: string
) => {
  const logicPath = resolveImportFile(fromFilePath, importFilePath);
  let relativePath = path.relative(path.dirname(fromFilePath), logicPath);
  if (relativePath.charAt(0) !== ".") {
    relativePath = `./${relativePath}`;
  }
  return relativePath;
};
export const getImportIds = (ast: Node): string[] =>
  getImports(ast)
    .map(node => getAttributeStringValue("id", node))
    .filter(Boolean) as string[];

export const getChildren = (ast: Node): Node[] => {
  if (ast.kind === NodeKind.Element || ast.kind === NodeKind.Fragment) {
    return ast.children;
  }
  return [];
};

export const getStyleScopes = (ast: Node, filePath: string): string[] => {
  const scopes: string[] = [];
  if (getStyleElements(ast).length > 0) {
    scopes.push(crc32("file://" + filePath));
  }

  for (const imp of getImports(ast)) {
    const src = getAttributeStringValue("src", imp);
    if (/\.css$/.test(src)) {
      const cssFilePath = resolveImportFile(filePath, src);
      scopes.push(crc32("file://" + cssFilePath));
    }
  }

  return scopes;
};

export const getChildrenByTagName = (tagName: string, parent: Node) =>
  getChildren(parent).filter(child => {
    return (
      child.kind === NodeKind.Element &&
      child.tagName === tagName &&
      hasAttribute("src", child)
    );
  }) as Element[];

export const getMetaValue = (name: string, root: Node) => {
  const metaElement = getChildrenByTagName("meta", root).find(
    meta => getAttributeStringValue("name", meta) === name
  );
  return metaElement && getAttributeStringValue("content", metaElement);
};

export const getAttribute = (name: string, element: Element) =>
  element.attributes.find(attr => {
    return attr.kind === AttributeKind.KeyValueAttribute && attr.name === name;
  }) as KeyValueAttribute;

export const getAttributeValue = (name: string, element: Element) => {
  const attr = getAttribute(name, element);
  return attr && attr.value;
};

export const getAttributeStringValue = (name: string, element: Element) => {
  const value = getAttributeValue(name, element);
  return (
    value && value.attrValueKind === AttributeValueKind.String && value.value
  );
};

export const getStyleElements = (ast: Node): StyleElement[] =>
  getChildren(ast).filter(
    child => child.kind === NodeKind.StyleElement
  ) as StyleElement[];

export const isVisibleElement = (ast: Element): boolean => {
  return !/^(import|logic|meta|style|part|preview)$/.test(ast.tagName);
};
export const isVisibleNode = (node: Node): boolean =>
  node.kind === NodeKind.Text ||
  node.kind === NodeKind.Fragment ||
  node.kind === NodeKind.Slot ||
  node.kind === NodeKind.Block ||
  (node.kind === NodeKind.Element && isVisibleElement(node));

export const getVisibleChildNodes = (ast: Node): Node[] =>
  getChildren(ast).filter(isVisibleNode);

export const getParts = (ast: Node): Element[] =>
  getChildren(ast).filter(child => {
    return (
      child.kind === NodeKind.Element &&
      child.tagName === PART_TAG_NAME &&
      hasAttribute("id", child)
    );
  }) as Element[];

export const getDefaultPart = (ast: Node): Element =>
  getParts(ast).find(
    part => getAttributeStringValue("id", part) === DEFAULT_PART_ID
  );

export const getLogicElement = (ast: Node): Element | null => {
  return getChildren(ast).find(
    child => child.kind === NodeKind.Element && child.tagName === LOGIC_TAG_NAME
  ) as Element;
};

export const hasAttribute = (name: string, element: Element) =>
  getAttribute(name, element) != null;

export const flattenNodes = (node: Node, _allNodes: Node[] = []): Node[] => {
  _allNodes.push(node);
  if (node.kind === NodeKind.Element) {
    for (const attr of node.attributes) {
      if (attr.kind === AttributeKind.KeyValueAttribute && attr.value) {
        if (attr.value.attrValueKind === AttributeValueKind.Slot) {
          if (attr.value.jsKind === StatementKind.Node) {
            flattenNodes(attr.value, _allNodes);
          }
        }
      }
    }
  }
  if (node.kind === NodeKind.Block) {
    if (node.blockKind === BlockKind.Each) {
      if (node.body) {
        flattenNodes(node.body, _allNodes);
      }
    } else if (node.blockKind === BlockKind.Conditional) {
      flattenConditional(node, _allNodes);
    }
  }

  for (const child of getChildren(node)) {
    flattenNodes(child, _allNodes);
  }

  return _allNodes;
};

const flattenConditional = (
  conditional: Conditional,
  _allNodes: Node[]
): Node[] => {
  if (conditional.body) {
    flattenNodes(conditional.body, _allNodes);
  }
  if (conditional.conditionalBlockKind === ConditionalBlockKind.PassFailBlock) {
    if (conditional.fail) {
      flattenConditional(conditional.fail, _allNodes);
    }
  }
  return _allNodes;
};

export const isComponentInstance = (
  node: Node,
  importIds: string[]
): node is Element => {
  return (
    node.kind === NodeKind.Element &&
    importIds.indexOf(node.tagName.split(".").shift()) !== -1
  );
};

const maybeAddReference = (
  stmt: Statement,
  _statements: [Reference, string][] = []
) => {
  if (stmt.jsKind === StatementKind.Reference) {
    _statements.push([stmt, null]);
  }
};

export const getNestedReferences = (
  node: Node,
  _statements: [Reference, string][] = []
): [Reference, string][] => {
  if (node.kind === NodeKind.Slot) {
    maybeAddReference(node.script, _statements);
  } else if (node.kind === NodeKind.Block) {
    if (node.blockKind === BlockKind.Each) {
      // if (node.body) {
      //   getNestedReferences(node.body, _statements);
      // }
      maybeAddReference(node.source, _statements);
    } else if (node.blockKind === BlockKind.Conditional) {
      let current: Conditional = node;

      while (current) {
        if (current.body) {
          getNestedReferences(current.body, _statements);
        }
        if (
          current.conditionalBlockKind === ConditionalBlockKind.PassFailBlock
        ) {
          maybeAddReference(current.condition, _statements);
          current = current.fail;
        } else {
          // final block
          break;
        }
      }
    }
  } else {
    if (node.kind === NodeKind.Element) {
      for (const attr of node.attributes) {
        if (
          attr.kind == AttributeKind.KeyValueAttribute &&
          attr.value &&
          attr.value.attrValueKind === AttributeValueKind.Slot
        ) {
          if (attr.value.jsKind === StatementKind.Node) {
            getNestedReferences(attr.value, _statements);
          } else if (attr.value.jsKind === StatementKind.Reference) {
            _statements.push([attr.value, attr.name]);
          }
        } else if (
          attr.kind === AttributeKind.ShorthandAttribute &&
          attr.reference.jsKind === StatementKind.Reference
        ) {
          _statements.push([attr.reference, attr.reference[0]]);
        } else if (
          attr.kind === AttributeKind.SpreadAttribute &&
          attr.script.jsKind === StatementKind.Reference
        ) {
          _statements.push([attr.script, attr.script[0]]);
        }
      }
    }

    for (const child of getChildren(node)) {
      if (
        child.kind === NodeKind.Element &&
        child.tagName === PREVIEW_TAG_NAME
      ) {
        continue;
      }
      getNestedReferences(child, _statements);
    }
  }
  return _statements;
};
