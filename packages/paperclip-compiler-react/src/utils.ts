import { camelCase } from "lodash";
import * as path from "path";
import { Element, AS_ATTR_NAME, getAttributeStringValue } from "paperclip";
import { IntermediatModule } from "paperclip-compiler-interm";
import { StringPosition, StringRange } from "paperclip-utils";
import { SourceNode } from "source-map";

export type Context = {
  module: IntermediatModule;
  filePath: string;
  buffer: any[];
  depth: number;
  isNewLine: boolean;
  indent: string;
};

type OutputBuffer = {};

export const createTranslateContext = (
  module: IntermediatModule,
  filePath: string
): Context => ({
  module,
  filePath,
  buffer: [],
  depth: 0,
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

export const addBuffer = (buffer: any[]) => (context: Context): Context =>
  buffer.reduce((context, part) => {
    if (!part) {
      return context;
    }

    if (typeof part === "function") {
      return part(context);
    }

    return {
      ...context,
      buffer: [
        ...context.buffer,
        context.isNewLine ? context.indent.repeat(context.depth) : "",
        part
      ],
      isNewLine:
        typeof part === "string" && part.lastIndexOf("\n") === part.length - 1
    };
  }, context);

export const startBlock = (context: Context) => {
  return { ...context, depth: context.depth + 1 };
};

export const wrapSourceNode = (
  pos: StringPosition,
  fromContext: Context,
  toContext: Context
) => {
  return {
    ...toContext,
    buffer: [
      new SourceNode(pos.line, pos.column, toContext.filePath, [
        ...toContext.buffer.slice(0, fromContext.buffer.length)
      ]),
      ...toContext.buffer.slice(fromContext.buffer.length)
    ]
  };
};

export const writeSourceNode = (
  pos: StringPosition | undefined,
  write: (context: Context) => Context
) => (context: Context) => {
  const initial = context;
  context = write(context);
  if (!pos) {
    return context;
  }
  return wrapSourceNode(pos, initial, context);
};

export const writeJoin = <TItem>(
  items: TItem[],
  context,
  join: string,
  write: (item: TItem) => (context: Context) => Context
) =>
  items.reduce((context, item, index, items) => {
    context = write(item)(context);
    if (index < items.length - 1) {
      context = addBuffer([join])(context);
    }
    return context;
  }, context);

export const endBlock = (context: Context) => {
  return { ...context, depth: context.depth - 1 };
};
