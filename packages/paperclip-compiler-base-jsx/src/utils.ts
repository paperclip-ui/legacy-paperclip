import { camelCase } from "lodash";
import * as path from "path";
import { Element, AS_ATTR_NAME, getAttributeStringValue } from "paperclip";
import { InterimModule } from "paperclip-interim";
import {
  CompilerOptions,
  PaperclipConfig,
  StringPosition
} from "paperclip-utils";
import { SourceNode } from "source-map";

export type Context = {
  module: InterimModule;
  config: PaperclipConfig;
  filePath: string;
  buffer: any[];
  depth: number;
  isNewLine: boolean;
  targetOptions: CompilerOptions;
  indent: string;
};

const DEFAULT_TAG_NAME = "$$Default";

export const createTranslateContext = (
  module: InterimModule,
  filePath: string,
  config: PaperclipConfig,
  targetOptions: CompilerOptions
): Context => ({
  module,
  filePath,
  config,
  buffer: [],
  targetOptions,
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
  tagName: string,
  innerTagName: string,
  context: Context
) => {
  const imp = context.module.imports.find(imp => imp.namespace === tagName);
  if (!imp) {
    if (tagName === "default") {
      return DEFAULT_TAG_NAME;
    }

    return tagName;
  }
  return (
    "_" +
    camelCase(imp.publicScopeId) +
    (innerTagName ? "_" + innerTagName : "")
  );
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
      return part(context) || [];
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
  bufferStart: number,
  context: Context
) => {
  return {
    ...context,
    buffer: [
      ...context.buffer.slice(0, bufferStart),
      new SourceNode(pos.line, pos.column, context.filePath, [
        ...context.buffer.slice(bufferStart)
      ])
    ]
  };
};

export type ContextWriter = (context: Context) => Context;

export const writeSourceNode = (
  pos: StringPosition | undefined,
  write: ContextWriter
) => (context: Context) => {
  const bufferStart = context.buffer.length;
  if (!pos) {
    return context;
  }

  return wrapSourceNode(pos, bufferStart, write(context));
};

export const writeJoin = <TItem>(
  items: TItem[],
  join: string,
  write: (item: TItem) => ContextWriter,
  trailing = false
) => (context: Context) =>
  items.reduce((context, item, index, items) => {
    context = write(item)(context);
    if (index < items.length - 1 || trailing) {
      context = addBuffer([join])(context);
    }
    return context;
  }, context);

export const endBlock = (context: Context) => {
  return { ...context, depth: context.depth - 1 };
};
