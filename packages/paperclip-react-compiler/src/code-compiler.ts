import {
  Node,
  getImports,
  NodeKind,
  Attribute,
  Reference,
  DEFAULT_PART_ID,
  getDefaultPart,
  getLogicElement,
  Statement,
  PART_TAG_NAME,
  NO_COMPILE_TAG_NAME,
  BlockKind,
  PREVIEW_TAG_NAME,
  ConditionalBlockKind,
  StatementKind,
  getAttributeStringValue,
  getVisibleChildNodes,
  Slot,
  Block,
  EachBlock,
  AttributeValue,
  AttributeKind,
  AttributeValueKind,
  isVisibleNode,
  getImportIds,
  Element,
  getStyleScopes,
  resolveImportFile,
  getRelativeFilePath,
  Sheet,
  getParts,
  hasAttribute,
  PassFailConditional,
  FinalConditional,
  isVisibleElement,
  stringifyCSSSheet
} from "paperclip";
import {
  createTranslateContext,
  TranslateContext,
  startBlock,
  endBlock,
  addBuffer
} from "./translate-utils";
import { pascalCase, Options, getComponentName, RENAME_PROPS } from "./utils";
import { camelCase } from "lodash";
import * as path from "path";

export const compile = (
  { ast, sheet }: { ast: Node; sheet?: any },
  filePath: string,
  options: Options = {}
) => {
  let context = createTranslateContext(
    filePath,
    getImportIds(ast),
    getStyleScopes(ast, filePath),
    Boolean(getLogicElement(ast)),
    options
  );
  context = translateRoot(ast, sheet, context);
  return context.buffer;
};

const translateRoot = (ast: Node, sheet: any, context: TranslateContext) => {
  context = translateImports(ast, context);
  if (sheet) {
    context = translateStyleSheet(sheet, context);
  }
  const logicElement = getLogicElement(ast);
  if (logicElement) {
    const src = getAttributeStringValue("src", logicElement);
    if (src) {
      const logicRelativePath = getRelativeFilePath(context.filePath, src);
      context = addBuffer(
        `const logic = require("${logicRelativePath}");\n`,
        context
      );
      context = addBuffer(
        `const enhanceView = logic.default || logic;\n\n`,
        context
      );
    }
  }
  context = translateUtils(ast, context);
  context = translateParts(ast, context);
  context = translateDefaultView(ast, context);
  return context;
};

const translateStyleSheet = (sheet: Sheet, context: TranslateContext) => {
  if (!sheet.rules.length) {
    return context;
  }
  context = addBuffer(`if (typeof document !== "undefined") {\n`, context);
  context = startBlock(context);
  context = addBuffer(
    `const style = document.createElement("style");\n`,
    context
  );
  context = addBuffer(
    `style.textContent = ${JSON.stringify(
      stringifyCSSSheet(sheet, null).replace(/[\s\r\n\t]+/g, " ")
    )};\n`,
    context
  );
  context = addBuffer(`document.body.appendChild(style);\n`, context);
  context = endBlock(context);
  context = addBuffer("}\n\n", context);
  return context;
};

const translateUtils = (ast: Node, context: TranslateContext) => {
  context = translateStyledUtil(ast, context);

  // KEEP ME: for logic
  // context = translateExtendsPropsUtil(ast, context);
  return context;
};

const translateStyleScopeAttributes = (
  context: TranslateContext,
  newLine: string = ""
) => {
  for (let i = 0, { length } = context.styleScopes; i < length; i++) {
    const scope = context.styleScopes[i];
    context = addBuffer(`"data-pc-${scope}": true,${newLine}`, context);
  }
  return context;
};
const translateExtendsPropsUtil = (ast: Node, context: TranslateContext) => {
  context = addBuffer(
    `const extendProps = (defaultProps, extender) => {\n`,
    context
  );
  context = startBlock(context);

  context = addBuffer(
    `return typeof extender === 'function' ? extender(defaultProps) : Object.assign(defaultProps, extender);\n`,
    context
  );
  context = endBlock(context);

  context = addBuffer(`};\n\n`, context);
  return context;
};
const translateStyledUtil = (ast: Node, context: TranslateContext) => {
  context = addBuffer(
    `export function styled(tagName, defaultProps) {\n`,
    context
  );
  context = startBlock(context);
  context = addBuffer(`return function(props) {\n`, context);
  context = startBlock(context);
  context = addBuffer(
    `return React.createElement(tagName, Object.assign({ `,
    context
  );
  context = translateStyleScopeAttributes(context, " ");
  context = addBuffer(`}, defaultProps, props));\n`, context);
  context = endBlock(context);
  context = addBuffer(`};\n`, context);
  context = endBlock(context);
  context = addBuffer("}\n\n", context);
  return context;
};

