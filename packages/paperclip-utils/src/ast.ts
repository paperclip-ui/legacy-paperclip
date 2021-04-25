import { JsExpression, JsExpressionKind, Reference } from "./js-ast";
import {
  Sheet,
  traverseSheet,
  MixinRule,
  RuleKind,
  isRule,
  StyleExpression
} from "./css-ast";
import { BasicRaws, SourceLocation } from "./base-ast";
import * as crc32 from "crc32";
import { resolveImportFile } from "./resolve";
import * as path from "path";
import {
  LOGIC_TAG_NAME,
  DEFAULT_PART_ID,
  AS_ATTR_NAME,
  PREVIEW_ATTR_NAME
} from "./constants";
import { memoize } from "./memo";

export enum NodeKind {
  Fragment = "Fragment",
  Text = "Text",
  Annotation = "Annotation",
  Comment = "Comment",
  Element = "Element",
  StyleElement = "StyleElement",
  Slot = "Slot"
}

export type BaseNode<TKind extends NodeKind> = {
  nodeKind: TKind;
};

// TODO - include location here.
export type Text = {
  value: string;
  location: SourceLocation;
} & BaseNode<NodeKind.Text>;

export type Annotation = {
  properties: AnnotationProperty[];
  location: SourceLocation;
} & BaseNode<NodeKind.Annotation>;

export declare type Comment = {
  raws: BasicRaws;
  value: string;
  annotation: Annotation;
  location: SourceLocation;
} & BaseNode<NodeKind.Comment>;

export enum AnnotationPropertyKind {
  Text = "Text",
  Declaration = "Declaration"
}

type BaseAnnotationProperty<TKind extends AnnotationPropertyKind> = {
  kind: TKind;
};

export type TextAnnotation = {
  value: string;
  raws: BasicRaws;
} & BaseAnnotationProperty<AnnotationPropertyKind.Text>;

export type DeclarationAnnotation = {
  name: string;
  value: JsExpression;
  raws: BasicRaws;
} & BaseAnnotationProperty<AnnotationPropertyKind.Declaration>;

export type AnnotationProperty = TextAnnotation | DeclarationAnnotation;

export type ElementRaws = {
  before: string;
};

export type Element = {
  id: string;
  location: SourceLocation;
  raws: ElementRaws;

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
  raws: BasicRaws;
} & BaseNode<NodeKind.StyleElement>;

export enum AttributeKind {
  ShorthandAttribute = "ShorthandAttribute",
  KeyValueAttribute = "KeyValueAttribute",
  SpreadAttribute = "SpreadAttribute",
  PropertyBoundAttribute = "PropertyBoundAttribute"
}

type BaseAttribute<TKind extends AttributeKind> = {
  attrKind: TKind;
};

type ShorthandAttribute = {
  reference: JsExpression;
  location: SourceLocation;
} & BaseAttribute<AttributeKind.ShorthandAttribute>;

type SpreadAttribute = {
  script: JsExpression;
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
  location: SourceLocation;
  value: string;
} & BaseDynamicStringAttributeValuePart<
  DynamicStringAttributeValuePartKind.Literal
>;

type DynamicStringClassNamePiercePart = {
  location: SourceLocation;
  className: string;
} & BaseDynamicStringAttributeValuePart<
  DynamicStringAttributeValuePartKind.ClassNamePierce
>;

type DynamicStringSlotPart = JsExpression &
  BaseDynamicStringAttributeValuePart<DynamicStringAttributeValuePartKind.Slot>;

export type DynamicStringAttributeValuePart =
  | DynamicStringLiteralPart
  | DynamicStringClassNamePiercePart
  | DynamicStringSlotPart;

export type DynamicStringAttributeValue = {
  values: DynamicStringAttributeValuePart[];
  location: SourceLocation;
} & BaseAttributeValue<AttributeValueKind.DyanmicString>;

export type SlotAttributeValue = {
  script: JsExpression;
  location: SourceLocation;
} & BaseAttributeValue<AttributeValueKind.Slot>;

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
  script: JsExpression;
  location: SourceLocation;
  raws: BasicRaws;
} & BaseNode<NodeKind.Slot>;

