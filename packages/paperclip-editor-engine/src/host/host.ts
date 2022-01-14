import { EngineDelegate } from "@paperclip-ui/core";
import { EventEmitter } from "events";
import * as sockjs from "sockjs";
import { openDocumentChannel } from "../core";
import { RPCClient } from "../core/rpc";
import { ClientConnection } from "./connection";
import { PCDocumentManager } from "./documents";

export type EditorHostOptions = {};

export class EditorHost {
  /**
   */

  private _events: EventEmitter;
  private _documents: PCDocumentManager;

  /**
   */

  constructor(private _engine: EngineDelegate, private _server: RPCClient) {
    this._events = new EventEmitter();
    this._documents = new PCDocumentManager(this._engine);
  }

  /**
   */

  start() {
    this._server.onConnection(connection => {
      new ClientConnection(this._documents, connection, this._events);
    });
  }
}
