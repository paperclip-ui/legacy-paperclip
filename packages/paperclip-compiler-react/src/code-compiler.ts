import * as fs from "fs";
import {
  Node,
  getImports,
  NodeKind,
  Attribute,
  Reference,
  DEFAULT_PART_ID,
  getDefaultPart,
  getLogicElement,
  PropertyBoundAttribute,
  getAllVirtSheetClassNames,
  Statement,
  EXPORT_TAG_NAME,
  StatementKind,
  getAttributeStringValue,
  getVisibleChildNodes,
  Slot,
  AttributeValue,
  AttributeKind,
  AttributeValueKind,
  isVisibleNode,
  getImportIds,
  getPartIds,
  Element,
  getStyleScopes,
  resolveImportFile,
  getRelativeFilePath,
  FRAGMENT_TAG_NAME,
  getParts,
  findByNamespace,
  hasAttribute,
  getAttribute,
  VirtSheet,
  DynamicStringAttributeValuePartKind,
  ReferencePart,
  isVisibleElement,
  stringifyCSSSheet,
  AS_ATTR_NAME
} from "paperclip";
import {
  createTranslateContext,
  TranslateContext,
  startBlock,
  endBlock,
  addBuffer
} from "./translate-utils";
import {
  Options,
  getComponentName,
  RENAME_PROPS,
  REV_PROP,
  getClassExportNameMap,
  getPartClassName,
  strToClassName,
  pascalCase,
  classNameToStyleName
} from "./utils";
import { camelCase } from "lodash";
import * as path from "path";
import { Html5Entities } from "html-entities";
import * as crc32 from "crc32";
import { Context } from "paperclip/src";

const entities = new Html5Entities();
type Config = { ast: Node; sheet?: any; classNames: string[] };

export const compile = (
  { ast, sheet, classNames }: Config,
  filePath: string,
  options: Options = {}
) => {
  let context = createTranslateContext(
    filePath,
    getImportIds(ast),
    classNames,
    getPartIds(ast),
    getStyleScopes(fs)(ast, filePath),
    Boolean(getLogicElement(ast)),
    options
  );
  context = translateRoot(ast, sheet, classNames, context);
  return context.buffer;
};

