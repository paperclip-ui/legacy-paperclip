import { Statement, StatementKind, Reference } from "./js-ast";
import {
  Sheet,
  getSheetClassNames,
  traverseSheet,
  MixinRule,
  RuleKind,
  Rule,
  isRule,
  StyleExpression
} from "./css-ast";
import { SourceLocation } from "./base-ast";
import * as crc32 from "crc32";
import { resolveImportFile } from "./resolve";
import * as path from "path";
import {
  LOGIC_TAG_NAME,
  DEFAULT_PART_ID,
  AS_ATTR_NAME,
  PREVIEW_ATTR_NAME
} from "./constants";

export enum NodeKind {
  Fragment = "Fragment",
  Text = "Text",
  Element = "Element",
  StyleElement = "StyleElement",
  Slot = "Slot"
}

export type BaseNode<TKind extends NodeKind> = {
  kind: TKind;
};

// TODO - include location here.
export type Text = {
  value: string;
  location: SourceLocation;
} & BaseNode<NodeKind.Text>;

export type Element = {
  location: SourceLocation;

  // TODO - change this to OpenTag. Don't keep location here
  openTagLocation: SourceLocation;

  // TODO - change this to ElementTagName. name should go in value
  tagNameLocation: SourceLocation;
  tagName: string;
  attributes: Attribute[];
  value: string;
  children: Node[];
} & BaseNode<NodeKind.Element>;

export type StyleElement = {
  sheet: Sheet;
  location: SourceLocation;
} & BaseNode<NodeKind.StyleElement>;

export enum AttributeKind {
  ShorthandAttribute = "ShorthandAttribute",
  KeyValueAttribute = "KeyValueAttribute",
  SpreadAttribute = "SpreadAttribute",
  PropertyBoundAttribute = "PropertyBoundAttribute"
}

type BaseAttribute<TKind extends AttributeKind> = {
  kind: TKind;
};

type ShorthandAttribute = {
  reference: Statement;
  location: SourceLocation;
} & BaseAttribute<AttributeKind.ShorthandAttribute>;

type SpreadAttribute = {
  script: Statement;
  location: SourceLocation;
} & BaseAttribute<AttributeKind.SpreadAttribute>;

type KeyValueAttribute = {
  name: string;
  value?: AttributeValue;
  location: SourceLocation;
} & BaseAttribute<AttributeKind.KeyValueAttribute>;

export type PropertyBoundAttribute = {
  name: string;
  bindingName: string;
  value: AttributeValue;
  location: SourceLocation;
} & BaseAttribute<AttributeKind.PropertyBoundAttribute>;

export type Attribute =
  | ShorthandAttribute
  | SpreadAttribute
  | KeyValueAttribute
  | PropertyBoundAttribute;

