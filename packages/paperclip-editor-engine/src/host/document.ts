import { EngineDelegate, LoadedData } from "@paperclip-ui/core";
import Automerge from "automerge";
import { EventEmitter } from "events";
import { Connection } from "../core/connection";
import { DocumentEditKind } from "../core/edits";

export class Document {
  private _text: Automerge.Text;
  private _em: EventEmitter;

  /**
   */

  constructor(
    private _uri: URL,
    sourceText: string,
    private _connection: Connection,
    private _engine: EngineDelegate
  ) {
    this._em = new EventEmitter();
    this._text = new Automerge.Text(sourceText);
  }

  /**
   */

  onChange(cb: (text: Automerge.Text) => void) {
    this._em.on("change", cb);
    return () => this._em.off("change", cb);
  }
}
