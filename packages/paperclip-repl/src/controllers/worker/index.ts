import { IConnection } from "tandem-designer/src/sagas/rpc/connection";
import { Channels } from "tandem-designer/src/sagas/rpc/channels";
import { PaperclipController } from "./paperclip";
import { EngineIO } from "paperclip/src/core/delegate";

export class REPLWorker {
  private _channels: Channels;
  private _paperclip: PaperclipController;
  private _io: EngineIO;

  constructor(private _connection: IConnection) {
    this._channels = new Channels(this._connection);
    this._paperclip = new PaperclipController(this._channels, this._io);
  }
}