export type Node =
  | Text
  | Element
  | StyleElement
  | Fragment
  | Slot
  | Annotation
  | Comment;
export type Expression =
  | Node
  | Attribute
  | AttributeValue
  | StyleExpression
  | JsExpression
  | DynamicStringAttributeValuePart;

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

export const getImportBySrc = (src: string, ast: Node): Element | null =>
  getImports(ast).find(imp => {
    return getAttributeStringValue("src", imp) === src;
  });

export const getChildren = (ast: Node): Node[] => {
  if (ast.nodeKind === NodeKind.Element || ast.nodeKind === NodeKind.Fragment) {
    return ast.children;
  }
  return [];
};

export const getStyleScopeId = (filePath: string) => {
  if (filePath.indexOf("file://") !== 0) {
    filePath = "file://" + filePath;
  }
  return crc32(filePath);
};

export const getChildrenByTagName = (tagName: string, parent: Node) =>
  getChildren(parent).filter(child => {
    return child.nodeKind === NodeKind.Element && child.tagName === tagName;
  }) as Element[];

export const findByNamespace = (
  namespace: string,
  current: Node,
  allChildrenByNamespace: Element[] = []
) => {
  if (current.nodeKind === NodeKind.Element) {
    if (current.tagName.split(".")[0] === namespace) {
      allChildrenByNamespace.push(current);
    }
  }
  for (const child of getChildren(current)) {
    findByNamespace(namespace, child, allChildrenByNamespace);
  }

  if (current.nodeKind === NodeKind.Element) {
    for (const attribute of current.attributes) {
      if (
        attribute.attrKind === AttributeKind.KeyValueAttribute &&
        attribute.value
      ) {
        if (
          attribute.value.attrValueKind === AttributeValueKind.Slot &&
          attribute.value.script.jsKind === JsExpressionKind.Node
        ) {
          findByNamespace(
            namespace,
            attribute.value.script,
            allChildrenByNamespace
          );
        }
      }
    }
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
    return (
      attr.attrKind === AttributeKind.KeyValueAttribute && attr.name === name
    );
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

export const getStyleElements = (ast: Node): StyleElement[] => {
  const styleElements: StyleElement[] = [];

  traverseExpression(ast, (node: Node) => {
    if (node.nodeKind === NodeKind.StyleElement) {
      styleElements.push(node);
    }
  });

  return styleElements;
};

export const isVisibleElement = (ast: Element): boolean => {
  return !/^(import|logic|meta|style|part|preview)$/.test(ast.tagName);
};
export const isVisibleNode = (node: Node): boolean =>
  node.nodeKind === NodeKind.Text ||
  node.nodeKind === NodeKind.Fragment ||
  node.nodeKind === NodeKind.Slot ||
  (node.nodeKind === NodeKind.Element && isVisibleElement(node));

export const getVisibleChildNodes = (ast: Node): Node[] =>
  getChildren(ast).filter(isVisibleNode);

export const isComponent = (node: Node): node is Element =>
  node.nodeKind === NodeKind.Element &&
  hasAttribute("component", node) &&
  hasAttribute(AS_ATTR_NAME, node);

export const getParts = (ast: Node): Element[] =>
  getChildren(ast).filter(isComponent) as Element[];

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
    child =>
      child.nodeKind === NodeKind.Element && child.tagName === LOGIC_TAG_NAME
  ) as Element;
};

export const hasAttribute = (name: string, element: Element) =>
  getAttribute(name, element) != null;

// https://github.com/crcn/tandem/blob/10.0.0/packages/common/src/state/tree.ts#L137
export const flattenTreeNode = memoize((current: Node): Node[] => {
  const treeNodeMap = getTreeNodeMap(current);
  return Object.values(treeNodeMap) as Node[];
});

export const getNodePath = memoize((node: Node, root: Node) => {
  const map = getTreeNodeMap(root);
  for (const path in map) {
    const c = map[path];
    if (c === node) return path;
  }
});

