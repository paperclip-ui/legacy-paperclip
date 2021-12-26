import { Options } from "../app";
import { Channels } from "./channels";

export class ChannelHandler {
  constructor(private _channels: Channels, private _options: Options) {
    this._channels.getFiles.listen(this.getFiles);
  }
  getFiles = () => Promise.resolve(this._options.files);
}