const translateImports = (ast: Node, context: TranslateContext) => {
  context = addBuffer(`const React = require("react");\n`, context);

  const imports = getImports(ast);
  for (const imp of imports) {
    const id = getAttributeStringValue("id", imp);
    const src = getAttributeStringValue("src", imp);

    if (!src) {
      continue;
    }

    let relativePath = path.relative(
      path.dirname(context.filePath),
      resolveImportFile(context.filePath, src)
    );

    if (relativePath.charAt(0) !== ".") {
      relativePath = `./${relativePath}`;
    }

    if (id) {
      context = addBuffer(
        `import ${pascalCase(id)} from "${relativePath}";\n`,
        context
      );
    } else {
      context = addBuffer(`import "${relativePath}";\n`, context);
    }
  }
  context = addBuffer("\n", context);
  return context;
};

const translateParts = (root: Node, context: TranslateContext) => {
  for (const part of getParts(root)) {
    if (hasAttribute(NO_COMPILE_TAG_NAME, part)) {
      continue;
    }

    // already compiled
    if (getAttributeStringValue("id", part) === DEFAULT_PART_ID) {
      continue;
    }
    context = translatePart(part, context);
  }
  return context;
};

const translatePart = (part: Element, context: TranslateContext) => {
  const componentName = pascalCase(getAttributeStringValue("id", part));
  context = translateComponent(componentName, part, true, context);
  return context;
};

const translateComponent = (
  componentName: string,
  node: Node,
  shouldExport: boolean,
  context: TranslateContext
) => {
  context = startBlock(
    addBuffer(
      `${
        shouldExport ? "export " : ""
      }const ${componentName} = React.memo(function ${componentName}(props) {\n`,
      context
    )
  );

  context = addBuffer(`console.log('render ${componentName}');\n `, context);
  context = addBuffer(`return `, context);
  context = translateJSXRoot(node, context);
  context = endBlock(context);
  context = addBuffer(";\n", context);
  context = addBuffer(`});\n\n`, context);
  return context;
};

const translateDefaultView = (root: Node, context: TranslateContext) => {
  const target = getDefaultPart(root) || root;

  const visibleChildren = getVisibleChildNodes(target);
  if (!visibleChildren.length) {
    return context;
  }

  const componentName = getComponentName(root, context.filePath);
  context = translateComponent(componentName, target, false, context);

  // KEEP ME: needed for logic
  // if (context.hasLogicFile) {
  //   context = addBuffer(
  //     `${componentName} = enhanceView(${componentName});\n`,
  //     context
  //   );
  // }
  context = addBuffer(`export default ${componentName};\n`, context);

  return context;
};

const translateJSXRoot = (node: Node, context: TranslateContext) => {
  if (node.kind !== NodeKind.Fragment) {
    if (node.kind === NodeKind.Element && node.tagName === PART_TAG_NAME) {
      return translateFragment(getVisibleChildNodes(node), true, context);
    } else {
      return translateJSXNode(node, true, context);
    }
  }
  const visibleNodes = getVisibleChildNodes(node);

  if (visibleNodes.length === 1) {
    return translateJSXNode(visibleNodes[0], true, context);
  } else {
    context = translateFragment(visibleNodes, true, context);
  }

  return context;
};

const getImportTagName = (tagName: string) => {
  const parts = tagName.split(".").map(pascalCase);
  return parts.length > 1 ? `${parts[0]}.default` : parts.join(".");
};

const translateJSXNode = (
  node: Node,
  isRoot: boolean,
  context: TranslateContext
) => {
  if (node.kind === NodeKind.Fragment) {
    context = translateFragment(node.children, isRoot, context);
  } else if (node.kind === NodeKind.Element && isVisibleElement(node)) {
    context = translateElement(node, isRoot, context);
  } else if (node.kind === NodeKind.Block) {
    context = translateBlock(node, isRoot, context);
  } else if (node.kind === NodeKind.Text) {
    let buffer = `${JSON.stringify(node.value)}`;
    if (isRoot) {
      buffer = `React.createElement("span", null, ${buffer})`;
    }
    context = addBuffer(buffer, context);
  } else if (node.kind === NodeKind.Slot) {
    context = translateSlot(node, context);
  }

  return context;
};

