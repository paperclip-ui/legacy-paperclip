import { EngineDelegate } from "@paperclip-ui/core";
import { Logger, RPCClientAdapter, RPCServer } from "@paperclip-ui/common";
import { EventEmitter } from "events";
import { ClientConnection } from "./connection";
import { DocumentManager } from "./documents/manager";

export class EditorHost {
  /**
   */

  private _events: EventEmitter;
  private _documents: DocumentManager;

  /**
   */

  private constructor(
    private _engine: EngineDelegate,
    private _logger: Logger
  ) {
    this._events = new EventEmitter();
    this._documents = new DocumentManager(
      this._events,
      this._engine,
      this._logger
    );
  }

  getDocumentManager() {
    return this._documents;
  }

  /**
   */

  static async start(
    engine: EngineDelegate,
    server: RPCServer,
    logger: Logger
  ) {
    const host = new EditorHost(engine, logger);
    await host._listen(server);
    return host;
  }

  /**
   */

  private _listen(server: RPCServer) {
    server.onConnection((connection) => {
      this._addConnection(connection);
    });
  }

  /**
   */

  private _addConnection(connection: RPCClientAdapter) {
    new ClientConnection(
      this._documents,
      connection,
      this._events,
      this._engine,
      this._logger
    );
  }
}
