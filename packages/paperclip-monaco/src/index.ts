// import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import * as monacoEditor from "monaco-editor-core/esm/vs/editor/editor.api";
import { Options } from "./languages/adapter";
import { registerLanguages } from "./languages/register";

export type Monaco = typeof monacoEditor;

export const active = (monaco: Monaco, options: Options) => {
  registerLanguages(monaco, options);

};