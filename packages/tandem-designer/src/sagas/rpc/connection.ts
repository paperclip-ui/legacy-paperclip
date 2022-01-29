import { EventEmitter } from "events";

export interface IConnection {
  send(messsage: any): Promise<void>;
  onMessage(listener: (message: any) => void): () => void;
  onOpen(listener: () => void): () => void;
  dispose(): void;
}

export class SockConnection implements IConnection {
  private _client: WebSocket;
  private _events: EventEmitter = new EventEmitter();
  private _open: Promise<any>;

  constructor() {
    this._open = new Promise((resolve) => {
      this._events.on("open", resolve);
    });
  }
  async send(message: any) {
    await this._open;
    this._client.send(JSON.stringify(message));
  }
  onMessage(listener: (message: any) => void) {
    this._events.on("message", listener);
    return () => this._events.off("message", listener);
  }
  onOpen(listener: () => void) {
    this._events.on("open", listener);
    return () => this._events.off("open", listener);
  }
  dispose() {
    this._client.close();
  }
}
