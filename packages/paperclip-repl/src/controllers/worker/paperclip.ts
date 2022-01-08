import { loadEngineDelegate } from "@paperclip-ui/core/browser";
import { EngineIO } from "@paperclip-ui/core/src/core/delegate";
import { EngineDelegate } from "@paperclip-ui/core";
import { Channels } from "@tandem-ui/designer/src/sagas/rpc/channels";

export class PaperclipController {
  private _engine: EngineDelegate;

  constructor(private _channels: Channels, private _io: EngineIO) {}
  async init() {
    this._engine = await loadEngineDelegate({ io: this._io }, this._onCrash);
    return this._engine;
  }

  _onCrash = () => {};
}
