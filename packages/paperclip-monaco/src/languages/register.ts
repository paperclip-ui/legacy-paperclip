// import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import * as monacoEditor from "monaco-editor-core/esm/vs/editor/editor.api";
import { Options, PaperclipMonacoServiceAdapter } from "./adapter";

export type Monaco = typeof monacoEditor;
import * as html from "./html";
import * as pcss from "./pcss";
import * as pcs from "./script";
// import { PaperclipLanguageService } from "./service";
import { PaperclipEngineAsyncInfoProvider } from "./service/async-provider";

export const registerLanguages = (monaco: Monaco, options: Options) => {
  monaco.languages.register({
    id: "paperclip",
    extensions: [".pc"],
    mimetypes: ["text/paperclip"]
  });

  monaco.languages.register({
    id: "pcss",
    extensions: [".pcss"],
    mimetypes: ["text/pcss"]
  });

  monaco.languages.register({
    id: "pcs",
    extensions: [".pcs"],
    mimetypes: ["text/pcs"]
  });

  monaco.languages.setLanguageConfiguration("paperclip", html.config);
  monaco.languages.setMonarchTokensProvider("paperclip", html.language as any);

  monaco.languages.setLanguageConfiguration("pcss", pcss.config);
  monaco.languages.setMonarchTokensProvider("pcss", pcss.language as any);

  monaco.languages.setLanguageConfiguration("pcs", pcs.config);
  monaco.languages.setMonarchTokensProvider("pcs", pcs.language as any);


  const service = new PaperclipEngineAsyncInfoProvider();
  const adapter = new PaperclipMonacoServiceAdapter(service, options);

  monaco.languages.registerColorProvider("paperclip", adapter);
  monaco.languages.registerCompletionItemProvider("paperclip", adapter);
};
