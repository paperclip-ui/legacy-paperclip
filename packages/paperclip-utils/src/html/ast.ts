import {
  ScriptExpression,
  ScriptExpressionKind,
  Reference,
  traverseJSExpression,
} from "../script/ast";
import {
  Sheet,
  traverseSheet,
  MixinRule,
  RuleKind,
  isRule,
  StyleExpression,
} from "../css/ast";
import { BasicRaws, StringRange } from "../base/ast";
import { flattenTreeNode, getNodePath, getTreeNodeMap } from "./tree";
import * as crc32 from "crc32";
import { resolveImportFile } from "../core/resolve";
import * as path from "path";
import {
  LOGIC_TAG_NAME,
  DEFAULT_PART_ID,
  AS_ATTR_NAME,
  PREVIEW_ATTR_NAME,
} from "../core/constants";
import { memoize } from "../core/memo";
import { DependencyGraph, DependencyNodeContent } from "../core/graph";
import { StringLiteral } from "../core/ast";

export enum NodeKind {
  Fragment = "Fragment",
  Text = "Text",
  Annotation = "Annotation",
  Comment = "Comment",
  Element = "Element",
  StyleElement = "StyleElement",
  Slot = "Slot",
}

export type BaseNode<TKind extends NodeKind> = {
  id: string;
  nodeKind: TKind;
};

// TODO - include location here.
export type Text = StringLiteral & BaseNode<NodeKind.Text>;

export type Annotation = {
  properties: AnnotationProperty[];
  range: StringRange;
} & BaseNode<NodeKind.Annotation>;

export declare type Comment = {
  raws: BasicRaws;
  value: string;
  annotation: Annotation;
  range: StringRange;
} & BaseNode<NodeKind.Comment>;

export enum AnnotationPropertyKind {
  Text = "Text",
  Declaration = "Declaration",
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
  value: ScriptExpression;
  raws: BasicRaws;
} & BaseAnnotationProperty<AnnotationPropertyKind.Declaration>;

export type AnnotationProperty = TextAnnotation | DeclarationAnnotation;

export type ElementRaws = {
  before: string;
};

export type Element = {
  id: string;
  range: StringRange;
  raws: ElementRaws;

  // TODO - change this to OpenTag. Don't keep location here
  openTagRange: StringRange;

  // TODO - change this to ElementTagName. name should go in value
  tagNameRange: StringRange;
  tagName: string;
  attributes: Attribute[];
  value: string;
  children: Node[];
} & BaseNode<NodeKind.Element>;

export type StyleElement = {
  sheet: Sheet;
  range: StringRange;
  raws: BasicRaws;
} & BaseNode<NodeKind.StyleElement>;

export enum AttributeKind {
  ShorthandAttribute = "ShorthandAttribute",
  KeyValueAttribute = "KeyValueAttribute",
  SpreadAttribute = "SpreadAttribute",
  PropertyBoundAttribute = "PropertyBoundAttribute",
}

type BaseAttribute<TKind extends AttributeKind> = {
  attrKind: TKind;
};

type ShorthandAttribute = {
  id: string;
  reference: ScriptExpression;
  range: StringRange;
} & BaseAttribute<AttributeKind.ShorthandAttribute>;

type SpreadAttribute = {
  id: string;
  script: ScriptExpression;
  range: StringRange;
} & BaseAttribute<AttributeKind.SpreadAttribute>;

type KeyValueAttribute = {
  id: string;
  name: string;
  value?: AttributeValue;
  range: StringRange;
} & BaseAttribute<AttributeKind.KeyValueAttribute>;

export type PropertyBoundAttribute = {
  id: string;
  name: string;
  bindingName: string;
  value: AttributeValue;
  range: StringRange;
} & BaseAttribute<AttributeKind.PropertyBoundAttribute>;

export type Attribute =
  | ShorthandAttribute
  | SpreadAttribute
  | KeyValueAttribute
  | PropertyBoundAttribute;

export enum AttributeValueKind {
  DyanmicString = "DyanmicString",
  String = "String",
  Slot = "Slot",
}

export type BaseAttributeValue<TKind extends AttributeValueKind> = {
  id: string;
  attrValueKind: TKind;
};

