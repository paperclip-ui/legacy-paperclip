import { Parser, Printer, SupportLanguage } from "prettier";
import { print } from "./print";
import { createEngineDelegate } from "@paperclipui/core";

export const languages: Partial<SupportLanguage>[] = [
  {
    name: "@paperclipui/core",
    parsers: ["@paperclipui/core"],

    // DO NOT SET THIS UNTIL THIS MODULE IS WORKING!!
    extensions: [".pc"],
    // extensions: [],
    vscodeLanguageIds: ["@paperclipui/core"]
  }
];

export const parsers: Record<string, Parser> = {
  paperclip: {
    parse(text) {
      const engine = createEngineDelegate();
      return engine.parseContent(text, "<virt>");
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
    astFormat: "@paperclipui/ast"
  }
};

export const printers: Record<string, Printer> = {
  "@paperclipui/ast": {
    print
  }
};

export { options } from "./options";
