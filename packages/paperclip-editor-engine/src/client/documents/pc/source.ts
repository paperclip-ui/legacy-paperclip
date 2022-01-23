/**
 * Editable virtual object document
 */

import { RPCClientAdapter } from "@paperclip-ui/common";
import { sourceDocumentCRDTChangesChannel } from "../../../core";
import { CRDTTextDocument, TextEdit } from "../../../core/crdt-document";
import { EventEmitter } from "events";

/**
 */

export class PCSourceDocument {
  /**
   */

  constructor(
    private _uri: string,
    private _bus: EventEmitter,
    private _textDocument: CRDTTextDocument
  ) {
    this._bus.on("documentSourceChanged", this._onSourceDocumentCRDTChanges);
  }

  applyEdits(edits: TextEdit[]) {
    this._textDocument.applyEdits(edits);
  }

  /**
   */

  insertText(chars: string[], index: number = 0, deleteCount: number = 0) {
    return this.applyEdits([{ chars, index, deleteCount }]);
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
