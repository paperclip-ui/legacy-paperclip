import { camelCase } from "lodash";
import * as path from "path";
import { Element, AS_ATTR_NAME, getAttributeStringValue } from "paperclip";
import { IntermediatModule } from "paperclip-compiler-interm";

export type Context = {
  module: IntermediatModule;
  filePath: string;
  buffer: any[];
  lineNumber: number;
  isNewLine: boolean;
  indent: string;
};

export const createTranslateContext = (
  module: IntermediatModule,
  filePath: string
): Context => ({
  module,
  filePath,
  buffer: [],
  lineNumber: 0,
  isNewLine: true,
  indent: "  "
});

export const RENAME_PROPS = {
  class: "className",
  autofocus: "autoFocus",
  autocomplete: "autoComplete",
  for: "htmlFor"
};

export const REV_PROP = {
  className: "class",
  autoFocus: "autofocus",
  autoComplete: "autocomplete",
  htmlFor: "for"
};

export type Options = {
  definition?: boolean;
  module?: "es6" | "commonjs";
};

export const pascalCase = (value: string) => {
  const newValue = camelCase(value);
  return newValue.charAt(0).toUpperCase() + newValue.substr(1);
};

export const getBaseComponentName = (filePath: string) => {
  return `Base${getComponentName(filePath)}`;
};

export const getComponentName = (filePath: string) => {
  return pascalCase(
    `${path
      .basename(filePath)
      .split(".")
      .shift()}View`
  );
};

export const getPartClassName = (part: Element, filePath: string) => {
  return strToClassName(getAttributeStringValue(AS_ATTR_NAME, part), filePath);
};

export const strToClassName = (value: string, filePath: string) => {
  let safeClassName = value.replace(/[^\w_$]/g, "");

  if (safeClassName === "default") {
    safeClassName = getComponentName(filePath);
  }

  if (!isNaN(Number(safeClassName.charAt(0)))) {
    safeClassName = "_" + safeClassName;
  }

  return safeClassName;
};

export const classNameToStyleName = (value: string) => {
  return value.charAt(0).toLowerCase() + value.substr(1);
};

export const getElementInstanceName = (
  namespace: string,
  tagName: string,
  context: Context
) => {
  const imp = context.module.imports.find(imp => imp.namespace === namespace);
  if (!imp) {
    return tagName;
  }
  return "_" + camelCase(imp.publicScopeId) + "_" + tagName;
};

export const arrayJoin = (buffer: any[], sep: string) =>
  buffer.reduce((ary, part, index, buffer) => {
    ary.push(part);
    if (index !== buffer.length - 1) {
      ary.push(sep);
    }
    return ary;
  }, []);

export const addBuffer = (buffer: any, context: Context) => ({
  ...context,
  buffer: [
    ...context.buffer,
    context.isNewLine ? context.indent.repeat(context.lineNumber) : "",
    buffer
  ],
  isNewLine: buffer.lastIndexOf("\n") === buffer.length - 1
});

export const startBlock = (context: Context) => ({
  ...context,
  lineNumber: context.lineNumber + 1
});

export const endBlock = (context: Context) => ({
  ...context,
  lineNumber: context.lineNumber - 1
});
