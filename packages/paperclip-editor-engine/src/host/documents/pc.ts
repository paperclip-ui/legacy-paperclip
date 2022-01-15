import { EngineDelegate } from "@paperclip-ui/core";
import * as Automerge from "automerge";
import { CRDTTextDocument, TextEdit } from "../../core/crdt-document";
import { DocumentKind } from "../../core/documents";
import { BaseDocument } from "./base";
import { EventEmitter } from "events";
import { VirtualObjectEdit, VirtualobjectEditKind } from "../../core";

export class PCDocument extends BaseDocument {
  readonly kind = DocumentKind.Paperclip;
  private _source: CRDTTextDocument;

  /**
   */

  constructor(
    uri: string,
    events: EventEmitter,
    private _engine: EngineDelegate
  ) {
    super(uri, events);
  }

  /**
   */

  async load2() {
    const virtualData = this._engine.open(this.uri);
    return {
      virtualData
    };
  }

  /**
   */

  applyVirtualObjectEdits(edits: VirtualObjectEdit[]) {
    this.openSource().applyEdits(
      edits.map(mapVirtualSourceEdit(this.uri, this._engine))
    );
  }

  /**
   */

  openSource() {
    if (this._source) {
      return this._source;
    }
    this._events.on(
      "sourceDocumentCRDTChanges",
      this._onSourceDocumentCRDTChanges
    );
    this._source = CRDTTextDocument.fromText(
      this._engine.getVirtualContent(this.uri)
    );
    this._source.onChange(this._onSourceChange);
    return this._source;
  }

  /**
   */

  private _onSourceDocumentCRDTChanges = ({ uri, changes }) => {
    if (uri !== this.uri) {
      return;
    }

    this._source.applyChanges(changes);
  };

  /**
   */

  private _onSourceChange = () => {
    this._engine.updateVirtualFileContent(this.uri, this._source.getText());
    this.load();
  };
}

const mapVirtualSourceEdit = (uri: string, engine: EngineDelegate) => (
  edit: VirtualObjectEdit
): TextEdit => {
  if (edit.kind === VirtualobjectEditKind.InsertNodeBefore) {
  }

  switch (edit.kind) {
    case VirtualobjectEditKind.InsertNodeBefore: {
      const info = getSourceNodeFromPath(uri, engine, edit.beforeNodePath);
      return {
        chars: edit.node.split(""),
        index: info.textSource.range.start.pos
      };
    }
    case VirtualobjectEditKind.SetTextNodeValue: {
      const info = getSourceNodeFromPath(uri, engine, edit.nodePath);
      return {
        chars: edit.value.split(""),
        index: info.textSource.range.start.pos,
        deleteCount:
          info.textSource.range.end.pos - info.textSource.range.start.pos
      };
    }
    case VirtualobjectEditKind.SetAnnotations: {
      const info = getSourceNodeFromPath(uri, engine, edit.nodePath);

      const buffer = [`<!--\n`];
      for (const name in edit.value) {
        // PC can't handle string keys yet for objects, so we need to strip them
        buffer.push(
          `@${name} ${JSON.stringify(edit.value[name]).replace(
            /"(.+?)":/g,
            "$1:"
          )}\n`
        );
      }
      buffer.push("-->\n");
      return {
        chars: buffer.join("").split(""),
        index: info.textSource.range.start.pos
      };
    }
    default: {
      throw new Error(`Unhandled edit`);
    }
  }
};

const getSourceNodeFromPath = (
  uri: string,
  engine: EngineDelegate,
  path: string
) => engine.getVirtualNodeSourceInfo(path.split(".").map(Number), uri);
