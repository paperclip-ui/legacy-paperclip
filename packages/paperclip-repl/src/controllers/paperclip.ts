import { loadEngineDelegate } from "paperclip/browser";
import { EngineIO } from "paperclip/src/core/delegate";
import { EngineDelegate } from "paperclip";

export class PaperclipEngine {
  private _engine: EngineDelegate;
  constructor(private _io: EngineIO) {}
  async load() {
    this._engine = await loadEngineDelegate(
      {
        io: this._io
      },
      this._onCrash
    );
  }
  _onCrash = () => {
    console.warn("CRASH");
  };
}
