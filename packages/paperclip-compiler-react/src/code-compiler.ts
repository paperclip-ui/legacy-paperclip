import * as fs from "fs";
import * as crc32 from "crc32";
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
  JsExpression,
  EXPORT_TAG_NAME,
  JsExpressionKind,
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
  getStyleScopeId,
  resolveImportFile,
  getRelativeFilePath,
  FRAGMENT_TAG_NAME,
  getParts,
  JsConjunctionOperatorKind,
  findByNamespace,
  hasAttribute,
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
  strToClassName,
  pascalCase
} from "./utils";
import { camelCase, uniq } from "lodash";
import * as path from "path";
import { Html5Entities } from "html-entities";
import { ClassNameExport } from "paperclip";
import { connect } from "http2";

const entities = new Html5Entities();
type Config = {
  ast: Node;
  sheet?: any;
  sheetRelativeFilePath?: string;
  classNames: Record<string, ClassNameExport>;
};

export const compile = (
  { ast, sheet, classNames, sheetRelativeFilePath }: Config,
  fileUri: string,
  options: Options = {},
  fileSystem: any = fs 
): string => {
  const imports = getImports(ast).reduce((record, element) => {
    const _as = getAttributeStringValue(AS_ATTR_NAME, element);
    const _src = getAttributeStringValue("src", element);
    if (_as) {
      record[_as] = resolveImportFile(fileSystem)(fileUri, _src, true) || _src;
    }
    return record;
  }, {});
  let context = createTranslateContext(
    fileUri,
    getImportIds(ast),
    imports,
    classNames,
    sheetRelativeFilePath,
    getPartIds(ast),
    Boolean(getLogicElement(ast)),
    options,
    "  ",
    fileSystem
  );
  context = translateRoot(ast, sheet, classNames, context);
  return context.buffer;
};

const translateRoot = (
  ast: Node,
  sheet: any,
  classNames: Record<string, ClassNameExport>,
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
      const logicRelativePath = getRelativeFilePath(context.fileSystem)(context.fileUri, src);
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
  context = addBuffer(
    `if (typeof document !== "undefined" && typeof window !== "undefined") {\n`,
    context
  );
  context = startBlock(context);
  context = addBuffer(
    `const style = document.createElement("style");\n`,
    context
  );
  context = addBuffer(
    `style.textContent = ${JSON.stringify(
      stringifyCSSSheet(sheet).replace(/[\s\r\n\t]+/g, " ")
    )};\n`,
    context
  );
  context = addBuffer(`document.head.appendChild(style);\n`, context);
  context = endBlock(context);
  context = addBuffer("}\n\n", context);

  return context;
};

