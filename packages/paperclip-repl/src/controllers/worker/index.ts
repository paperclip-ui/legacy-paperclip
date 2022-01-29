import { IConnection } from "@tandem-ui/designer/src/sagas/rpc/connection";
import { Channels as DesignerChannels } from "@tandem-ui/designer/src/sagas/rpc/channels";
import { PaperclipController } from "./paperclip";
import { EngineIO } from "@paperclip-ui/core/src/core/delegate";
import { REPLChannels } from "../channels";
import { ReplEngineIO } from "./io";
// import { DesignerChannelHandler } from "./designer-channel-handler";
import { WindowConnection } from "../worker-connection";

export class REPLWorker {
  private _designerChannels: DesignerChannels;
  private _replChannels: REPLChannels;
  private _paperclip: PaperclipController;
  private _io: ReplEngineIO;
  // private _channelHandler: DesignerChannelHandler;

  constructor(private _connection: WindowConnection) {}
  async init() {
    this._designerChannels = new DesignerChannels(this._connection);
    this._replChannels = new REPLChannels(this._connection);
    // this._channelHandler = new DesignerChannelHandler(
    //   this._designerChannels,
    //   this._replChannels
    // );
    this._io = new ReplEngineIO(this._replChannels);
    await this._io.init();
    this._paperclip = new PaperclipController(this._designerChannels, this._io);
    const engine = await this._paperclip.init();
    // this._channelHandler.init(engine);
  }
}
