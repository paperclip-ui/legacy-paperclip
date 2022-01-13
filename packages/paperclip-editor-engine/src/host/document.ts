import { EngineDelegate, LoadedData } from "@paperclip-ui/core";
import Automerge from "automerge";
import { EventEmitter } from "events";
import { DocumentEdit, DocumentEditKind, SetSourceText } from "../core/edits";

export class Document {
  private _text: Automerge.Text;
  private _em: EventEmitter;

  /**
   */

  constructor(
    private _uri: URL,
    sourceText: string,
    private _engine: EngineDelegate
  ) {
    this._em = new EventEmitter();
    this._text = new Automerge.Text(sourceText);
  }

  /**
   */

  mirror() {}

  /**
   */

  /**
   */

  onChange(cb: (text: Automerge.Text) => void) {
    this._em.on("change", cb);
    return () => this._em.off("change", cb);
  }

  /**
   */

  applyEdits(edits: DocumentEdit[]) {
    for (const edit of edits) {
      this[edit.kind](edit);
    }
  }

  /**
   */

  private [DocumentEditKind.SetSourceText](edit: SetSourceText) {
    this._editText(edit);
  }

  /**
   */

  private [DocumentEditKind.InsertNodeBefore]() {
    // get most recent virtual element
    // const doc = this._engine.open(this._uri);
    // this._engine.getVirtualNodeSourceInfo(virt.id)
  }

  /**
   */

  private _editText({ start, end, value }: SetSourceText) {
    this._text = Automerge.change(this._text, newDoc => {
      this._text.splice(start, end, value);
    });
    this._em.emit("change", this._text);
  }
}
