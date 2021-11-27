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
  Options,
  RENAME_PROPS,
  getPartClassName,
  createTranslateContext,
  Context,
  addBuffer,
  startBlock,
  endBlock,
  writeJoin
} from "./utils";
import { InterimComponent, InterimModule } from "paperclip-compiler-interim";

export const compile = (
  module: InterimModule,
  filePath: string,
  options: Options = {}
): string => {
  let context = createTranslateContext(module, filePath);
  return translateRoot(context).buffer.join("");
};

const translateRoot = (context: Context) => {
  context = addBuffer([
    `/* eslint-disable */\n`,
    `import {ReactElement} from "react";\n\n`,
    translateDefaultProps,
    `type Factory<TProps> = (props: TProps & DefaultProps) => ReactElement;\n\n`,
    translateClassNames,
    translateComponents
  ])(context);
  return context;
};

const translateDefaultProps = addBuffer([
  `type DefaultProps = {\n`,
  startBlock,
  `ref?: any,\n`,
  endBlock,
  addBuffer,
  `};\n\n`
]);

const translateClassNames = (context: Context) => {
  context = addBuffer([
    `export declare const classNames: {\n`,
    startBlock,
    context => {
      const classNames = context.module.css.exports.classNames;
      for (const exportName of classNames) {
        // const info = classNames[exportName];

        // const info = classNames[exportName];
        // if (!info.public) {
        //   continue;
        // }

        context = addBuffer([`${JSON.stringify(exportName)}: string,\n`])(
          context
        );
      }
      return context;
    },
    endBlock,
    "};\n\n"
  ])(context);

  return context;
};

const BLACK_LIST_PROPS = {
  // className: true,
  // children: true
};

const DEFAULT_PARAM_TYPE = `any`;

const translateInference = (property: string, inference: Inference) => {
  if (inference.kind === InferenceKind.Any) {
    return addBuffer([
      /^on\w+/.test(property) ? `Function` : DEFAULT_PARAM_TYPE
    ]);
  }
  if (inference.kind === InferenceKind.Array) {
    return addBuffer([
      `Array<`,
      translateInference(property, inference.value),
      `>`
    ]);
  }

  if (inference.kind === InferenceKind.Shape) {
    return addBuffer([
      `{\n`,
      startBlock,
      context => {
        for (const key in inference.properties) {
          context = translateProp(key, inference.properties[key])(context);
        }
        return context;
      },
      endBlock,
      "}"
    ]);
  }
  return context;
};

const translateComponents = (context: Context) =>
  writeJoin(context.module.components, context, "\n\n", translateComponent);
const translateComponent = (component: InterimComponent) =>
  addBuffer([
    `type ${component.as}Props = {\n`,
    startBlock,
    translateComponentProps(component),
    endBlock,
    "}\n\n",
    component.as === "default"
      ? `export default Factory<${component.as}Props>;`
      : `export const ${component.as}: Factory<${component.as}Props>;`
  ]);

const translateComponentProps = (component: InterimComponent) => (
  context: Context
) => {
  const props = {};

  for (const key in component.schema.properties) {
    const propName = RENAME_PROPS[key] || key;
    if (BLACK_LIST_PROPS[propName]) {
      continue;
    }
    context = translateProp(key, component.schema.properties[key])(context);
    props[key] = [null];
  }

  return context;
};

const translateProp = (key: string, { value, optional }: ShapeProperty) =>
  addBuffer([
    `${key}${optional ? "?" : ""}: `,
    translateInference(key, value),
    ",m"
  ]);
