import { DocumentManager } from "./documents";
import { DOMFactory } from "@paperclip-ui/web-renderer/lib/base";
import { RPCClientAdapter } from "@paperclip-ui/common";

export type EditorClientOptions = {
  domFactory: DOMFactory;
};

export class EditorClient {
  private _documents: DocumentManager;

  /**
   */

  constructor(
    private _connection: RPCClientAdapter,
    private _options: EditorClientOptions
  ) {
    this._documents = new DocumentManager(this._connection, this._options);
  }

  /**
   */

  getDocuments() {
    return this._documents;
  }
}
