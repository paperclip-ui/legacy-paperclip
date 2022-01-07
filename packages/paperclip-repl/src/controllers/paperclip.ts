import { loadEngineDelegate } from "@paperclipui/core/browser";
import { EngineIO } from "@paperclipui/core/src/core/delegate";
import { EngineDelegate } from "@paperclipui/core";

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
