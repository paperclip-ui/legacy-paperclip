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
  RENAME_PROPS,
  getPartClassName,
  createTranslateContext,
  Context,
  addBuffer,
  startBlock,
  endBlock,
  writeJoin
} from "./utils";
import { InterimComponent, InterimModule } from "paperclip-interim";
import { PaperclipConfig } from "paperclip-utils";

export const compile = (
  module: InterimModule,
  filePath: string,
  config: PaperclipConfig
): string => {
  const context = createTranslateContext(module, filePath, config);
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
  `};\n\n`
]);

const translateClassNames = (context: Context) => {
  context = addBuffer([
    `export declare const classNames: {\n`,
    startBlock,
    context => {
      const classNames = context.module.css.exports.classNames;
      for (const exportName in classNames) {
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
  writeJoin(context.module.components, "\n\n", translateComponent)(context);
const translateComponent = (component: InterimComponent) => {
  const name = component.as === "default" ? "$$Default" : component.as;
  return addBuffer([
    `type ${name}Props = {\n`,
    startBlock,
    translateComponentProps(component),
    endBlock,
    "}\n\n",
    `declare const ${name}: Factory<${name}Props>;\n\n`,
    component.as === "default"
      ? `export default ${name};`
      : `export { ${name} };\n\n`
  ]);
};

const translateComponentProps = (component: InterimComponent) => (
  context: Context
) => {
  const props = {};

  for (const key in component.schema.properties) {
    const propName = RENAME_PROPS[key] || key;
    context = translateProp(key, component.schema.properties[key])(context);
    props[key] = [null];
  }

  return context;
};

const translateProp = (key: string, { value, optional }: ShapeProperty) =>
  addBuffer([
    `${key}${optional ? "?" : ""}: `,
    translateInference(key, value),
    ",\n"
  ]);
