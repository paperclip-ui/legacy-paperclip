import { RPCClientAdapter } from "@paperclip-ui/common";
import { EngineDelegate, EngineDelegateEvent } from "@paperclip-ui/core";
import { EventEmitter } from "events";
import { Logger } from "@paperclip-ui/common";
import {
  sourceDocumentCRDTChangesChannel,
  openDocumentChannel,
  openDocumentSourceChannel,
  OpenDocumentResult,
  engineEventChannel,
  VirtualObjectEdit,
  OpenDocumentPCResult,
} from "../core";
import { editVirtualObjectsChannel } from "../core/channels";
import { DocumentManager } from "./documents/manager";
import { PCDocumentEditor } from "./documents/pc-document-editor";

// process.on("unhandledRejection", reason => {
//   console.log(reason);
// });

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
  private _editVirtualObjects: ReturnType<typeof editVirtualObjectsChannel>;
  private _pcDocumentEditor: PCDocumentEditor;

  /**
   */

  constructor(
    private _documents: DocumentManager,
    private _connection: RPCClientAdapter,
    private _events: EventEmitter,
    private _engine: EngineDelegate,
    private _logger: Logger
  ) {
    this._pcDocumentEditor = new PCDocumentEditor(
      this._documents,
      this._engine
    );
    this._editVirtualObjects = editVirtualObjectsChannel(this._connection);
    this._editVirtualObjects.listen(this._handleEditVirtualObjects);
    this._openDocumentChannel = openDocumentChannel(this._connection);
    this._openDocumentChannel.listen(this._openDocument);
    this._engineEvents = engineEventChannel(this._connection);

    this._sourceDocumentCRDTChangesChannel = sourceDocumentCRDTChangesChannel(
      this._connection
    );
    this._sourceDocumentCRDTChangesChannel.listen(
      this._onSourceDocumentCRDTChanges
    );

    this._openDocumentSourceChannel = openDocumentSourceChannel(
      this._connection
    );
    this._openDocumentSourceChannel.listen(this._openDocumentSource);

    this._events.on(
      "incommingCRDTChanges",
      this._onInternalSourceDocumentCRDTChanges
    );

    this._events.on(
      "outgoingCRDTChanges",
      this._onInternalSourceDocumentCRDTChanges
    );

    this._connection.onDisconnect(() => {
      this._events.off(
        "incommingCRDTChanges",
        this._onInternalSourceDocumentCRDTChanges
      );
      this._events.off(
        "outgoingCRDTChanges",
        this._onInternalSourceDocumentCRDTChanges
      );
    });

    this._engine.onEvent(this._onEngineEvent);
  }

  /**
   */

  private _handleEditVirtualObjects = async (
    allEdits: Record<string, VirtualObjectEdit[]>
  ) => {
    try {
      for (const uri in allEdits) {
        this._pcDocumentEditor.applyVirtualObjectEdits(uri, allEdits[uri]);
      }
    } catch (e) {
      this._logger.error(e.stack);
    }
  };

  /**
   */

  private _openDocument = async (uri: string): Promise<OpenDocumentResult> => {
    const doc = this._documents.open(uri);
    const ret = {
      kind: doc.kind,
      content: await doc.load(),
    };
    return ret as OpenDocumentPCResult;
  };

  /**
   */

  private _openDocumentSource = async (uri: string) => {
    const doc = this._documents.open(uri);
    const source = await doc.openSource();
    return source.toData();
  };

  /**
   */

  _onSourceDocumentCRDTChanges = async (result) => {
    this._logger.verbose("ClientConnection::_onSourceDocumentCRDTChanges");
    this._events.emit("incommingCRDTChanges", result, this);
  };

  /**
   */

  _onInternalSourceDocumentCRDTChanges = (
    // type doesn't matter as much here, just use as a trampoline
    result: any,
    client: ClientConnection
  ) => {
    if (client === this) {
      return;
    }

    this._logger.verbose(
      "ClientConnection::_onInternalSourceDocumentCRDTChanges"
    );

    this._sourceDocumentCRDTChangesChannel.call(result).catch((e) => {
      console.error("ERR", e);
    });
  };

  private _onEngineEvent = (event: EngineDelegateEvent) => {
    this._engineEvents.call(event).catch((e) => {
      this._logger.error(`Failed to emit engine event`);
    });
  };
}
