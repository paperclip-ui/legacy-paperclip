import { Options } from "../app";
import { REPLChannels } from "./channels";
import { WindowConnection } from "./worker-connection";

export class ParentController {
  private _worker: Worker;
  private _workerConnection: WindowConnection;
  private _channels: REPLChannels;

  constructor(private _options: Options) {
    this._worker = new Worker(new URL("./worker/entry.ts", import.meta.url));
    this._workerConnection = new WindowConnection(this._worker);
  }
  getWorkerConnection() {
    return this._workerConnection;
  }
}
