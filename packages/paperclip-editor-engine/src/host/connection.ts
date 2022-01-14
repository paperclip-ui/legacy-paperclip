import { EngineDelegate } from "@paperclip-ui/core";
import * as Automerge from "automerge";
import { EventEmitter } from "events";
import * as sockjs from "sockjs";
import { crdtChangesChannel, openDocumentChannel } from "../core";
import { Connection } from "../core/connection";
import { PCDocumentManager } from "./documents";
// import { InternalHost } from "./internal-host";

export class ClientConnection {
  /**
   */

  private _openDocumentChannel: ReturnType<typeof openDocumentChannel>;
  private _crdtChangesChannel: ReturnType<typeof crdtChangesChannel>;

  /**
   */

  constructor(
    private _documents: PCDocumentManager,
    private _connection: Connection,
    private _events: EventEmitter
  ) {
    this._openDocumentChannel = openDocumentChannel(this._connection);
    this._openDocumentChannel.listen(this._openDocument);

    this._crdtChangesChannel = crdtChangesChannel(this._connection);
    this._crdtChangesChannel.listen(this._onCRDTChanges);

    this._events.on("crdtChanges", this._onInternalCRDTChanges);

    this._connection.onDisconnect(() => {
      this._events.off("crdtChanges", this._onInternalCRDTChanges);
    });
  }

  /**
   */

  private _openDocument = async (uri: string) => {
    const document = this._documents.open(uri);
    return {
      source: document.getBinarySourceDocument()
    };
  };

  /**
   */

  _onCRDTChanges = async (changes: Automerge.BinaryChange[]) => {
    this._events.emit("crdtChanges", changes, this);
  };

  /**
   */

  _onInternalCRDTChanges = (
    changes: Automerge.BinaryChange[],
    client: ClientConnection
  ) => {
    if (client === this) {
      return;
    }

    this._crdtChangesChannel.call(changes);
  };
}
