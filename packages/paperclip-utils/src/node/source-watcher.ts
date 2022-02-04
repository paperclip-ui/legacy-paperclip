import * as chokidar from "chokidar";
import * as path from "path";
import * as url from "url";
import { EventEmitter } from "events";
import { paperclipSourceGlobPattern } from "../core/utils";
import { isPaperclipResourceFile } from "..";

export enum ChangeKind {
  Removed,
  Added,
  Changed,
}

const CHOKIDAR_EVENT_MAP = {
  add: ChangeKind.Added,
  unlink: ChangeKind.Removed,
  change: ChangeKind.Changed,
};

export class PaperclipResourceWatcher {
  private _em: EventEmitter;
  private _watcher: chokidar.FSWatcher;
  constructor(private _srcDir: string, readonly cwd: string) {
    this._em = new EventEmitter();
    this._init();
  }
  onChange(listener: (changeKind: ChangeKind, filePath: string) => void) {
    this._em.on("change", listener);
    return () => this._em.off("change", listener);
  }
  dispose() {
    this._watcher.close();
  }
  private _init() {
    const watcher = (this._watcher = chokidar.watch(
      paperclipSourceGlobPattern(this._srcDir),
      {
        cwd: this.cwd,
        ignoreInitial: true,
        ignored: "**/node_modules/**",
        followSymlinks: true,
      }
    ));
    watcher.on("all", (eventName, relativePath) => {
      if (!isPaperclipResourceFile(relativePath)) {
        return;
      }
      const filePath =
        relativePath.charAt(0) !== "/"
          ? path.join(this.cwd, relativePath)
          : relativePath;

      const changeKind = CHOKIDAR_EVENT_MAP[eventName];
      if (changeKind) {
        this._em.emit("change", changeKind, url.pathToFileURL(filePath).href);
      }
    });
  }
}
