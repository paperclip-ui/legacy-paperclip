import { EngineDelegate, isPaperclipFile } from "@paperclip-ui/core";
import { EventEmitter } from "events";
import { OpenDocumentResult } from "../../core";
import { BaseDocument } from "./base";
import { PCDocument } from "./pc";

export class DocumentManager {
  private _documents: Record<string, Document>;

  constructor(private _events: EventEmitter, private _engine: EngineDelegate) {
    this._documents = {};
  }

  open(uri: string): Document {
    if (this._documents[uri]) {
      return this._documents[uri];
    }
    return (this._documents[uri] = createDocument(
      uri,
      this._events,
      this._engine
    ));
  }
}

type Document = PCDocument;

const createDocument = (
  uri: string,
  events: EventEmitter,
  engine: EngineDelegate
): Document => {
  if (isPaperclipFile(uri)) {
    return new PCDocument(uri, events, engine);
  }
  throw new Error(`Unable to load ${uri}`);
  return null;
};
