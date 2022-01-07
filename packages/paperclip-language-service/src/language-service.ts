/*

Considerations:

- auto-suggest based on import + relative files
- linting - emitting things to VS Code
- changes coming from language server
- Running language server in browser

*/

import { EngineDelegate, getEngineImports } from "@paperclipui/core";
import { Observable } from "@paperclipui/common";
import { AutocompleteService } from "./autocomplete";
import { collectASTInfo, ColorInfo } from "./collect-ast-info";
import { DiagnosticService } from "./error-service";

export class PaperclipLanguageService {
  private _autocomplete: AutocompleteService;
  private _diagnostics: DiagnosticService;
  readonly events: Observable;

  constructor(private _engine: EngineDelegate, fs?: any) {
    this.events = new Observable();
    this._autocomplete = new AutocompleteService(fs);
    this._diagnostics = new DiagnosticService(_engine);
    this.events.source(this._diagnostics.events);
  }

  /**
   * Returns all definitions (meta + click functionality)
   */

  getDefinitions(uri: string) {
    return this._collectASTInfo(uri).definitions;
  }

  /**
   * returns all document links in the file
   */

  getLinks(uri: string) {
    return this._collectASTInfo(uri).links;
  }

  /**
   */

  getDocumentColors(uri: string): ColorInfo[] {
    return this._collectASTInfo(uri).colors;
  }

  /**
   * Returns list of options fro autocomplete
   */

  getAutoCompletionSuggestions(uri: string, position: number = Infinity) {
    return this._autocomplete.getSuggestions(
      uri,
      this._engine.getVirtualContent(uri).substr(0, position),
      this._engine.getLoadedData(uri),
      getEngineImports(uri, this._engine)
    );
  }

  private _collectASTInfo(uri: string) {
    return collectASTInfo(
      uri,
      this._engine.getLoadedGraph(),
      this._engine.getAllLoadedData()
    );
  }
}
