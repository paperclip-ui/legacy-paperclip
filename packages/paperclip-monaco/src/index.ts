// import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import * as monacoEditor from "monaco-editor-core/esm/vs/editor/editor.api";
import { registerLanguages } from "./languages/register";

export type Monaco = typeof monacoEditor;

export const active = (monaco: Monaco) => {
  console.log("OKFDOFS");

  monacoEditor.languages.onLanguage("paperclip", () => {
    console.log("ACTIVATE!");
  });

  registerLanguages(monaco);

  monacoEditor.languages.onLanguage("paperclip", () => {
    console.log("ACTIVATE!");
  });
};

const EMPTY_ELEMENTS: string[] = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "keygen",
  "link",
  "menuitem",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];
