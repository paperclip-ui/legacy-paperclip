/**
 * Editable virtual object document
 */

import * as Automerge from "automerge";
import { crdtChangesChannel, openDocumentChannel } from "../core";
import { Connection } from "../core/connection";
import { SourceDocument } from "../core/source-document";

/**
 */

export class ClientDocument {
  /**
   */

  private _crdtChanges: ReturnType<typeof crdtChangesChannel>;
  private _openDocument: ReturnType<typeof openDocumentChannel>;
  private _source: SourceDocument;

  /**
   */

  constructor(private _uri: string, private _connection: Connection) {
    this._crdtChanges = crdtChangesChannel(this._connection);
    this._openDocument = openDocumentChannel(this._connection);
    this._crdtChanges.listen(this._onCRDTChanges);
  }

  /**
   */

  async open() {
    const { source } = await this._openDocument.call(this._uri);
    this._source = SourceDocument.load(source);
  }

  /**
   */

  getSourceText() {
    return this._source.getText();
  }

  /**
   * synchronous by default because it needs to be
   */

  insertNodeBefore() {
    // this._connection.sendMessage({ kind: MessageKind.VirtualObjectEdits, changes })
  }

  /**
   */

  insertSourceText(
    charClusters: string[],
    start: number = 0,
    deleteCount: number = 0
  ) {
    const changes = this._source.setText(charClusters, start, deleteCount);
    this._crdtChanges.call(changes);
  }

  /**
   */

  private _onCRDTChanges = async (changes: Automerge.BinaryChange[]) => {
    this._source.applyChanges(changes);
  };
}
