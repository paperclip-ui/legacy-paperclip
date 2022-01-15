/**
 * Editable virtual object document
 */

import { sourceDocumentCRDTChangesChannel } from "../../../core";
import { Connection } from "../../../core/connection";
import { CRDTTextDocument } from "../../../core/crdt-document";

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
    private _textDocument: CRDTTextDocument,
    connection: Connection
  ) {
    this._sourceDocumentCRDTChanges = sourceDocumentCRDTChangesChannel(
      connection
    );
    this._sourceDocumentCRDTChanges.listen(this._onSourceDocumentCRDTChanges);
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
