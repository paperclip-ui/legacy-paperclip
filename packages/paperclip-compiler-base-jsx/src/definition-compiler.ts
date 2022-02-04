import { ShapeProperty, InferenceKind, Inference } from "@paperclip-ui/core";
import {
  createTranslateContext,
  Context,
  addBuffer,
  startBlock,
  endBlock,
  writeJoin,
} from "./utils";
import { InterimComponent, InterimModule } from "@paperclip-ui/interim";
import { CompilerOptions, PaperclipConfig } from "@paperclip-ui/utils";

export type DefinitionCompilerOptions = {
  imports: string;
  elementType: string;
};

export const definitionCompiler = ({
  imports,
  elementType,
}: DefinitionCompilerOptions) => {
  const translateRoot = (context: Context) => {
    context = addBuffer([
      `/* eslint-disable */\n`,
      imports,
      translateDefaultProps,
      `type Factory<TProps> = (props: TProps & DefaultProps) => ${elementType};\n\n`,
      translateClassNames,
      translateComponents,
    ])(context);
    return context;
  };

  const translateDefaultProps = addBuffer([
    `type DefaultProps = {\n`,
    startBlock,
    `ref?: any,\n`,
    endBlock,
    `};\n\n`,
  ]);

  const translateClassNames = (context: Context) => {
    context = addBuffer([
      `export declare const classNames: {\n`,
      startBlock,
      (context) => {
        const classNames = context.module.css.exports.classNames;
        for (const exportName in classNames) {
          context = addBuffer([`${JSON.stringify(exportName)}: string,\n`])(
            context
          );
        }
        return context;
      },
      endBlock,
      "};\n\n",
    ])(context);

    return context;
  };

  const DEFAULT_PARAM_TYPE = `any`;

  const translateInference = (property: string, inference: Inference) => {
    if (inference.kind === InferenceKind.Any) {
      return addBuffer([
        /^on\w+/.test(property) ? `Function` : DEFAULT_PARAM_TYPE,
      ]);
    }
    if (inference.kind === InferenceKind.Array) {
      return addBuffer([
        `Array<`,
        translateInference(property, inference.value),
        `>`,
      ]);
    }

    if (inference.kind === InferenceKind.Shape) {
      return addBuffer([
        `{\n`,
        startBlock,
        (context) => {
          for (const key in inference.properties) {
            context = translateProp(key, inference.properties[key])(context);
          }
          return context;
        },
        endBlock,
        "}",
      ]);
    }
    return context;
  };

  const translateComponents = (context: Context) =>
    writeJoin(
      context.module.components.filter((component) => component.exported),
      "\n\n",
      translateComponent
    )(context);
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
        : `export { ${name} };\n\n`,
    ]);
  };

  const translateComponentProps =
    (component: InterimComponent) => (context: Context) => {
      const props = {};

      for (const key in component.schema.properties) {
        context = translateProp(key, component.schema.properties[key])(context);
        props[key] = [null];
      }

      return context;
    };

  const translateProp = (key: string, { value, optional }: ShapeProperty) =>
    addBuffer([
      `${key}${optional ? "?" : ""}: `,
      translateInference(key, value),
      ",\n",
    ]);

  return (
    module: InterimModule,
    filePath: string,
    config: PaperclipConfig,
    targetOptions: CompilerOptions
  ): string => {
    const context = createTranslateContext(
      module,
      filePath,
      config,
      targetOptions
    );
    return translateRoot(context).buffer.join("");
  };
};
