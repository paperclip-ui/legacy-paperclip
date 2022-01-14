import { CRDTTextDocument } from "../../core/crdt-document";
import { EventEmitter } from "events";
import { DocumentKind } from "../../core/documents";

export abstract class BaseDocument {
  abstract readonly kind: DocumentKind;
  private _contents: any;
  constructor(readonly uri: string, protected _events: EventEmitter) {}
  load() {
    const content = (this._contents = this.load2());
    this._events.emit("documentLoaded", this);
    return content;
  }
  getContents() {
    return this._contents;
  }
  abstract load2(): Promise<any>;
  abstract openSource(): Promise<CRDTTextDocument>;
}
