import { EngineDelegate } from "paperclip";

export class AutocompleteService {
  constructor(private _engine: EngineDelegate) {}
  getSuggestions(position: number) {
    return [];
  }
}
