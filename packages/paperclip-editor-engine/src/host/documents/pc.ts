import {
  AnnotationPropertyKind,
  AttributeKind,
  Element,
  EngineDelegate,
  getNodeByPath,
  LoadedPCData,
  ScriptExpressionKind,
  ScriptObject,
  VirtualElement
} from "@paperclip-ui/core";
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
    case VirtualobjectEditKind.AddAttribute: {
      const info = getSourceNodeFromPath(uri, engine, edit.nodePath);
      const [sourceUri, expr] = engine.getExpressionById(info.sourceId) as [
        string,
        Element
      ];

      const buffer = [edit.name];
      if (edit.value) {
        buffer.push(`=`, edit.value);
      }

      return {
        chars: (" " + buffer.join("")).split(""),
        index: expr.tagNameRange.end.pos
      };
    }
    // case VirtualobjectEditKind.AppendChild: {
    //   const info = getSourceNodeFromPath(uri, engine, edit.nodePath);
    //   const [sourceUri, expr] = engine.getExpressionById(info.sourceId) as [string, Element];

    //   return {
    //     chars: (" " + buffer.join("")).split(""),
    //     index: expr.tagNameRange.end.pos,
    //   };
    // }
    case VirtualobjectEditKind.UpdateAttribute: {
      const info = getSourceNodeFromPath(uri, engine, edit.nodePath);
      const [sourceUri, expr] = engine.getExpressionById(info.sourceId) as [
        string,
        Element
      ];

      const attr = expr.attributes.find(attr => {
        if (attr.attrKind === AttributeKind.KeyValueAttribute) {
          return attr.name === edit.name;
        } else if (attr.attrKind === AttributeKind.ShorthandAttribute) {
          return attr.reference.scriptKind === ScriptExpressionKind.Reference
            ? attr.reference.path[0].name === edit.name
            : null;
        }
      });

      if (edit.value) {
      }

      const buffer = [edit.name];
      if (edit.value) {
        buffer.push(`=`, edit.value);
      }

      return {
        chars: (" " + buffer.join("")).split(""),
        index: expr.tagNameRange.end.pos
      };
    }
    case VirtualobjectEditKind.SetAnnotations: {
      const parentPath = edit.nodePath.split(".");
      parentPath.pop();

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

      const virtualElement = getNodeByPath(
        edit.nodePath,
        (engine.getLoadedData(uri) as LoadedPCData).preview
      ) as VirtualElement;
      if (virtualElement.annotations) {
        const [uri, expr] = engine.getExpressionById(
          virtualElement.annotations.sourceId
        ) as [string, ScriptObject];
        return {
          chars: buffer.join("").split(""),
          index: expr.range.start.pos,
          deleteCount: expr.range.end.pos
        };
      } else {
        const info = getSourceNodeFromPath(uri, engine, edit.nodePath);
        return {
          chars: buffer.join("").split(""),
          index: info.textSource.range.start.pos
        };
      }
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
