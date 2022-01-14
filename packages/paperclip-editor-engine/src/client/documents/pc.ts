/**
 * Editable virtual object document
 */

import {
  EngineDelegateEvent,
  EngineDelegateEventKind,
  LoadedData,
  LoadedPCData,
  Mutation,
  patchVirtNode
} from "@paperclip-ui/core";
import * as Automerge from "automerge";
import {
  sourceDocumentCRDTChangesChannel,
  openDocumentChannel,
  openDocumentSourceChannel,
  engineEventChannel
} from "../../core";
import { Connection } from "../../core/connection";
import { CRDTTextDocument } from "../../core/crdt-document";
import { DocumentKind } from "../../core/documents";
import { BaseDocument } from "./base";

/**
 */

class PCSourceDocument {
  private _sourceDocumentCRDTChanges: ReturnType<
    typeof sourceDocumentCRDTChangesChannel
  >;
  constructor(
    private _uri: string,
    private _textDocument: CRDTTextDocument,
    connection: Connection
  ) {
    this._sourceDocumentCRDTChanges = sourceDocumentCRDTChangesChannel(
      connection
    );
    this._sourceDocumentCRDTChanges.listen(this._onSourceDocumentCRDTChanges);
  }
  insertText(
    charClusters: string[],
    start: number = 0,
    deleteCount: number = 0
  ) {
    const changes = this._textDocument.setText(
      charClusters,
      start,
      deleteCount
    );
    this._sourceDocumentCRDTChanges.call({ uri: this._uri, changes });
  }
  getText() {
    return this._textDocument.getText();
  }
  /**
   */

  private _onSourceDocumentCRDTChanges = async ({ uri, changes }) => {
    if (uri !== this._uri) {
      return;
    }
    this._textDocument.applyChanges(changes);
  };
}

/**
 * TODO: include preview with this document
 */

export class PCDocument extends BaseDocument<{ virtualData: LoadedPCData }> {
  readonly kind = DocumentKind.Paperclip;
  /**
   */

  private _openDocumentSource: ReturnType<typeof openDocumentSourceChannel>;
  private _engineEvents: ReturnType<typeof engineEventChannel>;
  private _source?: PCSourceDocument;

  /**
   */

  constructor(uri: string, connection: Connection) {
    super(uri, connection);
    this._openDocumentSource = openDocumentSourceChannel(connection);
    this._engineEvents = engineEventChannel(connection);
    this._engineEvents.listen(this._onEngineEvent);
  }

  /**
   */

  async getSource() {
    if (this._source) {
      return this._source;
    }

    return (this._source = new PCSourceDocument(
      this.uri,
      CRDTTextDocument.load(await this._openDocumentSource.call(this.uri)),
      this._connection
    ));
  }

  /**
   * synchronous by default because it needs to be
   */

  insertNodeBefore() {
    // this._connection.sendMessage({ kind: MessageKind.VirtualObjectEdits, changes })
  }

  /**
   */

  private _getSource = async () => {};

  private _onEngineEvent = async (event: EngineDelegateEvent) => {
    if (event.uri !== this.uri) {
      return;
    }

    let newData: LoadedPCData = {
      ...this._content.virtualData
    };

    if (event.kind === EngineDelegateEventKind.Loaded) {
      newData = event.data as LoadedPCData;
    } else if (event.kind === EngineDelegateEventKind.Diffed) {
      newData.preview = patchVirtNode(
        newData.preview,
        event.data.mutations as Mutation[]
      );
    }

    this._updateContent({ virtualData: newData });
  };
}
