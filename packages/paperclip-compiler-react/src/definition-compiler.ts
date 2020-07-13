import {
  Node,
  getAttributeStringValue,
  getImportIds,
  Element,
  getLogicElement,
  infer,
  NodeKind,
  ShapeProperty,
  getPartIds,
  DEFAULT_PART_ID,
  getVisibleChildNodes,
  EXPORT_TAG_NAME,
  InferenceKind,
  ReferencePart,
  getParts,
  Inference,
  hasAttribute,
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
  RENAME_PROPS,
  getClassExportNameMap,
  getPartClassName
} from "./utils";

export const compile = (
  { ast, classNames = [] }: { ast: Node; classNames?: string[] },
  filePath: string,
  options: Options = {}
) => {
  let context = createTranslateContext(
    filePath,
    getImportIds(ast),
    {},
    getPartIds(ast),
    [],
    Boolean(getLogicElement(ast)),
    options
  );
  context = translateRoot(ast, classNames, context);
  return context.buffer;
};

const translateRoot = (
  ast: Node,
  classNames: string[],
  context: TranslateContext
) => {
  context = addBuffer(`/* eslint-disable */\n`, context);
  context = addBuffer(
    `import {ReactNode, ReactElement} from "react";\n\n`,
    context
  );

  // KEEP ME: logic taken out, but keep if it's re-added
  // later kn
  // const allImports = getImports(ast);

  // for (const imp of allImports) {
  //   const id = getAttributeStringValue(AS_ATTR_NAME, imp);
  //   const src = getAttributeStringValue("src", imp);
  //   if (!id || !src) {
  //     continue;
  //   }
  //   const relativePath = getRelativeFilePath(context.filePath, src);
  //   context = addBuffer(
  //     `import {EnhancedProps as ${pascalCase(
  //       getInstancePropsName(imp)
  //     )}} from "${relativePath}";\n`,
  //     context
  //   );
  // }

  // context = addBuffer(`\n`, context);

  // TODO: keep for logic
  // const logicElement = getLogicElement(ast);
  // if (logicElement) {
  //   const src = getAttributeStringValue("src", logicElement);
  //   if (src) {
  //     const logicRelativePath = getRelativeFilePath(context.filePath, src);
  //     context = addBuffer(
  //       `import {Props as LogicProps} from "${logicRelativePath.replace(
  //         /\.tsx?$/,
  //         ""
  //       )}";\n`,
  //       context
  //     );
  //   }
  // }

  // context = addBuffer(
  //   `type ElementProps = InputHTMLAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement>;\n\n`,
  //   context
  // );

  context = addBuffer(
    `type Factory<TProps> = (props: TProps) => ReactElement;\n\n`,
    context
  );

  // KEEP ME: needed for logic
  // context = addBuffer(
  //   `type PropsFactory<TProps> = (props: Partial<TProps>) => TProps;\n\n`,
  //   context
  // );

  context = translateUtils(ast, classNames, context);
  context = translateParts(ast, context);
  context = translateMainView(ast, context);

  // context = addBuffer(`/* prettier-ignore-end */`, context);
  return context;
};

const translateUtils = (
  _ast: Node,
  classNames: string[],
  context: TranslateContext
) => {
  context = addBuffer(`export declare const classNames: {\n`, context);

  const map = getClassExportNameMap(classNames);
  context = startBlock(context);

  for (const exportName in map) {
    context = addBuffer(`${JSON.stringify(exportName)}: string,\n`, context);
  }

  context = endBlock(context);
  context = addBuffer(`};\n\n`, context);
  // context = addBuffer(
  //   `export declare const styled: (tag: keyof ReactHTML | Factory<ElementProps>, defaultProps?: ElementProps) => Factory<ElementProps>;\n\n`,
  //   context
  // );
  return context;
};

const BLACK_LIST_PROPS = {
  // className: true,
  // children: true
};

const DEFAULT_PARAM_TYPE = `ReactNode`;

const translateInference = (
  inference: Inference,
  property: string,
  context: TranslateContext
): TranslateContext => {
  if (inference.kind === InferenceKind.Any) {
    return addBuffer(
      /^on\w+/.test(property) ? `Function` : DEFAULT_PARAM_TYPE,
      context
    );
  }
  if (inference.kind === InferenceKind.Array) {
    context = addBuffer(`Array<`, context);
    context = translateInference(inference.value, property, context);
    context = addBuffer(`>`, context);
  }
  if (inference.kind === InferenceKind.Shape) {
    context = addBuffer(`{\n`, context);
    context = startBlock(context);
    for (const key in inference.properties) {
      context = translateProperty(key, inference.properties[key], context);
    }
    context = endBlock(context);
    context = addBuffer(`}`, context);
    if (inference.fromSpread) {
      context = addBuffer(" & ElementProps", context);
    }
  }
  return context;
};

