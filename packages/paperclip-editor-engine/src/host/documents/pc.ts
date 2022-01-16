import {
  AttributeKind,
  Element,
  EngineDelegate,
  getNodeByPath,
  LoadedPCData,
  ScriptExpressionKind,
  ScriptObject,
  VirtualElement
} from "@paperclip-ui/core";
import * as Automerge from "automerge";
import { CRDTTextDocument, TextEdit } from "../../core/crdt-document";
import { DocumentKind } from "../../core/documents";
import { BaseDocument } from "./base";
import { EventEmitter } from "events";
import { VirtualObjectEdit, VirtualobjectEditKind } from "../../core";

export class PCDocument extends BaseDocument<LoadedPCData> {
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
    return this._engine.open(this.uri) as LoadedPCData;
  }

  /**
   */

  openSource() {
    if (this._source) {
      return this._source;
    }
    this._events.on("incommingCRDTChanges", this._onSourceDocumentCRDTChanges);
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

  private _onSourceChange = (changes: Automerge.BinaryChange[]) => {
    this._engine.updateVirtualFileContent(this.uri, this._source.getText());
    this.load();
    if (changes.length) {
      this._events.emit("outgoingCRDTChanges", { uri: this.uri, changes });
    }
  };
}
