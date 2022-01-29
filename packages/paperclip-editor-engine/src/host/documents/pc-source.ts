import * as Automerge from "automerge";
import * as prettier from "prettier";
import diff from "diff";
import { CRDTTextDocument, SourceDocumentData } from "../../core/crdt-document";

export class PCSourceDocument extends CRDTTextDocument {
  protected constructor(doc: SourceDocumentData) {
    super(doc);
    // this.onChange(this._onChange);
  }
  static fromText(text: string) {
    return new PCSourceDocument(
      Automerge.from({ text: new Automerge.Text(text) })
    );
  }
  // private _onChange = () => {
  //   try {
  //   const now = Date.now();
  //   const code = this.getText();
  //   const formattedCode = prettier.format(code, { parser: "paperclip"});
  //   console.log(diff);
  //   const patch = diff.createPatch("a", code, formattedCode);
  //   console.log(patch);
  //   } catch(e) {
  //     console.error(e);
  //   }

  // }
}