export type StringAttributeValue = StringLiteral &
  BaseAttributeValue<AttributeValueKind.String>;

export enum DynamicStringAttributeValuePartKind {
  Literal = "Literal",
  ClassNamePierce = "ClassNamePierce",
  Slot = "Slot",
}

type BaseDynamicStringAttributeValuePart<
  TPartKind extends DynamicStringAttributeValuePartKind
> = {
  id: string;
  partKind: TPartKind;
};

type DynamicStringLiteralPart = {
  range: StringRange;
  value: string;
} & BaseDynamicStringAttributeValuePart<DynamicStringAttributeValuePartKind.Literal>;

type DynamicStringClassNamePiercePart = {
  range: StringRange;
  className: string;
} & BaseDynamicStringAttributeValuePart<DynamicStringAttributeValuePartKind.ClassNamePierce>;

type DynamicStringSlotPart = ScriptExpression &
  BaseDynamicStringAttributeValuePart<DynamicStringAttributeValuePartKind.Slot>;

export type DynamicStringAttributeValuePart =
  | DynamicStringLiteralPart
  | DynamicStringClassNamePiercePart
  | DynamicStringSlotPart;

export type DynamicStringAttributeValue = {
  values: DynamicStringAttributeValuePart[];
  range: StringRange;
} & BaseAttributeValue<AttributeValueKind.DyanmicString>;

export type SlotAttributeValue = {
  script: ScriptExpression;
  range: StringRange;
} & BaseAttributeValue<AttributeValueKind.Slot>;

export type AttributeValue =
  | StringAttributeValue
  | SlotAttributeValue
  | DynamicStringAttributeValue;

export type Fragment = {
  value: string;
  children: Node[];
  range: StringRange;
} & BaseNode<NodeKind.Fragment>;

