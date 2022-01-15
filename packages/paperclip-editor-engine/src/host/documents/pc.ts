import { EngineDelegate } from "@paperclip-ui/core";
import { CRDTTextDocument } from "../../core/crdt-document";
import { DocumentKind } from "../../core/documents";
import { BaseDocument } from "./base";
import { EventEmitter } from "events";
import { VirtualObjectEdit, VirtualobjectEditKind } from "../../core";

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

  applyVirtualObjectEdits(edits: VirtualObjectEdit[]) {
    const source = this.openSource();
    source.applyEdits(edits, (edit, text) => {
      if (edit.kind === VirtualobjectEditKind.InsertNodeBefore) {
        const info = this._engine.getVirtualNodeSourceInfo(
          edit.beforeNodeId.split(".").map(Number),
          this.uri
        );
        text.insertAt(info.textSource.range.start.pos, ...edit.node.split(""));
      }
    });

    //
    // info.textSource.range.start.pos
    // const source = this.openSource();
    // source.setText(node.split(""), info.textSource.range.start.pos);
  }

  /**
   */

  openSource() {
    if (this._source) {
      return this._source;
    }
    this._events.on(
      "sourceDocumentCRDTChanges",
      this._onSourceDocumentCRDTChanges
    );
    this._source = CRDTTextDocument.fromText(
      this._engine.getVirtualContent(this.uri)
    );
    this._source.onChange(this._onSourceChange);
    return this._source;
  }

  /**
   */

  private _onSourceDocumentCRDTChanges = ({ uri, changes }) => {
    if (uri !== this.uri) {
      return;
    }

    this._source.applyChanges(changes);
  };

  /**
   */

  private _onSourceChange = () => {
    this._engine.updateVirtualFileContent(this.uri, this._source.getText());
    this.load();
  };
}
