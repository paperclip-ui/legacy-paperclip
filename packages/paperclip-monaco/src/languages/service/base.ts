import { Node, VirtualNode } from "paperclip-utils";

export interface IPaperclipEngineHandler {

  /**
   * asynchronously returns the AST of a node file - note that
   * uri is present since the engine always needs the most up-to-date
   * content, so it's assumed that whatever uri is the most recent content
   */

  getAST: (uri: string) => Promise<Node>;
}

