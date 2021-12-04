import SockJSClient from "sockjs-client";
import { EventEmitter } from "events";

export class Connection {
  private _client: WebSocket;
  private _events: EventEmitter = new EventEmitter();
  private _open: Promise<any>;

  constructor() {
    this._open = new Promise(resolve => {
      this._events.on("open", resolve);
    });
    const client = (this._client = new SockJSClient(
      location.protocol + "//" + location.host + "/rt"
    ));

    client.onopen = () => {
      this._events.emit("open");
    };

    client.onmessage = message => {
      this._events.emit("message", JSON.parse(message.data));
    };
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
