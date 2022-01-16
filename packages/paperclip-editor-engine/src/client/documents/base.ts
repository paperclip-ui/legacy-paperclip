/**
 * Editable virtual object document
 */

import { openDocumentChannel, OpenDocumentResult } from "../../core";
import { DocumentKind } from "../../core/documents";
import { EventEmitter } from "events";
import { createListener } from "../../core/utils";
import { RPCClientAdapter } from "@paperclip-ui/common";

export abstract class BaseDocument<
  TContent extends OpenDocumentResult["content"]
> {
  abstract readonly kind: DocumentKind;

  private _openDocument: ReturnType<typeof openDocumentChannel>;
  protected _content: TContent;
  protected _em: EventEmitter;

  constructor(readonly uri: string, protected _connection: RPCClientAdapter) {
    this._em = new EventEmitter();
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
    this._em.emit("contentLoaded", this._content);
  }

  /**
   */

  onContentLoaded(listener: (content: TContent) => void) {
    return createListener(this._em, "contentLoaded", listener);
  }

  /**
   */

  protected _updateContent(content: TContent) {
    this._content = content;
    // TODO: emit changes?
  }
}