export type Slot = {
  script: ScriptExpression;
  range: StringRange;
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
  | ScriptExpression
  | DynamicStringAttributeValuePart
  | StringLiteral;

export enum RootExpressionKind {
  String = "String",
  Node = "Node",
  Attribute = "Attribute",
  CSS = "CSS",
  Script = "Script",
}

type BaseRootExpression<TKind extends RootExpressionKind> = {
  pcObjectKind: TKind;
};

export type RootString = StringLiteral &
  BaseRootExpression<RootExpressionKind.String>;
export type RootNode = Node & BaseRootExpression<RootExpressionKind.Node>;
export type RootAttribute = Node &
  BaseRootExpression<RootExpressionKind.Attribute>;
export type RootCSS = StyleExpression &
  BaseRootExpression<RootExpressionKind.CSS>;
export type RootScript = ScriptExpression &
  BaseRootExpression<RootExpressionKind.Script>;
export type RootExpression =
  | RootString
  | RootNode
  | RootCSS
  | RootScript
  | RootAttribute;

const a: AttributeValue = null;
export const getImports = (ast: Node): Element[] =>
  getChildrenByTagName("import", ast).filter((child) => {
    return hasAttribute("src", child);
  });

export const getRelativeFilePath =
  (fs) => (fromFilePath: string, importFilePath: string) => {
    const logicPath = resolveImportFile(fs)(fromFilePath, importFilePath);
    let relativePath = path.relative(path.dirname(fromFilePath), logicPath);
    if (relativePath.charAt(0) !== ".") {
      relativePath = `./${relativePath}`;
    }
    return relativePath;
  };

export const getImportIds = (ast: Node): string[] =>
  getImports(ast)
    .map((node) => getAttributeStringValue(AS_ATTR_NAME, node))
    .filter(Boolean) as string[];

export const getImportById = (id: string, ast: Node): Element | null =>
  getImports(ast).find((imp) => {
    return getAttributeStringValue(AS_ATTR_NAME, imp) === id;
  });

export const getImportBySrc = (src: string, ast: Node): Element | null =>
  getImports(ast).find((imp) => {
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
  getChildren(parent).filter((child) => {
    return child.nodeKind === NodeKind.Element && child.tagName === tagName;
  }) as Element[];

export const findByNamespace = (
  namespace: string,
  current: Node | ScriptExpression,
  allChildrenByNamespace: Element[] = []
) => {
  if (isNode(current)) {
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
            attribute.value.script.scriptKind === ScriptExpressionKind.Node
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
    if (current.nodeKind === NodeKind.Slot) {
      findByNamespace(namespace, current.script, allChildrenByNamespace);
    }
  } else if (isScriptExpression(current)) {
    if (current.scriptKind === ScriptExpressionKind.Conjunction) {
      findByNamespace(namespace, current.left, allChildrenByNamespace);
      findByNamespace(namespace, current.right, allChildrenByNamespace);
    }
  }

  return allChildrenByNamespace;
};

export const getMetaValue = (name: string, root: Node) => {
  const metaElement = getChildrenByTagName("meta", root).find(
    (meta) =>
      hasAttribute("src", meta) &&
      getAttributeStringValue("name", meta) === name
  );
  return metaElement && getAttributeStringValue("content", metaElement);
};

export const getAttribute = (name: string, element: Element) =>
  element.attributes.find((attr) => {
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

  traverseExpression(ast, null, (node: Node) => {
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

export const isImport = (node: Node): node is Element =>
  node.nodeKind === NodeKind.Element &&
  node.tagName === "import" &&
  hasAttribute("src", node);
export const getParts = (ast: Node): Element[] =>
  getChildren(ast).filter(isComponent) as Element[];

export const getPartIds = (ast: Node): string[] =>
  getParts(ast)
    .map((node) => getAttributeStringValue(AS_ATTR_NAME, node))
    .filter(Boolean) as string[];

export const getDefaultPart = (ast: Node): Element =>
  getParts(ast).find(
    (part) => getAttributeStringValue(AS_ATTR_NAME, part) === DEFAULT_PART_ID
  );

export const getLogicElement = (ast: Node): Element | null => {
  return getChildren(ast).find(
    (child) =>
      child.nodeKind === NodeKind.Element && child.tagName === LOGIC_TAG_NAME
  ) as Element;
};

export const hasAttribute = (name: string, element: Element) =>
  getAttribute(name, element) != null;

// https://github.com/crcn/tandem/blob/10.0.0/packages/common/src/state/tree.ts#L137

// TODO
export const getParentNode = (node: Node, root: Node) => {
  const nodePath = getNodePath(node, root).split(".");
  nodePath.pop();
  const map = getTreeNodeMap(root);
  return map[nodePath.join(".")] as Fragment | Element;
};

export const getPCNodeAnnotations = (node: Node, root: Node) => {
  const parent = getParentNode(node, root);
  const prevChild = parent.children[parent.children.indexOf(node) - 1];

  if (prevChild?.nodeKind === NodeKind.Comment) {
    return prevChild;
  }

  return null;
};

export const getNodeById = memoize((nodeId: string, root: Node) => {
  return flattenTreeNode(root).find((desc) => desc.id === nodeId);
});

export const isComponentInstance = (
  node: Expression,
  root: Node
): node is Element => {
  if (!isNode(node) || node.nodeKind !== NodeKind.Element) {
    return false;
  }
  const importIds = getImportIds(root);
  const internalComponents = getComponentMap(root);

  return (
    importIds.includes(node.tagName.split(".").shift()) ||
    internalComponents[node.tagName] != null
  );
};

export const getDocumentComponents = (root: Node) =>
  (root.nodeKind === NodeKind.Fragment ? root.children : [root]).filter(
    isComponent
  );

export const getComponentMap = memoize(
  (root: Node): Record<string, Element> =>
    getDocumentComponents(root).reduce((map, element) => {
      map[getAttributeStringValue("as", element)] = element;
      return map;
    }, {})
);

export const getInstanceComponentInfo = (
  instance: Element,
  uri: string,
  graph: DependencyGraph
): [string, Element] => {
  const entry = graph[uri];

  const components = getComponentMap(entry.content as DependencyNodeContent);

  if (components[instance.tagName]) {
    const component = components[instance.tagName];

    return [uri, component];
  } else {
    const parts = instance.tagName.split(".");
    const depUri = entry.dependencies[parts.shift()];
    if (!depUri) {
      return null;
    }
    const dep = graph[depUri];
    const component = getComponentMap(dep.content as DependencyNodeContent)[
      parts.shift() || "default"
    ];
    return [depUri, component];
  }
};

const maybeAddReference = (
  stmt: ScriptExpression,
  _statements: [Reference, string][] = []
) => {
  if (stmt.scriptKind === ScriptExpressionKind.Reference) {
    _statements.push([stmt, null]);
  }
};

export const getMixins = (ast: Node): Record<string, MixinRule> => {
  const styles = getStyleElements(ast);
  const mixins: Record<string, MixinRule> = {};
  for (const style of styles) {
    traverseSheet(style.sheet, style, (rule) => {
      if (rule && isRule(rule) && rule.ruleKind === RuleKind.Mixin) {
        mixins[rule.name.value] = rule;
      }
    });
  }

  return mixins;
};

export const getASTParentChildMap = memoize(
  (ast: Expression): Record<string, Expression> => {
    const childParentMap = {};
    traverseExpression(ast, null, (expr, owner) => {
      childParentMap[expr.id] = owner;
    });
    return childParentMap;
  }
);

export const getASTParent = (ast: Expression, root: Expression): Expression => {
  return getASTParentChildMap(root)[ast.id];
};

export const getASTAncestors = memoize(
  (ast: Expression, root: Expression): Expression[] => {
    let curr = ast;
    const map = getASTParentChildMap(root);
    const ancestors = [];

    while (curr) {
      curr = map[curr.id];
      if (curr) {
        ancestors.push(curr);
      }
    }

    return ancestors;
  }
);

export const isNode = (ast: Expression): ast is Node =>
  NodeKind[(ast as Node).nodeKind] != null;
export const isAttribute = (ast: Expression): ast is Attribute =>
  AttributeKind[(ast as Attribute).attrKind] != null;
export const isAttributeValue = (ast: Expression): ast is AttributeValue =>
  AttributeValueKind[(ast as AttributeValue).attrValueKind] != null;

export const isScriptExpression = (ast: Expression): ast is ScriptExpression =>
  ScriptExpressionKind[(ast as ScriptExpression).scriptKind] != null;
export const isDynamicStringAttributeValuePart = (
  ast: Expression
): ast is DynamicStringAttributeValuePart =>
  DynamicStringAttributeValuePartKind[
    (ast as DynamicStringAttributeValuePart).partKind
  ] != null;

export const traverseExpression = (
  ast: Expression,
  owner: Expression,
  each: (node: Expression, parent: Expression) => void | boolean
) => {
  if (each(ast, owner) === false) {
    return false;
  }
  if (isNode(ast)) {
    switch (ast.nodeKind) {
      case NodeKind.Element: {
        return (
          traverseExpressions(ast.attributes, ast, each) &&
          traverseExpressions(ast.children, ast, each)
        );
      }
      case NodeKind.Fragment: {
        return traverseExpressions(ast.children, ast, each);
      }
      case NodeKind.Slot: {
        return traverseJSExpression(ast.script, ast, each);
      }
      case NodeKind.StyleElement: {
        return traverseSheet(ast.sheet, ast, each);
      }
    }
  } else if (isAttribute(ast)) {
    if (ast.attrKind === AttributeKind.KeyValueAttribute && ast.value) {
      return traverseExpression(ast.value, ast, each);
    }
  } else if (isAttributeValue(ast)) {
    if (ast.attrValueKind === AttributeValueKind.Slot) {
      return traverseJSExpression(ast.script, ast, each);
    }
  }
  return true;
};

const traverseExpressions = (
  expressions: Expression[],
  owner: Expression,
  each: (node: Expression, parent: Expression) => void | boolean
) => {
  for (const child of expressions) {
    if (!traverseExpression(child, owner, each)) {
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
          if (attr.value.script.scriptKind === ScriptExpressionKind.Node) {
            getNestedReferences(attr.value.script, _statements);
          } else if (
            attr.value.script.scriptKind === ScriptExpressionKind.Reference
          ) {
            _statements.push([attr.value.script, attr.name]);
          }
        } else if (
          attr.attrKind === AttributeKind.ShorthandAttribute &&
          attr.reference.scriptKind === ScriptExpressionKind.Reference
        ) {
          _statements.push([attr.reference, attr.reference[0]]);
        } else if (
          attr.attrKind === AttributeKind.SpreadAttribute &&
          attr.script.scriptKind === ScriptExpressionKind.Reference
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
