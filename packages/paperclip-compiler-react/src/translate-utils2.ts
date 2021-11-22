import { IntermediatModule } from "paperclip-compiler-interm";

export type TranslateContext = {
  interm: IntermediatModule;
  buffer: string;
  lineNumber: number;
  isNewLine: boolean;
  indent: string;
};

export const createTranslateContext = (
  interm: IntermediatModule
): TranslateContext => ({
  interm,
  buffer: "",
  lineNumber: 0,
  isNewLine: true,
  indent: "  "
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
