import { loadEngineDelegate } from "@paperclip-ui/core/browser";
import { EngineIO } from "@paperclip-ui/core/src/core/delegate";
import { EngineDelegate } from "@paperclip-ui/core";

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
