import { IConnection } from "@tandem-ui/designer/src/sagas/rpc/connection";
import { EventEmitter } from "events";

export class WindowConnection implements IConnection {
  private _em: EventEmitter = new EventEmitter();
  constructor(private _worker: Worker | Window) {
    _worker.onmessage = (message) => {
      this._em.emit("message", message.data);
    };
  }
  async send(message: any): Promise<void> {
    this._worker.postMessage(message);
  }
  onMessage(listener: (message: any) => void): () => void {
    this._em.on("message", listener);
    return () => this._em.off("message", listener);
  }
  onDisconnect() {
    return () => {};
  }
  onOpen(listener: () => void): () => void {
    listener();
    return () => null;
  }
  dispose(): void {}
}
