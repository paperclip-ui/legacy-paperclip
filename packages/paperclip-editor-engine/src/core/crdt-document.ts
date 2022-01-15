import * as Automerge from "automerge";
import { EventEmitter } from "events";
import { createListener } from "./utils";

type SourceDocumentData = {
  text: Automerge.Text;
};

export class CRDTTextDocument {
  private _em: EventEmitter;

  private constructor(private _doc: SourceDocumentData) {
    this._em = new EventEmitter();
  }

  onChange(listener: () => void) {
    return createListener(this._em, "change", listener);
  }

  static fromText(text: string) {
    return new CRDTTextDocument(
      Automerge.from({ text: new Automerge.Text(text) })
    );
  }

  static load(document: Automerge.BinaryDocument) {
    return new CRDTTextDocument(Automerge.load(document));
  }

  applyEdits<TEdit>(
    edits: TEdit[],
    applyEdit: (edit: TEdit, text: Automerge.Text) => void
  ) {
    let curr = this._doc;

    for (const edit of edits) {
      curr = Automerge.change(curr, doc => {
        applyEdit(edit, doc.text);
      });
    }
    return this._setDoc(curr, this._doc);
  }
  toData() {
    return Automerge.save(this._doc);
  }

  getText() {
    return this._doc.text.toString();
  }

  setText(value: string[], start = 0, deleteCount = 0) {
    const newDoc = Automerge.change(this._doc, newDoc => {
      if (deleteCount) {
        newDoc.text.deleteAt(start, deleteCount);
      }
      newDoc.text.insertAt(start, ...value);
    });
    return this._setDoc(newDoc, this._doc);
  }

  applyChanges(changes: Automerge.BinaryChange[]) {
    // const oldDoc = this._doc;
    const [newDoc, patch] = Automerge.applyChanges(this._doc, changes);
    this._doc = newDoc;
    this._em.emit("change");

    // TODO - emit changes of text
  }
  private _setDoc(newDoc: SourceDocumentData, oldDoc: SourceDocumentData) {
    this._doc = newDoc;
    const changes = Automerge.getChanges(oldDoc, newDoc);
    this._em.emit("change");
    return changes;
  }
}
