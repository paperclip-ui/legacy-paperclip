import { EngineDelegate } from "@paperclip-ui/core";
import { SourceDocument } from "../core/source-document";

export class PCDocumentManager {
  private _documents: Record<string, PCDocument>;

  constructor(private _engine: EngineDelegate) {
    this._documents = {};
  }

  open(uri: string) {
    if (this._documents[uri]) {
      return this._documents[uri];
    }
    this._engine.open(uri);
    return (this._documents[uri] = new PCDocument(
      this._engine,
      SourceDocument.fromText(this._engine.getVirtualContent(uri))
    ));
  }
}

export class PCDocument {
  constructor(
    private _engine: EngineDelegate,
    private _source: SourceDocument
  ) {}
  getBinarySourceDocument() {
    return this._source.save();
  }
}
