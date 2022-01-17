import { EngineDelegate } from "@paperclip-ui/core";
import { RPCServer } from "@paperclip-ui/common";
import { EventEmitter } from "events";
// import { RPCClient } from "../core/rpc";
import { ClientConnection } from "./connection";
import { DocumentManager } from "./documents/manager";

export type EditorHostOptions = {};

export class EditorHost {
  /**
   */

  private _events: EventEmitter;
  private _documents: DocumentManager;

  /**
   */

  private constructor(
    private _engine: EngineDelegate,
    private _server: RPCServer
  ) {
    this._events = new EventEmitter();
    this._documents = new DocumentManager(this._events, this._engine);
  }

  static async start(engine: EngineDelegate, server: RPCServer) {
    const host = new EditorHost(engine, server);
    await host._start();
    return host;
  }

  /**
   */

  private _start() {
    this._server.onConnection(connection => {
      new ClientConnection(
        this._documents,
        connection,
        this._events,
        this._engine
      );
    });
  }
}
