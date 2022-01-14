import * as Automerge from "automerge";

type SourceDocumentData = {
  text: Automerge.Text;
};

export class SourceDocument {
  private constructor(private _doc: SourceDocumentData) {}

  static fromText(text: string) {
    return new SourceDocument(
      Automerge.from({ text: new Automerge.Text(text) })
    );
  }

  static load(document: Automerge.BinaryDocument) {
    return new SourceDocument(Automerge.load(document));
  }

  save() {
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
    return changes;
  }

  applyChanges(changes: Automerge.BinaryChange[]) {
    // const oldDoc = this._doc;
    const [newDoc] = Automerge.applyChanges(this._doc, changes);
    this._doc = newDoc;
    // TODO - emit changes of text
  }
}
