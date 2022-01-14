/**
 * Editable virtual object document
 */

import { openDocumentChannel, OpenDocumentResult } from "../../core";
import { Connection } from "../../core/connection";
import { DocumentKind } from "../../core/documents";

export abstract class BaseDocument<
  TContent extends OpenDocumentResult["content"]
> {
  abstract readonly kind: DocumentKind;

  private _openDocument: ReturnType<typeof openDocumentChannel>;
  protected _content: TContent;

  constructor(readonly uri: string, protected _connection: Connection) {
    this._openDocument = openDocumentChannel(_connection);
  }

  /**
   */

  getContent() {
    return this._content;
  }

  /**
   */

  async open() {
    const result = await this._openDocument.call(this.uri);
    this._content = result.content as TContent;
  }

  /**
   */

  protected _updateContent(content: TContent) {
    this._content = content;
    // TODO: emit changes?
  }
}
