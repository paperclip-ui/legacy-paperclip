import { Options } from "../app";
import { REPLChannels } from "./channels";

export class ChannelHandler {
  constructor(private _channels: REPLChannels, private _options: Options) {
    this._channels.getFiles.listen(this.getFiles);
  }
  getFiles = () => Promise.resolve(this._options.files);
}
