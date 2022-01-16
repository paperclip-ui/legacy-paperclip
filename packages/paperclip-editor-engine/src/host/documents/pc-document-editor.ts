import {
  AddAttribute,
  AppendChild,
  SetTextNodeValue,
  UpdateAttribute,
  VirtualObjectEdit,
  SetAnnotations,
  InsertNodeBefore
} from "../../core";
import { Connection } from "../../core/connection";
import { DocumentManager } from "./manager";
import {
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
import { VirtualobjectEditKind } from "../../core";

type DocumentTextEdit = {
  uri: string;
} & TextEdit;

export class PCDocumentEditor {
  constructor(
    private _manager: DocumentManager,
    private _engine: EngineDelegate
  ) {}
  /**
   */

  applyVirtualObjectEdits(originUri: string, edits: VirtualObjectEdit[]) {
    const sourceEdits = edits.map(
      mapVirtualSourceEdit(originUri, this._manager, this._engine)
    );
    const sourceEditsByDocument = {};
    for (const edit of sourceEdits) {
      if (!sourceEditsByDocument[edit.uri]) {
        sourceEditsByDocument[edit.uri] = [];
      }
      sourceEditsByDocument[edit.uri].push(edit);
    }
    for (const uri in sourceEditsByDocument) {
      const doc = this._manager.open(uri);

      doc.openSource().applyEdits(sourceEditsByDocument[uri]);
    }
  }
}

const mapVirtualSourceEdit = (
  uri: string,
  documents: DocumentManager,
  engine: EngineDelegate
) => (edit: VirtualObjectEdit): DocumentTextEdit => {
  switch (edit.kind) {
    case VirtualobjectEditKind.InsertNodeBefore:
      return insertNodeBefore(uri, engine, edit);
    case VirtualobjectEditKind.AppendChild:
      return appendChild(uri, documents, engine, edit);
    case VirtualobjectEditKind.SetTextNodeValue:
      return setTextNodeValue(uri, engine, edit);
    case VirtualobjectEditKind.AddAttribute:
      return addAttribute(uri, engine, edit);
    case VirtualobjectEditKind.UpdateAttribute:
      return updateAttribute(uri, engine, edit);
    case VirtualobjectEditKind.SetAnnotations:
      return setAnnotations(uri, engine, edit);
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

const insertNodeBefore = (
  uri: string,
  engine: EngineDelegate,
  edit: InsertNodeBefore
) => {
  const info = getSourceNodeFromPath(uri, engine, edit.beforeNodePath);
  return {
    uri: info.textSource.uri,
    chars: edit.node.split(""),
    index: info.textSource.range.start.pos
  };
};

const addAttribute = (
  uri: string,
  engine: EngineDelegate,
  edit: AddAttribute
) => {
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
    uri: sourceUri,
    chars: (" " + buffer.join("")).split(""),
    index: expr.tagNameRange.end.pos
  };
};

const updateAttribute = (
  uri: string,
  engine: EngineDelegate,
  edit: UpdateAttribute
) => {
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
    uri: sourceUri,
    chars: (" " + buffer.join("")).split(""),
    index: expr.tagNameRange.end.pos
  };
};

const setAnnotations = (
  uri: string,
  engine: EngineDelegate,
  edit: SetAnnotations
) => {
  const parentPath = edit.nodePath.split(".");
  parentPath.pop();

  const buffer = [`<!--\n`];
  for (const name in edit.value) {
    // PC can't handle string keys yet for objects, so we need to strip them
    buffer.push(
      `  @${name} ${JSON.stringify(edit.value[name]).replace(
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
      uri,
      chars: buffer.join("").split(""),
      index: expr.range.start.pos,
      deleteCount: expr.range.end.pos
    };
  } else {
    const info = getSourceNodeFromPath(uri, engine, edit.nodePath);
    const [sourceUri] = engine.getExpressionById(info.sourceId);
    return {
      uri: sourceUri,
      chars: buffer.join("").split(""),
      index: info.textSource.range.start.pos
    };
  }
};

const appendChild = (
  uri: string,
  documents: DocumentManager,
  engine: EngineDelegate,
  edit: AppendChild
) => {
  {
    const info = getSourceNodeFromPath(uri, engine, edit.nodePath);
    const [exprUri, expr] = engine.getExpressionById(info.sourceId) as [
      string,
      Element
    ];
    const source = documents
      .open(exprUri)
      .openSource()
      .getText();

    const tagBuffer = source.substring(
      expr.openTagRange.start.pos,
      expr.openTagRange.end.pos
    );

    // self closing
    if (tagBuffer.trim().lastIndexOf("/>") !== -1) {
      return {
        uri: exprUri,
        chars: [">", edit.child, `</${expr.tagName}>`].join("").split(""),
        index: tagBuffer.trim().lastIndexOf("/>"),
        deleteCount: 2
      };
    }

    const endTagPos =
      expr.range.start.pos +
      source
        .substring(expr.range.start.pos, expr.range.end.pos)
        .lastIndexOf(`</${expr.tagName}>`);

    return {
      uri: exprUri,
      chars: edit.child.split(""),
      index: endTagPos
    };
  }
};

const setTextNodeValue = (
  uri: string,
  engine: EngineDelegate,
  edit: SetTextNodeValue
) => {
  {
    const info = getSourceNodeFromPath(uri, engine, edit.nodePath);
    return {
      uri: info.textSource.uri,
      chars: edit.value.split(""),
      index: info.textSource.range.start.pos,
      deleteCount:
        info.textSource.range.end.pos - info.textSource.range.start.pos
    };
  }
};
