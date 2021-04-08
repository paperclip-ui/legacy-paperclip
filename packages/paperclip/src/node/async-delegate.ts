export class AsyncEngineDelegate {
  private _worker: Worker;
  constructor() {
    const worker = (this._worker = new Worker(
      __dirname + "/delegate-worker.js"
    ));
    worker.onmessage = this._onMessage;
  }

  // eslint-disable-next-line
  private _onMessage(message: any) {}
}
