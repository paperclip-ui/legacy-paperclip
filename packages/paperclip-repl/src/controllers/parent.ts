import { WindowConnection } from "./worker-connection";

export class ParentController {
  private _worker: Worker;
  constructor() {
    this._worker = new Worker(new URL("./worker/entry.ts", import.meta.url));
  }
  getWindowConnection() {
    return new WindowConnection(this._worker);
  }
}