const translateRoot = (
  ast: Node,
  sheet: any,
  classNames: string[],
  context: TranslateContext
) => {
  context = translateImports(ast, context);
  if (sheet) {
    context = translateStyleSheet(sheet, context);
  }

  context = translateClassNames(classNames, context);

  const logicElement = getLogicElement(ast);
  if (logicElement) {
    const src = getAttributeStringValue("src", logicElement);
    if (src) {
      const logicRelativePath = getRelativeFilePath(fs)(context.filePath, src);
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

const translateStyleSheet = (sheet: VirtSheet, context: TranslateContext) => {
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
  context = addBuffer(`document.head.appendChild(style);\n`, context);
  context = endBlock(context);
  context = addBuffer("}\n\n", context);

  return context;
};

const translateClassNames = (
  classNames: string[],
  context: TranslateContext
) => {
  const classNameMap = getClassExportNameMap(classNames);

  context = addBuffer(`export const classNames = {\n`, context);
  context = startBlock(context);
  for (const exportName in classNameMap) {
    context = addBuffer(
      `${JSON.stringify(exportName)}: ${JSON.stringify(
        classNameMap[exportName]
      )},\n`,
      context
    );
  }
  context = endBlock(context);
  context = addBuffer(`};\n\n`, context);
  return context;
};

const translateUtils = (ast: Node, context: TranslateContext) => {
  // context = translateStyleDataAttributes(context);
  // context = translateStyledUtil(ast, context);
  context = translateGetDefaultUtil(ast, context);

  // KEEP ME: for logic
  // context = translateExtendsPropsUtil(ast, context);
  return context;
};

const translateStyleDataAttributes = (context: TranslateContext) => {
  context = addBuffer(`export const scopedStyleProps = {\n`, context);
  context = startBlock(context);
  context = translateStyleScopeAttributes(context, "\n");
  context = endBlock(context);
  context = addBuffer(`};\n\n`, context);
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

const translateGetDefaultUtil = (ast: Node, context: TranslateContext) => {
  context = addBuffer(
    `const getDefault = (module) => module.default || module;\n\n`,
    context
  );
  return context;
};

// const translateStyledUtil = (ast: Node, context: TranslateContext) => {
//   context = addBuffer(
//     `export const styled = (tagName, defaultProps) => `,
//     context
//   );
//   context = addBuffer(`(props) => (\n`, context);
//   context = startBlock(context);
//   context = addBuffer(
//     `React.createElement(tagName, Object.assign({}, scopedStyleProps, defaultProps, props))\n`,
//     context
//   );
//   context = endBlock(context);
//   context = addBuffer(");\n\n", context);
//   return context;
// };

const translateImports = (ast: Node, context: TranslateContext) => {
  context = addBuffer(`import * as React from "react";\n`, context);

  const imports = getImports(ast);
  for (const imp of imports) {
    const id = getAttributeStringValue(AS_ATTR_NAME, imp);
    const src = getAttributeStringValue("src", imp);

    if (!src) {
      continue;
    }

    let relativePath = path
      .relative(
        path.dirname(context.filePath),
        resolveImportFile(fs)(context.filePath, src)
      )
      .replace(/\\/g, "/");

    if (relativePath.charAt(0) !== ".") {
      relativePath = `./${relativePath}`;
    }

    if (id) {
      const parts = getParts(ast);

      let usingDefault = false;
      const usedExports = [];

      for (const part of parts) {
        for (const usedElement of findByNamespace(id, part)) {
          if (usedElement.tagName === id) {
            usingDefault = true;
          } else {
            usedExports.push(usedElement.tagName.split(".")[1]);
          }
        }
      }

      if (usingDefault || usedExports.length) {
        context = addBuffer(`import `, context);
        const baseName = pascalCase(id);
        if (usingDefault) {
          context = addBuffer(`${baseName}`, context);
        }

        if (usedExports.length) {
          if (usingDefault) {
            context = addBuffer(`, `, context);
          }
          context = addBuffer(
            `{${usedExports
              .map(imp => {
                const className = strToClassName(imp, context.filePath);
                return `${className} as ${baseName}${pascalCase(className)}`;
              })
              .join(", ")}} `,
            context
          );
        }

        context = addBuffer(` from "${relativePath}";\n`, context);
      } else {
        context = addBuffer(`import "${relativePath}";\n`, context);
      }
    } else {
      context = addBuffer(`import "${relativePath}";\n`, context);
    }
  }
  context = addBuffer("\n", context);
  return context;
};

const translateParts = (root: Node, context: TranslateContext) => {
  for (const part of getParts(root)) {
    // already compiled
    if (getAttributeStringValue(AS_ATTR_NAME, part) === DEFAULT_PART_ID) {
      continue;
    }
    context = translatePart(part, context);
  }
  return context;
};

const translatePart = (part: Element, context: TranslateContext) => {
  const componentName = strToClassName(
    getAttributeStringValue(AS_ATTR_NAME, part),
    context.filePath
  );
  context = translateComponent(
    componentName,
    part,
    hasAttribute(EXPORT_TAG_NAME, part),
    context
  );
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

  context = addBuffer(`return `, context);
  context = translateJSXRoot(node, context);
  context = endBlock(context);
  context = addBuffer(";\n", context);

  context = addBuffer(`});\n\n`, context);

  if (node.kind === NodeKind.Element) {
    // context = addBuffer(`${componentName}.styledComponentId = "${getElementStyleName(node, context)}";\n\n`, context);
  }
  return context;
};

const translateDefaultView = (root: Node, context: TranslateContext) => {
  const target = getDefaultPart(root);

  if (!target) {
    return context;
  }

  const componentName = getComponentName(context.filePath);
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
    if (node.kind === NodeKind.Element && node.tagName === FRAGMENT_TAG_NAME) {
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
  return parts.length > 1 ? parts.join("") : `${parts[0]}`;
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
  } else if (node.kind === NodeKind.Text) {
    let buffer = `${JSON.stringify(entities.decode(node.value))}`;
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
  const [namespace] = element.tagName.split(".");

  const isImportComponentInstance = context.importIds.indexOf(namespace) !== -1;
  const isPartComponentInstance = context.partIds.indexOf(namespace) !== -1;
  const isComponentInstance =
    isImportComponentInstance || isPartComponentInstance;
  const propsName = null;

  // KEEP ME: for logic
  // const propsName = id
  //   ? `props.${camelCase(id)}Props`
  //   : isComponentInstance
  //   ? `props.${camelCase(element.tagName)}Props`
  //   : null;

  const tag = isPartComponentInstance
    ? strToClassName(element.tagName, context.filePath)
    : isImportComponentInstance
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
  const propertyBoundAttributes = collectPropertyBoundAttributes(element);
  const addedAttrs = {};
  for (const attr of element.attributes) {
    context = translateAttribute(
      element,
      attr,
      isComponentInstance,
      propertyBoundAttributes,
      context,
      addedAttrs
    );
  }

  for (const attrName in propertyBoundAttributes) {
    if (!addedAttrs[attrName] && !addedAttrs[RENAME_PROPS[attrName]]) {
      const name = RENAME_PROPS[attrName] || attrName;
      context = addBuffer(`"${name}": ""`, context);

      context = addPropertyBoundAttribute(
        element,
        name,
        isComponentInstance,
        propertyBoundAttributes,
        context
      );
      context = addBuffer(`,\n`, context);
    }
  }

  // if (
  //   !hasAttribute("className", element) &&
  //   !hasAttribute("class", element) &&
  //   hasAttribute(AS_ATTR_NAME, element)
  // ) {
  //   context = addBuffer(
  //     `"className": "${getElementStyleName(element, context)}",\n`,
  //     context
  //   );
  // }

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

const getElementStyleName = (element: Element, context: TranslateContext) => {
  return `__${crc32(context.filePath)}__${getPartClassName(
    element,
    context.filePath
  )}`;
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

const collectPropertyBoundAttributes = (element: Element) =>
  element.attributes.reduce((record, attr) => {
    if (attr.kind === AttributeKind.PropertyBoundAttribute) {
      if (!record[attr.name]) {
        record[attr.name] = [];
      }
      record[attr.name].push(attr);
    }
    return record;
  }, {}) as Record<string, PropertyBoundAttribute[]>;

const prepPropertyBoundAttribute = (
  name: string,
  propertyBoundAttributes: Record<string, PropertyBoundAttribute[]>,
  context: TranslateContext
) => {
  const boundAttributes =
    propertyBoundAttributes[name] || propertyBoundAttributes[REV_PROP[name]];

  if (boundAttributes) {
    // prefix with string just for casting.
    context = addBuffer('"" + ', context);
  }

  return context;
};

const addPropertyBoundAttribute = (
  element: Element,
  name: string,
  isComponentInstance: boolean,
  propertyBoundAttributes: Record<string, PropertyBoundAttribute[]>,
  context: TranslateContext
) => {
  const boundAttributes =
    propertyBoundAttributes[name] || propertyBoundAttributes[REV_PROP[name]];

  if (boundAttributes) {
    for (const pba of boundAttributes) {
      context = addBuffer(" + (", context);
      context = addBuffer(
        `props.${camelCase(pba.bindingName)} ? " " + `,
        context
      );
      if (pba.value) {
        context = translateAttributeValue(
          element,
          name,
          pba.value,
          !isComponentInstance,
          context
        );
      } else {
        context = addBuffer(JSON.stringify(pba.bindingName), context);
      }
      context = addBuffer(` : ""`, context);
      context = addBuffer(")", context);
    }
  }

  return context;
};

const translateAttribute = (
  element: Element,
  attr: Attribute,
  isComponentInstance: boolean,
  propertyBoundAttributes: Record<string, PropertyBoundAttribute[]>,
  context: TranslateContext,
  added: Record<string, boolean>
) => {
  if (attr.kind === AttributeKind.KeyValueAttribute) {
    // maintain exact key if component instance
    let name = isComponentInstance
      ? attr.name
      : RENAME_PROPS[attr.name] || attr.name;
    let value = attr.value;

    if (name === "string") {
      console.warn("Can't handle style tag for now");
    }

    if (/^(component|export|as)$/.test(name)) {
      return context;
    }

    // can't handle for now
    if (name !== "style") {
      if (!/^data-/.test(name)) {
        name = camelCase(name);
      }
      context = addBuffer(`${JSON.stringify(name)}: `, context);

      added[name] = true;

      context = prepPropertyBoundAttribute(
        name,
        propertyBoundAttributes,
        context
      );

      context = translateAttributeValue(
        element,
        name,
        value,
        !isComponentInstance,
        context
      );

      context = addPropertyBoundAttribute(
        element,
        name,
        isComponentInstance,
        propertyBoundAttributes,
        context
      );

      context = addBuffer(`,\n`, context);
    }
  } else if (attr.kind === AttributeKind.ShorthandAttribute) {
    const property = (attr.reference as Reference).path[0];
    added[property.name] = true;

    let value = `${context.scopes[property.name] ? "" : "props."}${camelCase(
      property.name
    )}`;

    if (!isComponentInstance && !isSpecialPropName(property.name)) {
      // everything must be a string
      value = `(${value} ? String(${value}) : null)`;
    }
    context = addBuffer(`${JSON.stringify(property.name)}:`, context);
    context = prepPropertyBoundAttribute(
      property.name,
      propertyBoundAttributes,
      context
    );

    context = addBuffer(`${value}`, context);
    context = addPropertyBoundAttribute(
      element,
      property.name,
      isComponentInstance,
      propertyBoundAttributes,
      context
    );

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
  element: Element,
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
      value.script,
      false,
      isPropOnNativeElement && !isSpecialPropName(name),
      context
    );
  } else if (value.attrValueKind === AttributeValueKind.String) {
    let strValue = JSON.stringify(value.value);
    if (name === "src") {
      strValue = `getDefault(require(${strValue}))`;
    }

    if (name === "className") {
      strValue = prefixWthStyleScopes(value.value, context.styleScopes);
      if (hasAttribute(AS_ATTR_NAME, element)) {
        strValue += " " + getElementStyleName(element, context);
      }
      strValue = JSON.stringify(strValue);
    }
    return addBuffer(strValue, context);
  } else if (value.attrValueKind === AttributeValueKind.DyanmicString) {
    if (hasAttribute(AS_ATTR_NAME, element)) {
      context = addBuffer(
        `"${getElementStyleName(element, context)} " + `,
        context
      );
    }

    for (let i = 0, { length } = value.values; i < length; i++) {
      const part = value.values[i];
      if (part.partKind === DynamicStringAttributeValuePartKind.Literal) {
        context = addBuffer(
          JSON.stringify(
            name === "className"
              ? prefixWthStyleScopes(part.value, context.styleScopes)
              : part.value
          ),
          context
        );
      } else if (
        part.partKind === DynamicStringAttributeValuePartKind.ClassNamePierce
      ) {
        context = addBuffer(
          `"${prefixWthStyleScopes(part.className, context.styleScopes)}"`,
          context
        );
      } else if (part.partKind === DynamicStringAttributeValuePartKind.Slot) {
        context = translateStatment(part, false, false, context);
      }

      if (i < length - 1) {
        context = addBuffer(" + ", context);
      }
    }

    return context;
  }

  return context;
};

const prefixWthStyleScopes = (value: string, styleScopes: string[]) => {
  return value
    .split(" ")
    .map(className => {
      // skip just whitespace
      if (!/\w+/.test(className)) return className;
      return (
        styleScopes.map(scope => `_${scope}_${className}`).join(" ") +
        " " +
        className
      );
    })
    .join(" ");
};

const translateSlot = (slot: Slot, context: TranslateContext) => {
  return translateStatment(slot.script, true, false, context);
};

const translateReferencePath = (
  path: ReferencePart[],
  context: TranslateContext,
  min: number = -1
) => {
  // webpack trips over this statement without parens -- tries
  // to evaluate it.
  context = addBuffer(`(props`, context);
  for (let i = 0, n = path.length; i < n; i++) {
    const part = path[i];
    context = addBuffer(`.${part.name}`, context);
    if (part.optional && i > min) {
      context = addBuffer(` && `, context);
      context = translateReferencePath(path, context, i);
      break;
    }
  }
  context = addBuffer(")", context);
  return context;
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

    if (!context.scopes[statement.path[0].name]) {
      context = translateReferencePath(statement.path, context);
    }

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
