import { EngineDelegate } from "@paperclip-ui/core";
import { EventEmitter } from "events";
import * as sockjs from "sockjs";
import { openDocumentChannel } from "../core";
import { RPCClient } from "../core/rpc";
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

  constructor(private _engine: EngineDelegate, private _server: RPCClient) {
    this._events = new EventEmitter();
    this._documents = new DocumentManager(this._events, this._engine);
  }

  /**
   */

  start() {
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