const translateProperty = (
  key: string,
  { value, optional }: ShapeProperty,
  context: TranslateContext
) => {
  context = addBuffer(`${key}${optional ? `?` : ""}: `, context);
  context = translateInference(value, key, context);
  context = addBuffer(`,\n`, context);
  return context;
};

const translateComponent = (
  node: Node,
  componentPropsName: string,
  context: TranslateContext
) => {
  context = addBuffer(
    `${context.hasLogicFile ? "export " : ""}type ${componentPropsName} = {\n`,
    context
  );
  context = startBlock(context);

  const props = {};

  const inference = infer(node);

  for (const key in inference.properties) {
    const propName = RENAME_PROPS[key] || key;
    if (BLACK_LIST_PROPS[propName]) {
      continue;
    }
    context = translateProperty(key, inference.properties[key], context);

    props[key] = [null];
  }

  // KEEP ME: needed for logic.
  // const allElements = flattenNodes(node).filter(
  //   node => node.kind === NodeKind.Element && isVisibleElement(node)
  // ) as Element[];

  // for (const element of allElements) {
  //   if (isComponentInstance(element, context.importIds)) {
  //     const valueType = getInstancePropsTypeName(element);

  //     props[getInstancePropsName(element)] = [
  //       `${valueType} | PropsFactory<${valueType}>`,
  //       false
  //     ];
  //   } else {
  //     const id = getAttributeStringValue(AS_ATTR_NAME, element);
  //     if (id) {
  //       props[`${camelCase(id)}Props`] = [
  //         `ElementProps | PropsFactory<ElementProps>`
  //       ];
  //     }
  //   }
  // }

  for (const key in props) {
    const [valueType, optional] = props[key];
    if (!valueType) continue;
    context = addBuffer(
      `${key}${optional ? "?" : ""}: ${valueType},\n`,
      context
    );
  }

  context = endBlock(context);
  context = addBuffer(`};\n\n`, context);

  return context;
};

// const getInstancePropsName = (element: Element) => {
//   return `${camelCase(
//     getAttributeStringValue(AS_ATTR_NAME, element) || element.tagName
//   )}Props`;
// };

const translateParts = (ast: Node, context: TranslateContext) => {
  for (const part of getParts(ast)) {
    // already translated, so skip.
    if (getAttributeStringValue(AS_ATTR_NAME, part) === DEFAULT_PART_ID) {
      continue;
    }

    if (!hasAttribute(EXPORT_TAG_NAME, part)) {
      continue;
    }

    context = translatePart(part, context);
  }
  return context;
};

const translatePart = (part: Element, context: TranslateContext) => {
  const componentName = getPartClassName(part, context.fileUri);
  const propsName = `${componentName}Props`;
  context = translateComponent(part, propsName, context);
  context = addBuffer(
    `export const ${componentName}: Factory<${propsName}>;\n\n`,
    context
  );
  return context;
};

const translateMainView = (ast: Node, context: TranslateContext) => {
  const target = getParts(ast).find(
    part => getAttributeStringValue(AS_ATTR_NAME, part) === DEFAULT_PART_ID
  );

  if (!target) {
    return context;
  }

  if (target === ast) {
    const children = getVisibleChildNodes(ast);
    if (!children.length) {
      return context;
    }
  }

  const componentName = `View`;
  context = translateComponent(target, "Props", context);
  context = addBuffer(
    `declare const ${componentName}: Factory<Props>;\n`,
    context
  );

  // context = addBuffer(`export type EnhancedProps = Props;\n`, context);
  context = addBuffer(`export default ${componentName};\n`, context);

  // KEEP ME: logic has been taken out, but may
  // be re-added later on.
  // if (context.hasLogicFile) {
  //   context = addBuffer(
  //     `declare const Enhanced${componentName}: Factory<LogicProps>;\n`,
  //     context
  //   );
  //   context = addBuffer(`export type EnhancedProps = LogicProps;\n`, context);
  //   context = addBuffer(`export default Enhanced${componentName};\n`, context);
  // } else {
  //   context = addBuffer(`export type EnhancedProps = Props;\n`, context);
  //   context = addBuffer(`export default ${componentName};\n`, context);
  // }
  return context;
};
