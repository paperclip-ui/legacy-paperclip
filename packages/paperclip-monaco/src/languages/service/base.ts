import { Node, VirtualNode, SourceLocation } from "paperclip-utils";

export type Color = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

export type ColorInfo = {
  location: SourceLocation;
  color: Color;
};

export interface IPaperclipEngineInfoProvider {
  /**
   * asynchronously returns the AST of a node file - note that
   * uri is present since the engine always needs the most up-to-date
   * content, so it's assumed that whatever uri is the most recent content
   */

  getDocumentColors: (uri: string) => Promise<ColorInfo[]>;
  updateDocument: (uri: string, value: string) => void;
}
