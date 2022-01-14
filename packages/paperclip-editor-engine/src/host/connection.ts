import { EngineDelegate, EngineDelegateEvent } from "@paperclip-ui/core";
import { EventEmitter } from "events";
import {
  sourceDocumentCRDTChangesChannel,
  openDocumentChannel,
  openDocumentSourceChannel,
  OpenDocumentResult,
  engineEventChannel
} from "../core";
import { Connection } from "../core/connection";
import { BaseDocument } from "./documents/base";
import { DocumentManager } from "./documents/manager";

export class ClientConnection {
  /**
   */

  private _openDocumentChannel: ReturnType<typeof openDocumentChannel>;
  private _engineEvents: ReturnType<typeof engineEventChannel>;
  private _openDocumentSourceChannel: ReturnType<
    typeof openDocumentSourceChannel
  >;
  private _sourceDocumentCRDTChangesChannel: ReturnType<
    typeof sourceDocumentCRDTChangesChannel
  >;
  private _openDocuments: Record<string, boolean>;

  /**
   */

  constructor(
    private _documents: DocumentManager,
    private _connection: Connection,
    private _events: EventEmitter,
    private _engine: EngineDelegate
  ) {
    this._openDocuments = {};
    this._openDocumentChannel = openDocumentChannel(this._connection);
    this._openDocumentChannel.listen(this._openDocument);
    this._engineEvents = engineEventChannel(this._connection);

    this._sourceDocumentCRDTChangesChannel = sourceDocumentCRDTChangesChannel(
      this._connection
    );
    this._sourceDocumentCRDTChangesChannel.listen(
      this._onsourceDocumentCRDTChanges
    );

    this._openDocumentSourceChannel = openDocumentSourceChannel(
      this._connection
    );
    this._openDocumentSourceChannel.listen(this._openDocumentSource);

    this._events.on(
      "sourceDocumentCRDTChanges",
      this._onInternalsourceDocumentCRDTChanges
    );

    this._connection.onDisconnect(() => {
      this._events.off(
        "sourceDocumentCRDTChanges",
        this._onInternalsourceDocumentCRDTChanges
      );
    });

    this._engine.onEvent(this._onEngineEvent);
  }

  /**
   */

  private _openDocument = async (uri: string): Promise<OpenDocumentResult> => {
    const doc = this._documents.open(uri);
    return {
      kind: doc.kind,
      content: await doc.load()
    };
  };

  /**
   */

  private _openDocumentSource = async (uri: string) => {
    this._openDocuments[uri] = true;
    const doc = this._documents.open(uri);
    const source = await doc.openSource();
    return source.toData();
  };

  /**
   */

  _onsourceDocumentCRDTChanges = async result => {
    this._events.emit("sourceDocumentCRDTChanges", result, this);
  };

  /**
   */

  _onInternalsourceDocumentCRDTChanges = (
    // type doesn't matter as much here, just use as a trampoline
    result: any,
    client: ClientConnection
  ) => {
    if (client === this) {
      return;
    }

    this._sourceDocumentCRDTChangesChannel.call(result);
  };

  private _onEngineEvent = (event: EngineDelegateEvent) => {
    this._engineEvents.call(event);
  };
}
