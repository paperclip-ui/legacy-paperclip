import { EngineIO } from "@paperclip-ui/core/src/core/delegate";
import { fileURLToPath, pathToFileURL } from "@paperclip-ui/utils/lib/core/url";
import * as path from "path";
import { REPLChannels } from "../channels";

export class ReplEngineIO implements EngineIO {
  private _files: Record<string, string>;
  constructor(private _channels: REPLChannels) {}
  async init() {
    // this._files = await this._channels.getFiles.call(null);
  }
  readFile = (filePath: string) => {
    return this._files[filePath];
  };
  resolveFile = (fromPath: string, toPath: string) => {
    return pathToFileURL(
      path.join(fileURLToPath(path.dirname(fromPath)), toPath)
    ).href;
  };
  fileExists = (filePath: string) => {
    return this._files[filePath] != null;
  };
}
