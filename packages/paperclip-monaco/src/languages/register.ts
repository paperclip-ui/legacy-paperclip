
// import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import * as monacoEditor from "monaco-editor-core/esm/vs/editor/editor.api";


export type Monaco = typeof monacoEditor;
import * as html from "./html";
import * as pcss from "./pcss";
import * as pcs from "./script";


export const registerLanguages = (monaco: Monaco) => {
  monaco.languages.register({
    id: "paperclip",
    extensions: [".pc"],
    mimetypes: ["text/paperclip"],
  });

  monaco.languages.register({
    id: "pcss",
    extensions: [".pcss"],
    mimetypes: ["text/pcss"],
  });

  monaco.languages.register({
    id: "pcs",
    extensions: [".pcs"],
    mimetypes: ["text/pcs"],
  });

  monaco.languages.setLanguageConfiguration("paperclip", html.config);
  monaco.languages.setMonarchTokensProvider("paperclip", html.language as any);

  monaco.languages.setLanguageConfiguration("pcss", pcss.config);
  monaco.languages.setMonarchTokensProvider("pcss", pcss.language as any);

  monaco.languages.setLanguageConfiguration("pcs", pcs.config);
  monaco.languages.setMonarchTokensProvider("pcs", pcs.language as any);

}