const translateElement = (
  element: Element,
  isRoot: boolean,
  context: TranslateContext
) => {
  const isComponentInstance = context.importIds.indexOf(element.tagName) !== -1;
  const id = getAttributeStringValue("id", element);
  const propsName = null;

  // KEEP ME: for logic
  // const propsName = id
  //   ? `props.${camelCase(id)}Props`
  //   : isComponentInstance
  //   ? `props.${camelCase(element.tagName)}Props`
  //   : null;
  const tag = isComponentInstance
    ? getImportTagName(element.tagName)
    : JSON.stringify(element.tagName);

  context = addBuffer(`React.createElement(${tag}, `, context);

  if (propsName) {
    context = addBuffer(`extendProps(`, context);
  }
  context = addBuffer(`{\n`, context);
  context = startBlock(context);
  context = startBlock(context);
  context = translateStyleScopeAttributes(context, "\n");
  context = addBuffer(
    `"key": ${JSON.stringify(String(context.keyCount++))}${
      context.currentIndexKey ? ` + ${context.currentIndexKey}` : ""
    },\n`,
    context
  );
  for (const attr of element.attributes) {
    context = translateAttribute(attr, isComponentInstance, context);
  }
  context = endBlock(context);
  context = addBuffer(`}`, context);
  if (propsName) {
    context = addBuffer(`, ${propsName})`, context);
  }
  context = endBlock(context);
  if (element.children.length) {
    context = addBuffer(`,\n`, context);
    context = translateChildren(element.children, false, context);
  } else {
    context = addBuffer(`\n`, context);
  }
  context = addBuffer(`)`, context);
  return context;
};

const translateBlock = (
  node: Block,
  isRoot: boolean,
  context: TranslateContext
) => {
  switch (node.blockKind) {
    case BlockKind.Each:
      return translateEachBlock(node, context);
    case BlockKind.Conditional:
      return translateConditionalBlock(node, context);
  }
};

const translateEachBlock = (
  { source, body, keyName, valueName }: EachBlock,
  context: TranslateContext
) => {
  context = addBuffer(`(`, context);
  context = translateStatment(source, false, false, context);
  const key = String(keyName || `$$index${context.keyCount++}`);
  context = addBuffer(`).map(function(${valueName}, ${key}) {\n`, context);
  context = startBlock(context);
  context = addBuffer(`return `, context);
  context = translateJSXNode(body, false, {
    ...context,
    currentIndexKey: key,
    scopes: {
      ...context.scopes,
      [valueName]: true
    }
  });
  context = { ...context, currentIndexKey: null };
  context = addBuffer(`;\n`, context);
  context = endBlock(context);
  context = addBuffer(`})`, context);
  return context;
};

const translateConditionalBlock = (
  node: PassFailConditional | FinalConditional,
  context: TranslateContext
) => {
  if (node.conditionalBlockKind === ConditionalBlockKind.PassFailBlock) {
    context = addBuffer(`(`, context);
    context = translateStatment(node.condition, false, false, context);
    context = addBuffer(` ? `, context);
    context = translateJSXNode(node.body, false, context);
    context = addBuffer(` : `, context);
    if (node.fail) {
      context = translateConditionalBlock(node.fail, context);
    } else {
      context = addBuffer("null", context);
    }
    context = addBuffer(`)`, context);
    return context;
  } else {
    return translateJSXNode(node.body, false, context);
  }
};

const translateFragment = (
  children: Node[],
  isRoot: boolean,
  context: TranslateContext
) => {
  if (children.length === 1) {
    return translateJSXNode(children[0], isRoot, context);
  }
  context = addBuffer(`[\n`, context);

  context = translateChildren(children, false, context);
  context = addBuffer(`]`, context);
  return context;
};

const translateChildren = (
  children: Node[],
  isRoot: boolean,
  context: TranslateContext
) => {
  context = startBlock(context);

  context = children
    .filter(isVisibleNode)
    .reduce((newContext, child, index, children) => {
      newContext = translateJSXNode(child, isRoot, newContext);
      if (index < children.length - 1) {
        newContext = addBuffer(",\n", newContext);
      }
      return newContext;
    }, context);
  context = endBlock(context);

  if (children.length) {
    context = addBuffer("\n", context);
  }
  return context;
};

