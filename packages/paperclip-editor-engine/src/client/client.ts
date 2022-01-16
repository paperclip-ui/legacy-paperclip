import { createDocument } from "./documents";
import { DOMFactory } from "@paperclip-ui/web-renderer/lib/base";
import { RPCClientAdapter } from "@paperclip-ui/common";

export type EditorClientOptions = {
  domFactory: DOMFactory;
};

export class EditorClient {
  private _resolveConnection: (Connection) => void;

  /**
   */

  constructor(
    private _connection: RPCClientAdapter,
    private _options: EditorClientOptions
  ) {}

  /**
   * Opens a new editable document
   */

  async open(documentUri: string) {
    const document = createDocument(
      documentUri,
      await this._connection,
      this._options
    );
    await document.open();
    return document;
  }
}
