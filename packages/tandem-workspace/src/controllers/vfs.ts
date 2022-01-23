import * as fs from "fs";
import * as URL from "url";
import { EventEmitter } from "events";
import { Logger } from "@paperclip-ui/common";

export class VFS {
  private _contents: Record<string, string>;
  private _events: EventEmitter;
  constructor(private _autoSave: boolean, private _logger: Logger) {
    this._contents = {};
    this._events = new EventEmitter();
  }
  onChange(listener: (uri: string, content: string) => void) {
    this._events.on("change", listener);
    return () => {
      this._events.off("change", listener);
    };
  }
  updateFileContent(uri: string, content: string) {
    this._contents[uri] = content;
    this._events.emit("change", uri, content);

    if (this._autoSave) {
      this._logger.info(`Auto-saving ${uri}`);
      fs.writeFileSync(URL.fileURLToPath(uri), content);
    }
  }
  async readFileContent(uri: string) {
    return (
      this._contents[uri] ||
      new Promise((resolve) => {
        fs.readFile(URL.fileURLToPath(uri), "utf-8", function (err, result) {
          resolve(result);
        });
      })
    );
  }
  saveAll() {}
}
