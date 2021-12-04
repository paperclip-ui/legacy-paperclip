import SockJSClient from "sockjs-client";
import { EventEmitter } from "events";

export class Connection {
  private _client: WebSocket;
  private _events: EventEmitter = new EventEmitter();

  constructor() {
    const client = (this._client = new SockJSClient(
      location.protocol + "//" + location.host + "/rt"
    ));

    client.onopen = () => {
      this._events.emit("open");
    };

    client.onmessage = (message) => {
      this._events.emit("message", JSON.parse(message.data));
    };
  }
  send(message: any) {
    this._client.send(message);
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
