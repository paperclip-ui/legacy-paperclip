import { EngineDelegate } from "@paperclip-ui/core";
import * as sockjs from "sockjs";
import { Connection } from "./connection";
import { InternalHost } from "./internal-host";

export type EditorHostOptions = {};

export class EditorHost {
  /**
   */

  private _connections: Connection[];
  private _internal: InternalHost;

  /**
   */

  constructor(private _engine: EngineDelegate, private _server: sockjs.Server) {
    this._internal = new InternalHost(this._engine);
  }

  /**
   */

  start() {
    this._server.on("connection", connection => {
      this._connections.push(new Connection(connection, this._internal));
    });
  }
}
