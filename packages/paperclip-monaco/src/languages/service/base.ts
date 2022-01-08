import { StringRange } from "@paperclip-ui/utils";

export type Color = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

export type ColorInfo = {
  start: number;
  end: number;
  color: Color;
};

export type Suggestion = {
  /**
   * The label of this completion item. By default
   * this is also the text that is inserted when selecting
   * this completion.
   */
  label: string;
  insertText: string;
  range: StringRange;
};
export interface IPaperclipEngineInfoProvider {
  /**
   * asynchronously returns the AST of a node file - note that
   * uri is present since the engine always needs the most up-to-date
   * content, so it's assumed that whatever uri is the most recent content
   */

  getDocumentColors: (uri: string) => Promise<ColorInfo[]>;
  updateDocument: (uri: string, value: string) => void;
  getSuggestions: (text: string, uri: string) => Promise<Suggestion[]>;
}
