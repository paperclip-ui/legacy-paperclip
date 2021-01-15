import { Parser, Printer, SupportLanguage } from "prettier";
import { print } from "./print";
import { createEngineSync } from "paperclip";

export const languages: Partial<SupportLanguage>[] = [
  {
    name: "paperclip",
    parsers: ["paperclip"],
    extensions: [".pc"],
    vscodeLanguageIds: ["paperclip"]
  }
];

export const parsers: Record<string, Parser> = {
  paperclip: {
    parse(text) {
      const engine = createEngineSync();
      return engine.parseContent(text);
    },
    preprocess(text) {
      return text;
    },
    locStart(node) {
      return node.start;
    },
    locEnd(node) {
      return node.end;
    },
    astFormat: "paperclip-ast"
  }
};

export const printers: Record<string, Printer> = {
  "paperclip-ast": {
    print
  }
};

export { options } from "./options";