import {
  CompilerOptions,
  Document,
  DependencyMap,
  DependencyGraph
} from "./state";

export type TranslateContext = {
  buffer: string;
  entryFilePath: string;
  lineNumber: number;
  currentIndexKey?: string;
  compilerOptions: CompilerOptions;
  graph: DependencyGraph;
  isNewLine: boolean;
  indent: string;
  keyCount: number;
  fontPaths: string[];
  currentFrameX: number;
};

export const createTranslateContext = (
  entryFilePath: string,
  compilerOptions: CompilerOptions,
  graph: DependencyGraph,
  fontPaths: string[],
  indent: string = "  "
): TranslateContext => ({
  entryFilePath,
  graph,
  compilerOptions,
  buffer: "",
  isNewLine: true,
  lineNumber: 0,
  indent,
  keyCount: 0,
  fontPaths,
  currentFrameX: 0
});

export const addBuffer = (buffer: string, context: TranslateContext) => ({
  ...context,
  buffer:
    context.buffer +
    (context.isNewLine ? context.indent.repeat(context.lineNumber) : "") +
    buffer,
  isNewLine: buffer.lastIndexOf("\n") === buffer.length - 1
});

export const startBlock = (context: TranslateContext) => ({
  ...context,
  lineNumber: context.lineNumber + 1
});

export const endBlock = (context: TranslateContext) => ({
  ...context,
  lineNumber: context.lineNumber - 1
});
