/**
 * Editable virtual object document
 */

import { RPCClientAdapter } from "@paperclip-ui/common";
import { sourceDocumentCRDTChangesChannel } from "../../../core";
import { CRDTTextDocument } from "../../../core/crdt-document";
import { EventEmitter } from "events";

/**
 */

export class PCSourceDocument {
  private _sourceDocumentCRDTChanges: ReturnType<
    typeof sourceDocumentCRDTChangesChannel
  >;

  /**
   */

  constructor(
    private _uri: string,
    private _bus: EventEmitter,
    private _textDocument: CRDTTextDocument
  ) {
    this._bus.on("documentSourceChanged", this._onSourceDocumentCRDTChanges);
  }

  /**
   */

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

  /**
   */

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
