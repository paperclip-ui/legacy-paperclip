import { Logger } from "@paperclip-ui/common";
import { EngineDelegate, isPaperclipFile } from "@paperclip-ui/core";
import { EventEmitter } from "events";
import { createListener } from "../../core/utils";
import { PCDocument } from "./pc";

export class DocumentManager {
  private _documents: Record<string, Document>;
  private _em: EventEmitter;

  constructor(
    private _events: EventEmitter,
    private _engine: EngineDelegate,
    private _logger: Logger
  ) {
    this._documents = {};
    this._em = new EventEmitter();
  }

  /**
   */

  open(uri: string): Document {
    if (this._documents[uri]) {
      return this._documents[uri];
    }
    return (this._documents[uri] = createDocument(
      uri,
      this._events,
      this._engine,
      this._logger
    ));
  }

  /**
   */

  onDocumentChanged(listener: (document: PCDocument) => void) {
    return createListener(this._em, "documentChanged", listener);
  }
}

type Document = PCDocument;

const createDocument = (
  uri: string,
  events: EventEmitter,
  engine: EngineDelegate,
  logger: Logger
): Document => {
  if (isPaperclipFile(uri)) {
    return new PCDocument(uri, events, engine, logger);
  }
  throw new Error(`Unable to load ${uri}`);
  return null;
};
