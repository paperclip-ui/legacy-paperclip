import { EngineDelegate } from "@paperclip-ui/core";
import { CRDTTextDocument } from "../../core/crdt-document";
import { DocumentKind } from "../../core/documents";
import { BaseDocument } from "./base";
import { EventEmitter } from "events";

export class PCDocument extends BaseDocument {
  readonly kind = DocumentKind.Paperclip;
  private _source: CRDTTextDocument;

  /**
   */

  constructor(
    uri: string,
    events: EventEmitter,
    private _engine: EngineDelegate
  ) {
    super(uri, events);
  }

  /**
   */

  async load2() {
    const virtualData = this._engine.open(this.uri);
    return {
      virtualData
    };
  }

  /**
   */

  async openSource() {
    if (this._source) {
      return this._source;
    }
    this._events.on(
      "sourceDocumentCRDTChanges",
      this._onSourceDocumentCRDTChanges
    );
    return (this._source = CRDTTextDocument.fromText(
      this._engine.getVirtualContent(this.uri)
    ));
  }

  /**
   */

  private _onSourceDocumentCRDTChanges = ({ uri, changes }) => {
    if (uri !== this.uri) {
      return;
    }

    this._source.applyChanges(changes);
    this._engine.updateVirtualFileContent(this.uri, this._source.getText());
    this.load();
  };
}
