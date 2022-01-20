import { EventEmitter } from "events";
import { RPCClientAdapter } from "@paperclip-ui/common";
import { isPaperclipFile } from "@paperclip-ui/utils";
import { EditorClientOptions } from "../client";
import { PCDocument } from "./pc";
import { createListener } from "../../core/utils";

export { PCDocument };

export type Document = PCDocument;

export class DocumentManager {
  private _documents: Record<string, Document> = {};
  private _em: EventEmitter;

  constructor(
    private _connection: RPCClientAdapter,
    private _options: EditorClientOptions
  ) {
    this._em = new EventEmitter();
  }
  onDocumentChanged(listener: (document: Document) => void) {
    return createListener(this._em, "documentChanged", listener);
  }
  async open(uri: string) {
    return (
      this._documents[uri] || (this._documents[uri] = await this._open(uri))
    );
  }
  private async _open(uri: string) {
    const doc = createDocument(uri, this._connection, this._options);
    const dispose = doc.onAppliedChanges(() => {
      this._em.emit("documentChanged", doc);
    });
    await doc.open();
    return doc;
  }
}

const createDocument = (
  uri: string,
  connection: RPCClientAdapter,
  options: EditorClientOptions
): Document => {
  if (isPaperclipFile(uri)) {
    return new PCDocument(uri, connection, options);
  }

  // need to handle text plain, binary files, images

  throw new Error(`Don't know how to open ${uri}`);

  return null;
};
