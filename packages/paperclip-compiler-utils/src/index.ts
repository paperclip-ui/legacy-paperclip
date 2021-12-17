import { camelCase } from "lodash";
import * as path from "path";
import { Element, AS_ATTR_NAME, getAttributeStringValue } from "paperclip";
import { InterimModule } from "paperclip-interim";
import { PaperclipConfig, StringPosition } from "paperclip-utils";

export type Context = {
  module: InterimModule;
  config: PaperclipConfig;
  filePath: string;
  buffer: any[];
  depth: number;
  isNewLine: boolean;
  indent: string;
};

const DEFAULT_TAG_NAME = "$$Default";

export const createTranslateContext = (
  module: InterimModule,
  filePath: string,
  config: PaperclipConfig
): Context => ({
  module,
  filePath,
  config,
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
      while (typeof part === "function") {
        part = part(context);
      }
      return part;
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

export type ContextWriter = (context: Context) => Context;

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
