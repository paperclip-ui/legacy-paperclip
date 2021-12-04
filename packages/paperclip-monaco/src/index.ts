// import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { Options } from "./languages/adapter";
import { registerLanguages } from "./languages/register";

export type Monaco = typeof monacoEditor;

let _activated: boolean;

export const active = (monaco: Monaco, options: Options) => {
  // Monaco is a singleton so skip if activated already
  if (_activated) {
    return;
  }
  _activated = true;
  registerLanguages(monaco, options);
};