export enum AttributeValueKind {
  DyanmicString = "DyanmicString",
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

export enum DynamicStringAttributeValuePartKind {
  Literal = "Literal",
  ClassNamePierce = "ClassNamePierce",
  Slot = "Slot"
}

type BaseDynamicStringAttributeValuePart<
  TPartKind extends DynamicStringAttributeValuePartKind
> = {
  partKind: TPartKind;
};

type DynamicStringLiteralPart = {
  value: string;
} & BaseDynamicStringAttributeValuePart<
  DynamicStringAttributeValuePartKind.Literal
>;

type DynamicStringClassNamePiercePart = {
  className: string;
} & BaseDynamicStringAttributeValuePart<
  DynamicStringAttributeValuePartKind.ClassNamePierce
>;

type DynamicStringSlotPart = Statement &
  BaseDynamicStringAttributeValuePart<DynamicStringAttributeValuePartKind.Slot>;

type DynamicStringAttributeValuePart =
  | DynamicStringLiteralPart
  | DynamicStringClassNamePiercePart
  | DynamicStringSlotPart;

export type DynamicStringAttributeValue = {
  values: DynamicStringAttributeValuePart[];
  location: SourceLocation;
} & BaseAttributeValue<AttributeValueKind.DyanmicString>;

export type SlotAttributeValue = Statement &
  BaseAttributeValue<AttributeValueKind.Slot>;

export type AttributeValue =
  | StringAttributeValue
  | SlotAttributeValue
  | DynamicStringAttributeValue;

export type Fragment = {
  value: string;
  children: Node[];
  location: SourceLocation;
} & BaseNode<NodeKind.Fragment>;

export type Slot = {
  script: Statement;
  location: SourceLocation;
} & BaseNode<NodeKind.Slot>;

export type Node = Text | Element | StyleElement | Fragment | Slot;
export type Expression = Node | Attribute | AttributeValue | StyleExpression;

const a: AttributeValue = null;
export const getImports = (ast: Node): Element[] =>
  getChildrenByTagName("import", ast).filter(child => {
    return hasAttribute("src", child);
  });

export const getRelativeFilePath = fs => (
  fromFilePath: string,
  importFilePath: string
) => {
  const logicPath = resolveImportFile(fs)(fromFilePath, importFilePath);
  let relativePath = path.relative(path.dirname(fromFilePath), logicPath);
  if (relativePath.charAt(0) !== ".") {
    relativePath = `./${relativePath}`;
  }
  return relativePath;
};

export const getImportIds = (ast: Node): string[] =>
  getImports(ast)
    .map(node => getAttributeStringValue(AS_ATTR_NAME, node))
    .filter(Boolean) as string[];

export const getImportById = (id: string, ast: Node): Element | null =>
  getImports(ast).find(imp => {
    return getAttributeStringValue(AS_ATTR_NAME, imp) === id;
  });

export const getChildren = (ast: Node): Node[] => {
  if (ast.kind === NodeKind.Element || ast.kind === NodeKind.Fragment) {
    return ast.children;
  }
  return [];
};

export const getStyleScopes = fs => (ast: Node, uri: string): string[] => {
  const scopes: string[] = [];
  if (getStyleElements(ast).length > 0) {
    scopes.push(crc32(uri));
  }

  // don't do this -- want usage to be explicit.
  // for (const imp of getImports(ast)) {
  //   const src = getAttributeStringValue("src", imp);
  //   if (/\.css$/.test(src)) {
  //     const cssFileUri = resolveImportFile(fs)(uri, src);
  //     scopes.push(crc32(cssFileUri));
  //   }
  // }

  return scopes;
};

export const getChildrenByTagName = (tagName: string, parent: Node) =>
  getChildren(parent).filter(child => {
    return child.kind === NodeKind.Element && child.tagName === tagName;
  }) as Element[];

export const findByNamespace = (
  namespace: string,
  current: Node,
  allChildrenByNamespace: Element[] = []
) => {
  if (current.kind === NodeKind.Element) {
    if (current.tagName.split(".")[0] === namespace) {
      allChildrenByNamespace.push(current);
    }
  }
  for (const child of getChildren(current)) {
    findByNamespace(namespace, child, allChildrenByNamespace);
  }
  return allChildrenByNamespace;
};

export const getMetaValue = (name: string, root: Node) => {
  const metaElement = getChildrenByTagName("meta", root).find(
    meta =>
      hasAttribute("src", meta) &&
      getAttributeStringValue("name", meta) === name
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
  (node.kind === NodeKind.Element && isVisibleElement(node));

export const getVisibleChildNodes = (ast: Node): Node[] =>
  getChildren(ast).filter(isVisibleNode);

export const getParts = (ast: Node): Element[] =>
  getChildren(ast).filter(child => {
    return (
      child.kind === NodeKind.Element &&
      hasAttribute("component", child) &&
      hasAttribute(AS_ATTR_NAME, child)
    );
  }) as Element[];

export const getPartIds = (ast: Node): string[] =>
  getParts(ast)
    .map(node => getAttributeStringValue(AS_ATTR_NAME, node))
    .filter(Boolean) as string[];

export const getDefaultPart = (ast: Node): Element =>
  getParts(ast).find(
    part => getAttributeStringValue(AS_ATTR_NAME, part) === DEFAULT_PART_ID
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

  for (const child of getChildren(node)) {
    flattenNodes(child, _allNodes);
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

export const getMixins = (ast: Node): Record<string, MixinRule> => {
  const styles = getStyleElements(ast);
  let mixins: Record<string, MixinRule> = {};
  for (const style of styles) {
    traverseSheet(style.sheet, rule => {
      if (isRule(rule) && rule.kind === RuleKind.Mixin) {
        mixins[rule.name.value] = rule;
      }
    });
  }

  return mixins;
};

export const isNode = (ast: Expression): ast is Node =>
  NodeKind[(ast as Node).kind] != null;
export const isAttribute = (ast: Expression): ast is Attribute =>
  AttributeKind[(ast as Attribute).kind] != null;
export const isAttributeValue = (ast: Expression): ast is AttributeValue =>
  AttributeValueKind[(ast as AttributeValue).attrValueKind] != null;

export const traverseExpression = (
  ast: Expression,
  each: (node: Expression) => void | boolean
) => {
  if (each(ast) === false) {
    return false;
  }
  if (isNode(ast)) {
    switch (ast.kind) {
      case NodeKind.Element: {
        return (
          traverseExpressions(ast.attributes, each) &&
          traverseExpressions(ast.children, each)
        );
      }
      case NodeKind.Fragment: {
        return traverseExpressions(ast.children, each);
      }
      case NodeKind.StyleElement: {
        return traverseSheet(ast.sheet, each);
      }
    }
  }
  return true;
};

export const getCompletionItems = (root: Expression, position: number) => {
  let parent: Expression;
  let previousSibling: Expression;
  traverseExpression(root, expr => {
    if (!expr.location) {
      console.error("ERRRR", expr);
    }
  });
};

const traverseExpressions = (
  expressions: Expression[],
  each: (node: Expression) => void | boolean
) => {
  for (const child of expressions) {
    if (!traverseExpression(child, each)) {
      return false;
    }
  }
  return true;
};
export const getNestedReferences = (
  node: Node,
  _statements: [Reference, string][] = []
): [Reference, string][] => {
  if (node.kind === NodeKind.Slot) {
    maybeAddReference(node.script, _statements);
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
        hasAttribute(PREVIEW_ATTR_NAME, child)
      ) {
        continue;
      }
      getNestedReferences(child, _statements);
    }
  }
  return _statements;
};
