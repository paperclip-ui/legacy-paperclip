import * as http from "http";
import sockjs from "sockjs";
import { EventEmitter } from "events";

export class SocketIo extends EventEmitter {
  constructor(private _server: http.Server) {
    super();
    const io = sockjs.createServer();
    io.on("connection", conn => {
      this.emit("connection", conn);
    });
    io.installHandlers(this._server, { prefix: "/rt" });
  }
}
