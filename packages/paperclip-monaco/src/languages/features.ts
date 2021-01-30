import { CancellationToken, editor, languages } from "monaco-editor-core";
import { PaperclipLanguageService } from "./service";

export class DocumentColorAdapter implements languages.DocumentColorProvider {
  constructor(private _service: PaperclipLanguageService)   {
    
  }
  public provideDocumentColors(model: editor.IReadOnlyModel, token: CancellationToken): Promise<languages.IColorInformation[]> {
    console.log("provideDocumentColors");
    return Promise.resolve([]);
  }
  public  provideColorPresentations(model: editor.IReadOnlyModel, info: languages.IColorInformation, token: CancellationToken): Promise<languages.IColorPresentation[]> {
    console.log("provideColorPresentations");
    return Promise.resolve([]);
  }
}