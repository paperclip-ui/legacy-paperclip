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
    const existingDoc = this._doc;

    const changedDocs = edits.map(edit => {
      return Automerge.change(Automerge.clone(existingDoc), doc => {
        applyEdit(edit, doc.text);
      });
    });

    this._doc = changedDocs.reduce((newDoc, part) => {
      return Automerge.merge(newDoc, part);
    }, this._doc);

    const changes = Automerge.getChanges(existingDoc, this._doc);
    this._em.emit("change");
    return changes;
  }

  toData() {
    return Automerge.save(this._doc);
  }

  getText() {
    return this._doc.text.toString();
  }

  setText(value: string[], start = 0, deleteCount = 0) {
    const oldDoc = this._doc;
    this._doc = Automerge.change(this._doc, newDoc => {
      if (deleteCount) {
        newDoc.text.deleteAt(start, deleteCount);
      }
      newDoc.text.insertAt(start, ...value);
    });
    const changes = Automerge.getChanges(oldDoc, this._doc);
    this._em.emit("change");
    return changes;
  }

  applyChanges(changes: Automerge.BinaryChange[]) {
    // const oldDoc = this._doc;
    const [newDoc, patch] = Automerge.applyChanges(this._doc, changes);
    this._doc = newDoc;
    this._em.emit("change");

    // TODO - emit changes of text
  }
}
