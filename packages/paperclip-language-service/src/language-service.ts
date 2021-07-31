/*

Considerations:

- auto-suggest based on import + relative files
- linting - emitting things to VS Code
- changes coming from language server
- Running language server in browser

*/

import { EngineDelegate } from "paperclip";
import { AutocompleteService } from "./autocomplete/service";
import { collectASTInfo } from "./collect-ast-info";

export class PaperclipLanguageService {
  private _autocomplete: AutocompleteService;

  constructor(private _engine: EngineDelegate) {
    this._autocomplete = new AutocompleteService(this._engine);
  }

  /**
   * Returns all definitions (meta + click functionality)
   */

  getDefinitions(uri: string) {}

  /**
   * returns all document links in the file
   */

  getLinks(uri: string) {}

  /**
   */

  getDocumentColors(uri: string) {
    return this._collectASTInfo(uri).colors;
  }

  /**
   * Returns list of options fro autocomplete
   */

  getAutoCompletionSuggestions(uri: string, position: number) {}

  private _collectASTInfo(uri: string) {
    return collectASTInfo(uri, this._engine.getAllLoadedData());
  }
}
