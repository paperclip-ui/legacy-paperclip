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

  static fromText(text: string) {
    return new CRDTTextDocument(
      Automerge.from({ text: new Automerge.Text(text) })
    );
  }

  /**
   */

  static load(document: Automerge.BinaryDocument) {
    console.log(ArrayBuffer);

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

    return this._setDoc(curr, this._doc);
  }

  /**
   */

  toData() {
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
    const newDoc = Automerge.change(this._doc, (newDoc) => {
      applyTextEdit(
        {
          chars,
          index,
          deleteCount,
        },
        newDoc.text
      );
    });
    return this._setDoc(newDoc, this._doc);
  }

  /**
   */

  applyChanges(changes: Automerge.BinaryChange[]) {
    // const oldDoc = this._doc;
    const [newDoc, _patch] = Automerge.applyChanges(this._doc, changes);
    this._doc = newDoc;
    this._em.emit("change", []);
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
