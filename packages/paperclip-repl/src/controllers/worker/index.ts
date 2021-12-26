import { IConnection } from "tandem-designer/src/sagas/rpc/connection";
import { Channels as DesignerChannels } from "tandem-designer/src/sagas/rpc/channels";
import { PaperclipController } from "./paperclip";
import { EngineIO } from "paperclip/src/core/delegate";
import { Channels } from "../channels";
import { ReplEngineIO } from "./io";
import { DesignerChannelHandler } from "./designer-channel-handler";
import { WindowConnection } from "../worker-connection";

export class REPLWorker {
  private _designerChannels: DesignerChannels;
  private _replChannels: Channels;
  private _paperclip: PaperclipController;
  private _io: ReplEngineIO;
  private _channelHandler: DesignerChannelHandler;

  constructor(private _connection: WindowConnection) {}
  async init() {
    this._designerChannels = new DesignerChannels(this._connection);
    this._channelHandler = new DesignerChannelHandler(this._designerChannels);
    this._replChannels = new Channels(this._connection);
    this._io = new ReplEngineIO(this._replChannels);
    await this._io.init();
    this._paperclip = new PaperclipController(this._designerChannels, this._io);
    const engine = await this._paperclip.init();
    console.log("ONFDFSD");
    this._channelHandler.init(engine);
  }
}
