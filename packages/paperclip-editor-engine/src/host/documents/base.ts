import { CRDTTextDocument } from "../../core/crdt-document";
import { EventEmitter } from "events";
import { DocumentKind } from "../../core/documents";

export abstract class BaseDocument<TContent> {
  abstract readonly kind: DocumentKind;
  private _contents: TContent;
  constructor(readonly uri: string, protected _events: EventEmitter) {}
  async load() {
    const content = (this._contents = await this.load2());
    this._events.emit("documentLoaded", this);
    return content;
  }
  getContent() {
    return this._contents;
  }
  abstract load2(): Promise<TContent>;
  abstract openSource(): Promise<CRDTTextDocument> | CRDTTextDocument;
}