// TODO
export const getParentNode = (node: Node, root: Node) => {
  const nodePath = getNodePath(node, root).split(".");
  nodePath.pop();
  const map = getTreeNodeMap(root);
  return map[nodePath.join(".")] as Fragment | Element;
};

export const getTreeNodeMap = memoize(
  (current: Node, path = "0"): Record<string, Node> => {
    const map = {
      [path]: current
    };
    if (
      current.nodeKind === NodeKind.Fragment ||
      current.nodeKind === NodeKind.Element
    ) {
      Object.assign(
        map,
        ...current.children.map((child, i) =>
          getTreeNodeMap(child, path + "." + i)
        )
      );
    }
    return map;
  }
);

export const isComponentInstance = (
  node: Node,
  importIds: string[]
): node is Element => {
  return (
    node.nodeKind === NodeKind.Element &&
    importIds.indexOf(node.tagName.split(".").shift()) !== -1
  );
};

const maybeAddReference = (
  stmt: JsExpression,
  _statements: [Reference, string][] = []
) => {
  if (stmt.jsKind === JsExpressionKind.Reference) {
    _statements.push([stmt, null]);
  }
};

export const getMixins = (ast: Node): Record<string, MixinRule> => {
  const styles = getStyleElements(ast);
  const mixins: Record<string, MixinRule> = {};
  for (const style of styles) {
    traverseSheet(style.sheet, rule => {
      if (rule && isRule(rule) && rule.ruleKind === RuleKind.Mixin) {
        mixins[rule.name.value] = rule;
      }
    });
  }

  return mixins;
};

export const isNode = (ast: Expression): ast is Node =>
  NodeKind[(ast as Node).nodeKind] != null;
export const isAttribute = (ast: Expression): ast is Attribute =>
  AttributeKind[(ast as Attribute).attrKind] != null;
export const isAttributeValue = (ast: Expression): ast is AttributeValue =>
  AttributeValueKind[(ast as AttributeValue).attrValueKind] != null;

export const isJsExpression = (ast: Expression): ast is JsExpression =>
  JsExpressionKind[(ast as JsExpression).jsKind] != null;
export const isDynamicStringAttributeValuePart = (
  ast: Expression
): ast is DynamicStringAttributeValuePart =>
  DynamicStringAttributeValuePartKind[
    (ast as DynamicStringAttributeValuePart).partKind
  ] != null;

export const traverseExpression = (
  ast: Expression,
  each: (node: Expression) => void | boolean
) => {
  if (each(ast) === false) {
    return false;
  }
  if (isNode(ast)) {
    switch (ast.nodeKind) {
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
  if (node.nodeKind === NodeKind.Slot) {
    maybeAddReference(node.script, _statements);
  } else {
    if (node.nodeKind === NodeKind.Element) {
      for (const attr of node.attributes) {
        if (
          attr.attrKind == AttributeKind.KeyValueAttribute &&
          attr.value &&
          attr.value.attrValueKind === AttributeValueKind.Slot
        ) {
          if (attr.value.script.jsKind === JsExpressionKind.Node) {
            getNestedReferences(attr.value.script, _statements);
          } else if (attr.value.script.jsKind === JsExpressionKind.Reference) {
            _statements.push([attr.value.script, attr.name]);
          }
        } else if (
          attr.attrKind === AttributeKind.ShorthandAttribute &&
          attr.reference.jsKind === JsExpressionKind.Reference
        ) {
          _statements.push([attr.reference, attr.reference[0]]);
        } else if (
          attr.attrKind === AttributeKind.SpreadAttribute &&
          attr.script.jsKind === JsExpressionKind.Reference
        ) {
          _statements.push([attr.script, attr.script[0]]);
        }
      }
    }

    for (const child of getChildren(node)) {
      if (
        child.nodeKind === NodeKind.Element &&
        hasAttribute(PREVIEW_ATTR_NAME, child)
      ) {
        continue;
      }
      getNestedReferences(child, _statements);
    }
  }
  return _statements;
};
