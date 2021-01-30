import { IPaperclipEngineHandler } from "./base";

export class PaperclipEngineWorkerHandler implements IPaperclipEngineHandler {
  private _worker: Worker;

  constructor() {
    this._worker = new Worker(new URL("./worker.js", import.meta.url));
    console.log("HANDLE IT");
    this._worker.onmessage = () => {

    }
    this._worker.onerror = () => {
      console.log("EE")
    }
  }

  getAST(uri: string) {
    return Promise.resolve(null);
  }
}