const isSpecialPropName = (name: string) =>
  /^on/.test(name) || name === "checked";

const translateAttribute = (
  attr: Attribute,
  isComponentInstance: boolean,
  context: TranslateContext
) => {
  if (attr.kind === AttributeKind.KeyValueAttribute) {
    let name = RENAME_PROPS[attr.name] || attr.name;
    let value = attr.value;

    if (name === "string") {
      console.warn("Can't handle style tag for now");
    }

    // can't handle for now
    if (name !== "style") {
      context = addBuffer(`${JSON.stringify(camelCase(name))}: `, context);
      context = translateAttributeValue(
        name,
        value,
        !isComponentInstance,
        context
      );
      context = addBuffer(`,\n`, context);
    }
  } else if (attr.kind === AttributeKind.ShorthandAttribute) {
    const keyValue = (attr.reference as Reference).path[0];

    let value = `${context.scopes[keyValue] ? "" : "props."}${camelCase(
      keyValue
    )}`;

    if (!isComponentInstance && !isSpecialPropName(keyValue)) {
      // everything must be a string
      value = `${value} ? String(${value}) : null`;
    }

    context = addBuffer(`${JSON.stringify(keyValue)}: ${value}`, context);
    context = addBuffer(`,\n`, context);
  } else if (attr.kind === AttributeKind.SpreadAttribute) {
    context = addBuffer(`...(`, context);
    context = translateStatment(attr.script, false, false, context);
    context = addBuffer(`)`, context);

    context = addBuffer(`,\n`, context);
  }

  return context;
};

const translateAttributeValue = (
  name: string,
  value: AttributeValue,
  isPropOnNativeElement: boolean,
  context: TranslateContext
) => {
  if (!value) {
    return addBuffer("true", context);
  }
  if (value.attrValueKind === AttributeValueKind.Slot) {
    return translateStatment(
      (value as any) as Statement,
      false,
      isPropOnNativeElement && !isSpecialPropName(name),
      context
    );
  } else if (value.attrValueKind === AttributeValueKind.String) {
    let strValue = JSON.stringify(value.value);
    if (name === "src") {
      strValue = `require(${strValue}).default`;
    }
    return addBuffer(strValue, context);
  }

  return context;
};

const translateSlot = (slot: Slot, context: TranslateContext) => {
  return translateStatment(slot.script, true, false, context);
};

const translateStatment = (
  statement: Statement,
  isRoot: boolean,
  shouldStringifyProp: boolean,
  context: TranslateContext
) => {
  if (statement.jsKind === StatementKind.Reference) {
    if (shouldStringifyProp) {
      context = translateStatment(statement, isRoot, false, context);
      context = addBuffer(" ? String(", context);
    }

    context = addBuffer(
      `${
        context.scopes[statement.path[0]] ? "" : "props."
      }${statement.path.join(".")}`,
      context
    );

    if (shouldStringifyProp) {
      context = addBuffer(") : null", context);
    }

    return context;
  } else if (statement.jsKind === StatementKind.Node) {
    return translateJSXNode((statement as any) as Node, isRoot, context);
  } else if (statement.jsKind === StatementKind.Array) {
    context = addBuffer(`[\n`, context);
    context = startBlock(context);
    for (const value of statement.values) {
      context = translateStatment(value, false, false, context);
      context = addBuffer(`,\n`, context);
    }
    context = endBlock(context);
    context = addBuffer(`]`, context);
  } else if (statement.jsKind === StatementKind.Object) {
    context = addBuffer(`{\n`, context);
    context = startBlock(context);
    for (const { key, value } of statement.properties) {
      context = addBuffer(`${JSON.stringify(key)}:`, context);
      context = translateStatment(value, false, false, context);
      context = addBuffer(`,\n`, context);
    }
    context = endBlock(context);
    context = addBuffer(`}`, context);
  } else if (
    statement.jsKind === StatementKind.Number ||
    statement.jsKind === StatementKind.String ||
    statement.jsKind === StatementKind.Boolean
  ) {
    return addBuffer(String(statement.value), context);
  }

  return context;
};