const translateClassNames = (
  classNames: Record<string, ClassNameExport>,
  context: TranslateContext
) => {
  context = addModuleVariant(
    `export const classNames = {\n`,
    `exports.classNames = {\n`,
    context
  );
  context = startBlock(context);
  for (const exportName in classNames) {
    const info = classNames[exportName];
    if (!info.public) {
      continue;
    }
    context = addBuffer(
      `${JSON.stringify(exportName)}: ${JSON.stringify(
        info.scopedName + " " + info.name
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
  context = translateGetDefaultUtil(context);
  context = translateAddClassUtil(context);
  context = translateCastStyleUtil(context);
  context = translateClassNamesUtil(context);

  // KEEP ME: for logic
  // context = translateExtendsPropsUtil(ast, context);
  return context;
};

const translateStyleScopeAttributes = (
  element: Element,
  context: TranslateContext,
  newLine = ""
) => {
  context = addBuffer(
    `"data-pc-${getElementScopeId(element, context.fileUri)}": true,\n` +
      `"data-pc-${getStyleScopeId(context.fileUri)}": true,${newLine}`,
    context
  );
  return context;
};

const getElementScopeId = (element: Element, contextUri: string) =>
  crc32(`${getStyleScopeId(contextUri)}${element.id}`);
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

const translateGetDefaultUtil = (context: TranslateContext) => {
  context = addBuffer(
    `const getDefault = (module) => module.default || module;\n\n`,
    context
  );
  return context;
};

const translateAddClassUtil = (context: TranslateContext) => {
  context = addBuffer(
    `const addClass = (className, properties) => ({\n`,
    context
  );

  context = startBlock(context);
  context = addBuffer(`...properties,\n`, context);
  context = addBuffer(
    `className: properties.className ? properties.className + " " + className : className,\n`,
    context
  );
  context = endBlock(context);
  context = addBuffer(`});\n\n`, context);

  return context;
};

const translateCastStyleUtil = (context: TranslateContext) => {
  context = addBuffer(`const castStyle = (value) => {\n`, context);
  context = startBlock(context);
  context = addBuffer(`const tov = typeof value;\n`, context);
  context = addBuffer(
    `if (tov === "object" || tov !== "string") return value;\n`,
    context
  );
  context = addBuffer(
    `return value.trim().split(";").reduce((obj, keyValue) => {\n`,
    context
  );
  context = startBlock(context);
  context = addBuffer(`const [key, value] = keyValue.split(":");\n`, context);
  context = addBuffer(
    `if (!value || value === "undefined") return obj;\n`,
    context
  );
  context = addBuffer(`const trimmedValue = value.trim();\n`, context);

  // partially https://github.com/crcn/paperclip/issues/336
  context = addBuffer(
    `if (trimmedValue === "undefined") return obj;\n`,
    context
  );
  context = addBuffer(`obj[key.trim()] = value && value.trim();\n`, context);
  context = addBuffer(`return obj;\n`, context);
  context = endBlock(context);
  context = addBuffer(`}, {});\n`, context);
  context = endBlock(context);
  context = addBuffer(`};\n\n`, context);
  return context;
};

const translateClassNamesUtil = (context: TranslateContext) => {
  context = addBuffer(`const getClassName = (className) => {\n`, context);
  context = startBlock(context);
  // context = addBuffer(`return classNames.map(className => {\n`, context);
  // context = startBlock(context);
  context = addBuffer(
    `return className ? "_${getStyleScopeId(
      context.fileUri
    )}_" + className + " " + className : "";\n`,
    context
  );
  // context = endBlock(context);
  // context = addBuffer(`}).join(" ");\n`, context);
  context = endBlock(context);
  context = addBuffer(`};\n\n`, context);

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

const addModuleVariant = (
  es6Variant: string,
  commonJSVariant: string,
  context: TranslateContext
) => {
  if (context.args.module === "commonjs") {
    return addBuffer(commonJSVariant, context);
  } else {
    return addBuffer(es6Variant, context);
  }
};

const addImportFrom = (modulePath: string, context: TranslateContext) => {
  if (context.args.module === "commonjs") {
    return addBuffer(` = require("${modulePath}");\n`, context);
  } else {
    return addBuffer(` from "${modulePath}";\n`, context);
  }
};

const addNSImport = (
  namespace: string,
  modulePath: string,
  context: TranslateContext
) => {
  context = addModuleVariant(
    `import * as ${namespace}`,
    `const ${namespace}`,
    context
  );
  context = addImportFrom(modulePath, context);
  return context;
};

const stringifyImportDefinition = (
  imp: string,
  sep: string,
  prefix: string,
  context: TranslateContext
) => {
  const className = strToClassName(imp, context.fileUri);

  return `${className}${sep}_${crc32(context.fileUri)}_${prefix}${pascalCase(
    className
  )}`;
};

const translateImports = (ast: Node, context: TranslateContext) => {
  context = addNSImport("React", "react", context);

  const imports = getImports(ast);
  for (const imp of imports) {
    const id = getAttributeStringValue(AS_ATTR_NAME, imp);
    const src = getAttributeStringValue("src", imp);

    if (!src) {
      continue;
    }

    let relativePath = path
      .relative(
        path.dirname(context.fileUri),
        resolveImportFile(context.fileSystem)(context.fileUri, src, true) || src
      )
      .replace(/\\/g, "/");

    if (relativePath.charAt(0) !== ".") {
      relativePath = `./${relativePath}`;
    }

    if (id) {
      const parts = getParts(ast);

      let usingDefault = false;
      let usedExports = [];

      for (const part of parts) {
        for (const usedElement of findByNamespace(id, part)) {
          if (usedElement.tagName === id) {
            usingDefault = true;
          } else {
            usedExports.push(usedElement.tagName.split(".")[1]);
          }
        }
      }

      usedExports = uniq(usedExports);

      if (usingDefault || usedExports.length) {
        context = addModuleVariant(`import `, `const `, context);
        // context = addBuffer(`import `, context);
        const baseName = pascalCase(id);

        if (context.args.module === "commonjs") {
          context = addBuffer(`{`, context);
          if (usingDefault) {
            context = addBuffer(`default: ${baseName}, `, context);
          }
          context = addBuffer(
            usedExports
              .map(imp => {
                return stringifyImportDefinition(imp, ": ", baseName, context);
              })
              .join(", "),
            context
          );
          context = addBuffer(`}`, context);
        } else {
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
                  return stringifyImportDefinition(
                    imp,
                    " as ",
                    baseName,
                    context
                  );
                })
                .join(", ")}} `,
              context
            );
          }
        }

        context = addModuleVariant(
          ` from "${relativePath}";\n`,
          ` = require("${relativePath}");\n`,
          context
        );
      } else {
        context = addModuleVariant(
          `import "${relativePath}";\n`,
          `require("${relativePath}");\n`,
          context
        );
      }
    } else {
      context = addModuleVariant(
        `import "${relativePath}";\n`,
        `require("${relativePath}");\n`,
        context
      );
    }
  }

  if (context.sheetRelativeFilePath) {
    context = addModuleVariant(
      `import "${context.sheetRelativeFilePath}";\n`,
      `require("${context.sheetRelativeFilePath}");\n`,
      context
    );
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
    context.fileUri
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
      `const ${componentName} = React.memo(React.forwardRef(function ${componentName}(props, ref) {\n`,
      context
    )
  );

  context = addBuffer(`return `, context);
  context = translateJSXRoot(node, context);
  context = endBlock(context);
  context = addBuffer(";\n", context);

  context = addBuffer(`}));\n`, context);

  if (shouldExport) {
    context = addModuleVariant(
      `export { ${componentName} };\n\n`,
      `exports.${componentName} = ${componentName};\n\n`,
      context
    );
  } else {
    context = addBuffer(`\n`, context);
  }

  return context;
};

const translateDefaultView = (root: Node, context: TranslateContext) => {
  const target = getDefaultPart(root);

  if (!target) {
    return context;
  }

  const componentName = getComponentName(context.fileUri);
  context = translateComponent(componentName, target, false, context);

  // KEEP ME: needed for logic
  // if (context.hasLogicFile) {
  //   context = addBuffer(
  //     `${componentName} = enhanceView(${componentName});\n`,
  //     context
  //   );
  // }

  context = addModuleVariant(
    `export default ${componentName};\n`,
    `exports.default = ${componentName};\n`,
    context
  );

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

const getImportTagName = (tagName: string, context: TranslateContext) => {
  const parts = tagName.split(".").map(pascalCase);
  return parts.length > 1
    ? `_${crc32(context.fileUri)}_${parts.join("")}`
    : `${parts[0]}`;
};

const translateJSXNode = (
  node: Node,
  isRoot: boolean,
  context: TranslateContext
) => {
  if (
    node.kind === NodeKind.Fragment ||
    (node.kind === NodeKind.Element && node.tagName === FRAGMENT_TAG_NAME)
  ) {
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

const containsStyleElement = (element: Element) =>
  element.children.some(child => child.kind === NodeKind.StyleElement);

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
  const tag = isPartComponentInstance
    ? strToClassName(element.tagName, context.fileUri)
    : isImportComponentInstance
    ? getImportTagName(element.tagName, context)
    : JSON.stringify(element.tagName);

  context = addBuffer(
    `React.createElement(${
      isComponentInstance ? tag : "props.tagName || " + tag
    }, `,
    context
  );

  const _containsStyleElement = containsStyleElement(element);
  const shouldAddElementScopeClass =
    _containsStyleElement && isComponentInstance;

  // a wee-bit easier to use a utility class for attaching classes since it doesn't require any fancy logic to handle
  // things like spread operators
  if (shouldAddElementScopeClass) {
    context = addBuffer(
      `addClass("_${getElementScopeId(element, context.fileUri)}",`,
      context
    );
  }

  context = addBuffer(`{\n`, context);
  context = startBlock(context);
  context = startBlock(context);
  context = translateStyleScopeAttributes(element, context, "\n");
  if (isRoot) {
    context = addBuffer(`"ref": ref,\n`, context);
  }
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

  context = endBlock(context);
  context = addBuffer(`}`, context);
  if (shouldAddElementScopeClass) {
    context = addBuffer(`)`, context);
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

const translateFragment = (
  children: Node[],
  isRoot: boolean,
  context: TranslateContext
) => {
  if (children.length === 1) {
    return translateJSXNode(children[0], isRoot, context);
  }
  context = addBuffer(`React.createElement(React.Fragment, {\n`, context);
  context = startBlock(context);
  if (isRoot) {
    context = addBuffer(`"ref": ref,\n`, context);
  }
  context = addBuffer(`children: [\n`, context);
  context = translateChildren(children, false, context);
  context = addBuffer(`]\n`, context);
  context = endBlock(context);
  context = addBuffer(`})`, context);
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
  /^on/.test(name) || name === "checked" || name === "style" || name === "ref";

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
    const value = attr.value;

    if (name === "string") {
      console.warn("Can't handle style tag for now");
    }

    if (name === "tagName" && !isComponentInstance) {
      return context;
    }

    if (/^(component|export|as)$/.test(name)) {
      return context;
    }

    // can't handle for now
    if (!/^data-/.test(name)) {
      name = camelCase(name);
    }
    context = addBuffer(`${JSON.stringify(name)}: `, context);

    if (name === "style") {
      context = addBuffer("castStyle(", context);
    }

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

    if (name === "style") {
      context = addBuffer(")", context);
    }

    context = addBuffer(`,\n`, context);
  } else if (attr.kind === AttributeKind.ShorthandAttribute) {
    const property = (attr.reference as Reference).path[0];
    added[property.name] = true;

    if (property.name === "tagName" && !isComponentInstance) {
      return context;
    }

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

    const name = RENAME_PROPS[property.name] || property.name;

    if (name === "className") {
      context = addBuffer("getClassName(", context);
    }

    context = addBuffer(`${value}`, context);
    if (name === "className") {
      context = addBuffer(")", context);
    }
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
    if (name === "className") {
      context = addBuffer("getClassName(", context);
    }
    context = translateStatment(
      value.script,
      false,
      isPropOnNativeElement && !isSpecialPropName(name),
      context
    );
    if (name === "className") {
      context = addBuffer(")", context);
    }

    return context;
  } else if (value.attrValueKind === AttributeValueKind.String) {
    let strValue = JSON.stringify(value.value);
    if (name === "src") {
      strValue = `getDefault(require(${strValue}))`;
    }

    if (name === "className") {
      strValue = prefixWthStyleScopes(value.value, context);
      strValue = JSON.stringify(strValue);
    }
    return addBuffer(strValue, context);
  } else if (value.attrValueKind === AttributeValueKind.DyanmicString) {
    for (let i = 0, { length } = value.values; i < length; i++) {
      const part = value.values[i];
      if (part.partKind === DynamicStringAttributeValuePartKind.Literal) {
        context = addBuffer(
          JSON.stringify(
            name === "className"
              ? prefixWthStyleScopes(part.value, context)
              : part.value
          ),
          context
        );
      } else if (
        part.partKind === DynamicStringAttributeValuePartKind.ClassNamePierce
      ) {
        context = addBuffer(
          `"${prefixWthStyleScopes(part.className, context, true)}"`,
          context
        );
      } else if (part.partKind === DynamicStringAttributeValuePartKind.Slot) {
        if (name === "className") {
          context = addBuffer(`getClassName(`, context);
        }
        context = translateStatment(part, false, false, context);
        if (name === "className") {
          context = addBuffer(`)`, context);
        }
      }

      if (i < length - 1) {
        context = addBuffer(" + ", context);
      }
    }

    return context;
  }

  return context;
};

const prefixWthStyleScopes = (
  value: string,
  context: TranslateContext,
  pierced?: boolean
) => {
  return value
    .split(" ")
    .map(className => {
      // skip just whitespace
      if (!/\w+/.test(className)) return className;

      let scopeFilePath: string;
      let actualClassName = className;

      if (pierced && className.indexOf(".") > -1) {
        const [importId, importClassName] = className.split(".");
        actualClassName = importClassName;
        scopeFilePath = context.imports[importId];

        if (!scopeFilePath) {
          // Just some information to communicate that the class doesn't do anything.
          scopeFilePath = "noop";

          console.warn(`import "${importId}" is not defined`);
        }
      } else {
        scopeFilePath = context.fileUri;
      }

      return `_${getStyleScopeId(
        scopeFilePath
      )}_${actualClassName} ${actualClassName}`;
    })
    .join(" ");
};

const translateSlot = (slot: Slot, context: TranslateContext) => {
  return translateStatment(slot.script, true, false, context);
};

const translateReferencePath = (
  path: ReferencePart[],
  context: TranslateContext,
  min = -1
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
  statement: JsExpression,
  isRoot: boolean,
  shouldStringifyProp: boolean,
  context: TranslateContext
) => {
  if (statement.jsKind === JsExpressionKind.Reference) {
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
  } else if (statement.jsKind === JsExpressionKind.Node) {
    return translateJSXNode((statement as any) as Node, isRoot, context);
  } else if (statement.jsKind === JsExpressionKind.Array) {
    context = addBuffer(`[\n`, context);
    context = startBlock(context);
    for (const value of statement.values) {
      context = translateStatment(value, false, false, context);
      context = addBuffer(`,\n`, context);
    }
    context = endBlock(context);
    context = addBuffer(`]`, context);
  } else if (statement.jsKind === JsExpressionKind.Object) {
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
    statement.jsKind === JsExpressionKind.Number ||
    statement.jsKind === JsExpressionKind.String ||
    statement.jsKind === JsExpressionKind.Boolean
  ) {
    return addBuffer(String(statement.value), context);
  } else if (statement.jsKind === JsExpressionKind.Conjunction) {
    context = translateStatment(statement.left, isRoot, false, context);
    switch (statement.operator) {
      case JsConjunctionOperatorKind.And: {
        context = addBuffer(` && `, context);
        break;
      }
      case JsConjunctionOperatorKind.Or: {
        context = addBuffer(` || `, context);
        break;
      }
    }

    context = translateStatment(statement.right, isRoot, false, context);
  } else if (statement.jsKind === JsExpressionKind.Not) {
    context = addBuffer(`!`, context);

    context = translateStatment(statement.expression, isRoot, false, context);
  } else if (statement.jsKind === JsExpressionKind.Group) {
    context = addBuffer("(", context);
    context = translateStatment(statement.expression, isRoot, false, context);
    context = addBuffer(")", context);
  }

  return context;
};
