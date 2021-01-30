import { CancellationToken, editor, IRange, languages, Position } from "monaco-editor-core";
import { Color, IPaperclipEngineInfoProvider } from "./service/base";
import * as parseColor from "color";
import { textSpanIsEmpty } from "typescript";

export type Options = {
  getCurrentUri: () => string;
};

export class PaperclipMonacoServiceAdapter implements languages.DocumentColorProvider, languages.CompletionItemProvider {
  constructor(private _provider: IPaperclipEngineInfoProvider, private _options: Options) {

  }
  public async provideDocumentColors(model: editor.IReadOnlyModel, token: CancellationToken): Promise<languages.IColorInformation[]> {
    const colors = await this._provider.getDocumentColors(model.uri.path.substr(1));


    return colors.map(({color, location}) => {
      const start = model.getPositionAt(location.start);
      const end = model.getPositionAt(location.end);
      return {
        color,
        range: {
          startLineNumber: start.lineNumber,
          startColumn: start.column,
          endColumn: end.column,
          endLineNumber: end.lineNumber
        }
      }
    });
  }

  public  provideColorPresentations(model: editor.IReadOnlyModel, info: languages.IColorInformation, token: CancellationToken): Promise<languages.IColorPresentation[]> {
    const presentation = getColorPresentation(info.color, info.range);
    const start = model.getOffsetAt({ lineNumber: info.range.startLineNumber, column: info.range.startColumn });
    const end = model.getOffsetAt({ lineNumber: info.range.endLineNumber, column: info.range.endColumn });

    const value = model.getValue();
    const newValue = value.substr(0, start) + presentation.label + value.substr(end);

    this._provider.updateDocument(model.uri.path.substr(1), newValue);
    return Promise.resolve([presentation]);
  }

  provideCompletionItems(model: editor.ITextModel, position: Position, context: languages.CompletionContext, token: CancellationToken): Promise<languages.CompletionList> {
    console.log("COMPLETION");
    return Promise.resolve({
      suggestions: []
    });
  }

}


const getColorPresentation = (
  { red, green, blue, alpha }: Color,
  range: IRange
): languages.IColorPresentation => {
  const info = parseColor.rgb(
    Math.round(red * 255),
    Math.round(green * 255),
    Math.round(blue * 255),
    alpha
  );
  const label = info.toString();
  return { label, textEdit: {
    range,
    text: label
  } };
};
