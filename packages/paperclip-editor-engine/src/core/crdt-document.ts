import * as Automerge from "automerge";
import { EventEmitter } from "events";
import { createListener } from "./utils";

export type SourceDocumentData = {
  text: Automerge.Text;
};

export type TextEdit = {
  chars: string[];
  index: number;
  deleteCount?: number;
};

export class CRDTTextDocument {
  private _em: EventEmitter;

  /**
   */

  protected constructor(private _doc: SourceDocumentData) {
    this._em = new EventEmitter();
  }

  /**
   */

  onChange(listener: (changes: Automerge.BinaryChange[]) => void) {
    return createListener(this._em, "change", listener);
  }
  /**
   */

  onSync(listener: (changes: Automerge.Patch[]) => void) {
    return createListener(this._em, "sync", listener);
  }

  /**
   */

  onEdit(listener: (changes: Automerge.BinaryChange[]) => void) {
    return createListener(this._em, "edited", listener);
  }

  /**
   */

  static fromText(text: string) {
    return new CRDTTextDocument(
      Automerge.from({ text: new Automerge.Text(text) })
    );
  }

  /**
   */

  static load(document: Automerge.BinaryDocument) {
    return new CRDTTextDocument(Automerge.load(document));
  }

  /**
   */

  applyEdits(edits: TextEdit[]) {
    let curr = this._doc;

    for (const edit of edits) {
      curr = Automerge.change(curr, (doc) => {
        applyTextEdit(edit, doc.text);
      });
    }

    const changes = this._setDoc(curr, this._doc);
    this._em.emit("edited", changes);
    return changes;
  }

  /**
   */

  toData(): Automerge.BinaryDocument {
    return Automerge.save(this._doc);
  }

  /**
   */

  getText() {
    return this._doc.text.toString();
  }

  /**
   */

  setText(chars: string[], index = 0, deleteCount = 0) {
    return this.applyEdits([{ chars, index, deleteCount }]);
  }

  /**
   */

  applyChanges(changes: Automerge.BinaryChange[]) {
    // const oldDoc = this._doc;
    const [newDoc, patch] = Automerge.applyChanges(this._doc, changes);
    this._doc = newDoc;
    this._em.emit("change", []);
    this._em.emit("sync", patch);
  }

  /**
   */

  private _setDoc(newDoc: SourceDocumentData, oldDoc: SourceDocumentData) {
    this._doc = newDoc;
    const changes = Automerge.getChanges(oldDoc, newDoc);
    this._em.emit("change", changes);
    return changes;
  }
}

const applyTextEdit = (edit: TextEdit, text: Automerge.Text) => {
  if (edit.deleteCount) {
    text.deleteAt(edit.index, edit.deleteCount);
  }
  text.insertAt(edit.index, ...edit.chars);
};
