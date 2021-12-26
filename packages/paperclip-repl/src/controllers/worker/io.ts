import { EngineIO } from "paperclip/src/core/delegate";
import * as path from "path";
import { Channels } from "../channels";

export class ReplEngineIO implements EngineIO {
  private _files: Record<string, string>;
  constructor(private _channels: Channels) {}
  async init() {
    this._files = await this._channels.getFiles.call(null);
  }
  readFile = (filePath: string) => {
    return this._files[filePath];
  };
  resolveFile = (fromPath: string, toPath: string) => {
    return path.join(path.dirname(fromPath), toPath);
  };
  fileExists = (filePath: string) => {
    return this._files[filePath] != null;
  };
}
