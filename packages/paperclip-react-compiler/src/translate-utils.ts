import * as crc32 from "crc32";
import { Options } from "./utils";

export type TranslateContext = {
  filePath: string;
  buffer: string;
  lineNumber: number;
  currentIndexKey?: string;
  scopes: {
    [identifier: string]: boolean;
  };
  isNewLine: boolean;
  hasLogicFile: boolean;
  styleScopes: string[];
  indent: string;
  importIds: string[];
  args: Options;
  keyCount: number;
};

export const createTranslateContext = (
  filePath: string,
  importIds: string[],
  styleScopes: string[],
  hasLogicFile: boolean,
  args: Options,
  indent: string = "  "
): TranslateContext => ({
  buffer: "",
  filePath,
  importIds,
  scopes: {},
  hasLogicFile,
  styleScopes,
  isNewLine: true,
  lineNumber: 0,
  indent,
  args,
  keyCount: 0
});

export const addBuffer = (buffer: string, context: TranslateContext) => ({
  ...context,
  buffer:
    context.buffer +
    (context.isNewLine ? context.indent.repeat(context.lineNumber) : "") +
    buffer,
  isNewLine: buffer.indexOf("\n") === buffer.length - 1
});

export const startBlock = (context: TranslateContext) => ({
  ...context,
  lineNumber: context.lineNumber + 1
});

export const endBlock = (context: TranslateContext) => ({
  ...context,
  lineNumber: context.lineNumber - 1
});
