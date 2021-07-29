/*

Considerations:

- auto-suggest based on import + relative files
- linting - emitting things to VS Code
- changes coming from language server
- Running language server in browser

*/

import { EngineDelegate } from "paperclip";

export class PaperclipLanguageServer {
  // TODO - pass dev server here instead? Instantiate dev server??
  // Probably want to keep that separate
  constructor(private _engine: EngineDelegate) {}

  /**
   * Returns all definitions (meta + click functionality)
   */

  getDefinitions(uri: string) {}

  /**
   * returns all document links in the file
   */

  getLinks(uri: string) {}

  /**
   * Returns list of options fro autocomplete
   */

  getAutoCompletionSuggestions(uri: string, position: number) {}

  /**
   */

  onEvent(listener) {}
}
