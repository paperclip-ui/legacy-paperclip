import { EventEmitter } from "events";
import { RPCClientAdapter } from "@paperclip-ui/common";
import { isPaperclipFile } from "@paperclip-ui/utils";
import { EditorClientOptions } from "../client";
import { PCDocument } from "./pc";
import { createListener } from "../../core/utils";
import { sourceDocumentCRDTChangesChannel } from "../../core";
import { BinaryChange } from "automerge";

export { PCDocument };

export type Document = PCDocument;

export class DocumentManager {
  private _documents: Record<string, Document> = {};
  private _em: EventEmitter;
  private _sourceDocumentCRDTChanges: ReturnType<
    typeof sourceDocumentCRDTChangesChannel
  >;

  constructor(private _connection: RPCClientAdapter) {
    this._em = new EventEmitter();
    this._sourceDocumentCRDTChanges = sourceDocumentCRDTChangesChannel(
      this._connection
    );
    this._sourceDocumentCRDTChanges.listen(this._onDocumentSourceChanged);
  }
  onDocumentSourceChanged(
    listener: (info: { uri: string; changes: BinaryChange[] }) => void
  ) {
    return createListener(this._em, "documentSourceChanged", listener);
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
    const doc = createDocument(uri, this._em, this._connection);
    doc.onAppliedChanges(() => {
      this._em.emit("documentChanged", doc);
    });
    doc.onSourceEdited((changes) => {
      console.log("DocumentManager::onSourceEdited");
      this._sourceDocumentCRDTChanges.call({ uri: doc.uri, changes });
    });
    await doc.open();
    return doc;
  }
  private _onDocumentSourceChanged = async (info: {
    uri: string;
    changes: BinaryChange[];
  }) => {
    this._em.emit("documentSourceChanged", info);
  };
}

const createDocument = (
  uri: string,
  em: EventEmitter,
  connection: RPCClientAdapter
): Document => {
  if (isPaperclipFile(uri)) {
    return new PCDocument(uri, em, connection);
  }

  // need to handle text plain, binary files, images

  throw new Error(`Don't know how to open ${uri}`);

  return null;
};
