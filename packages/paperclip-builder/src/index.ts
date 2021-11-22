import { PaperclipConfig } from "paperclip-utils";
import EventEmitter from "events";

export type Options = {
  cwd?: string;
  watch?: boolean;
};

class BuildProcess {
  constructor(private _em: EventEmitter) {}
  onFile(cb: (file: string) => void) {
    this._em.on("file", cb);
  }
  onError(cb: (error: Error, file: string) => void) {
    this._em.on("error", cb);
  }
  onEnd(cb: (file: string) => void) {
    this._em.on("end", cb);
  }
}

export const build = (config: PaperclipConfig, options: Options) => {
  const em = new EventEmitter();

  return new BuildProcess(em);
};
