import { EngineDelegate, LoadedPCData } from "@paperclip-ui/core";
import * as Automerge from "automerge";
import { CRDTTextDocument } from "../../core/crdt-document";
import { DocumentKind } from "../../core/documents";
import { BaseDocument } from "./base";
import { EventEmitter } from "events";
import { Logger } from "@paperclip-ui/common";

export class PCDocument extends BaseDocument<LoadedPCData> {
  readonly kind = DocumentKind.Paperclip;
  private _source: CRDTTextDocument;

  /**
   */

  constructor(
    uri: string,
    events: EventEmitter,
    private _engine: EngineDelegate,
    private _logger: Logger
  ) {
    super(uri, events);
  }

  /**
   */

  async load2() {
    try {
      const ret =
        this._engine.getLoadedData(this.uri) || this._engine.open(this.uri);
      return ret as LoadedPCData;
    } catch (e) {
      this._logger.error(`Unable to open ${this.uri}`);
      return null;
    }
  }

  /**
   */

  openSource() {
    if (this._source) {
      return this._source;
    }
    this._logger.verbose("PCDocument::openSource()", this.uri);
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
    this._logger.verbose("PCDocument::_onSourceDocumentCRDTChanges()");
    this._source.applyChanges(changes);
  };

  /**
   */

  private _onSourceChange = (changes: Automerge.BinaryChange[]) => {
    const text = this._source.getText();
    this._engine.updateVirtualFileContent(this.uri, text);
    this.load();
    if (changes.length) {
      this._events.emit("outgoingCRDTChanges", { uri: this.uri, changes });
    }
  };
}
