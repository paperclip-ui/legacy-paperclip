import {
  Node,
  getAttributeStringValue,
  getImportIds,
  Element,
  getLogicElement,
  infer,
  ShapeProperty,
  getPartIds,
  DEFAULT_PART_ID,
  getVisibleChildNodes,
  EXPORT_TAG_NAME,
  InferenceKind,
  getParts,
  Annotation,
  Inference,
  isComponent,
  getChildren,
  hasAttribute,
  NodeKind,
  AS_ATTR_NAME
} from "paperclip";
import {
  createTranslateContext,
  TranslateContext,
  startBlock,
  endBlock,
  addBuffer
} from "./translate-utils";
import { Options, RENAME_PROPS, getPartClassName } from "./utils";
import { ClassNameExport } from "paperclip";

export const compile = (
  {
    ast,
    classNames = {}
  }: { ast: Node; classNames?: Record<string, ClassNameExport> },
  filePath: string,
  options: Options = {}
): string => {
  let context = createTranslateContext(
    filePath,
    getImportIds(ast),
    {},
    [],
    {},
    "",
    getPartIds(ast),
    Boolean(getLogicElement(ast)),
    options,
    " ",
    null
  );
  context = translateRoot(ast, classNames, context);
  return context.buffer;
};

const translateRoot = (
  ast: Node,
  classNames: Record<string, ClassNameExport>,
  context: TranslateContext
) => {
  context = addBuffer(`/* eslint-disable */\n`, context);
  context = addBuffer(`import {ReactElement} from "react";\n\n`, context);

  context = addBuffer(`type DefaultProps = {\n`, context);
  context = startBlock(context);
  context = addBuffer(`ref?: any,\n`, context);
  context = endBlock(context);
  context = addBuffer(`};\n\n`, context);

  context = addBuffer(
    `type Factory<TProps> = (props: TProps & DefaultProps) => ReactElement;\n\n`,
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
  classNames: Record<string, ClassNameExport>,
  context: TranslateContext
) => {
  context = addBuffer(`export declare const classNames: {\n`, context);

  context = startBlock(context);

  for (const exportName in classNames) {
    const info = classNames[exportName];
    if (!info.public) {
      continue;
    }
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

const DEFAULT_PARAM_TYPE = `any`;

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
  let currentAnnotation: Annotation;
  for (const child of getChildren(ast)) {
    if (child.nodeKind === NodeKind.Comment) {
      currentAnnotation = child.annotation;
      continue;
    }

    // already translated, so skip.
    if (
      !isComponent(child) ||
      getAttributeStringValue(AS_ATTR_NAME, child) === DEFAULT_PART_ID ||
      !hasAttribute(EXPORT_TAG_NAME, child)
    ) {
      currentAnnotation = null;
      continue;
    }

    context = translatePart(child, currentAnnotation, context);
  }

  return context;
};

const translatePart = (
  part: Element,
  annotation: Annotation | undefined,
  context: TranslateContext
) => {
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
