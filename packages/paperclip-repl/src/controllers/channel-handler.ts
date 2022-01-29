import { Options } from "../app";
import { REPLChannels } from "./channels";

export class ChannelHandler {
  constructor(private _channels: REPLChannels, private _options: Options) {
    // this._channels.getFiles.listen(this.getFiles);
    // this._channels.getMainFile.listen(this.getMainFile);
  }
  getFiles = () => Promise.resolve(this._options.files);
  getMainFile = () => Promise.resolve(this._options.entry);
}
