import { loadEngineDelegate } from "@paperclipui/core/browser";
import { EngineIO } from "@paperclipui/core/src/core/delegate";
import { EngineDelegate } from "@paperclipui/core";
import { Channels } from "tandem-designer/src/sagas/rpc/channels";

export class PaperclipController {
  private _engine: EngineDelegate;

  constructor(private _channels: Channels, private _io: EngineIO) {}
  async init() {
    this._engine = await loadEngineDelegate({ io: this._io }, this._onCrash);
    return this._engine;
  }

  _onCrash = () => {};
}
