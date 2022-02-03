import {
  AddAttribute,
  AppendChild,
  SetTextNodeValue,
  UpdateAttribute,
  VirtualObjectEdit,
  SetAnnotations,
  InsertNodeBefore,
  ChildInsertionKind,
  ChildInsertion,
  DeleteNode,
  AddFrame,
} from "../../core";
import { DocumentManager } from "./manager";
import {
  Element,
  EngineDelegate,
  getNodeByPath,
  getVirtTarget,
  isNode,
  Comment,
  isScriptExpression,
  LoadedPCData,
  NodeKind,
  Reference,
  ScriptExpressionKind,
  ScriptObject,
  VirtualElement,
  VirtualText,
  Fragment,
} from "@paperclip-ui/core";
import { TextEdit } from "../../core/crdt-document";
import { flatten } from "lodash";
import { VirtualObjectEditKind } from "../../core";
import { PCDocument } from "./pc";

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
    const sourceEdits = flatten(
      edits.map(mapVirtualSourceEdit(originUri, this._manager, this._engine))
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

const mapVirtualSourceEdit =
  (uri: string, documents: DocumentManager, engine: EngineDelegate) =>
  (edit: VirtualObjectEdit): DocumentTextEdit | DocumentTextEdit[] => {
    switch (edit.kind) {
      case VirtualObjectEditKind.InsertNodeBefore:
        return insertNodeBefore(uri, engine, edit);
      case VirtualObjectEditKind.AppendChild:
        return appendChild(uri, documents, engine, edit);
      case VirtualObjectEditKind.SetTextNodeValue:
        return setTextNodeValue(uri, engine, edit);
      case VirtualObjectEditKind.AddAttribute:
        return addAttribute(uri, engine, edit);
      case VirtualObjectEditKind.UpdateAttribute:
        return updateAttribute(uri, engine, edit);
      case VirtualObjectEditKind.SetAnnotations:
        return setAnnotations(uri, engine, edit);
      case VirtualObjectEditKind.AddFrame:
        return addFrame(uri, engine, edit);
      case VirtualObjectEditKind.DeleteNode:
        return deleteNode(uri, engine, edit);
      default: {
        throw new Error(`Unhandled edit`);
      }
    }
  };

const getSourceNodeFromPath = (
  uri: string,
  engine: EngineDelegate,
  path: string
) =>
  engine.getVirtualNodeSourceInfo(path ? path.split(".").map(Number) : [], uri);

const deleteNode = (
  uri: string,
  engine: EngineDelegate,
  edit: DeleteNode
): DocumentTextEdit[] => {
  const nodePath = edit.nodePath.split(".").map(Number);
  const info = getSourceNodeFromPath(uri, engine, edit.nodePath);

  const edits: DocumentTextEdit[] = [
    {
      uri: info.textSource.uri,
      chars: [],
      index: info.textSource.range.start.pos,
      deleteCount:
        info.textSource.range.end.pos - info.textSource.range.start.pos,
    },
  ];

  const virtTarget = getVirtTarget(
    (engine.getLoadedData(uri) as LoadedPCData).preview,
    nodePath
  ) as VirtualElement | VirtualText;

  // Delete annotations if present
  if (virtTarget.annotations) {
    const [annotationsUri, annotationsSource] = engine.getExpressionById(
      virtTarget.annotations.sourceId
    ) as [string, Comment];
    edits.push({
      uri: annotationsUri,
      chars: [],
      index: annotationsSource.range.start.pos,
      deleteCount:
        annotationsSource.range.end.pos - annotationsSource.range.start.pos,
    });
  }

  return edits;
};

const insertNodeBefore = (
  uri: string,
  engine: EngineDelegate,
  edit: InsertNodeBefore
) => {
  const info = getSourceNodeFromPath(uri, engine, edit.beforeNodePath);
  return {
    uri: info.textSource.uri,
    chars: getChildInsertionContent(edit.node, false).split(""),
    index: info.textSource.range.start.pos,
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
    index: expr.tagNameRange.end.pos,
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

  // const attr = expr.attributes.find(attr => {
  //   if (attr.attrKind === AttributeKind.KeyValueAttribute) {
  //     return attr.name === edit.name;
  //   } else if (attr.attrKind === AttributeKind.ShorthandAttribute) {
  //     return attr.reference.scriptKind === ScriptExpressionKind.Reference
  //       ? attr.reference.path[0].name === edit.name
  //       : null;
  //   }
  // });

  const buffer = [edit.name];
  if (edit.value) {
    buffer.push(`=`, edit.value);
  }

  return {
    uri: sourceUri,
    chars: (" " + buffer.join("")).split(""),
    index: expr.tagNameRange.end.pos,
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
    const obj = edit.value[name];
    buffer.push(`  @${name} `);
    if (typeof obj === "object" && !Array.isArray(obj)) {
      buffer.push(`{ `);
      buffer.push(
        Object.keys(obj)
          .sort()
          .map((key) => `${key}: ${JSON.stringify(obj[key])}`)
          .join(", ")
      );
      buffer.push(` }\n`);
    } else {
      buffer.push(JSON.stringify(obj), "\n");
    }
  }
  buffer.push("-->");

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
      deleteCount: expr.range.end.pos - expr.range.start.pos,
    };
  } else {
    const info = getSourceNodeFromPath(uri, engine, edit.nodePath);
    const [sourceUri] = engine.getExpressionById(info.sourceId);
    return {
      uri: sourceUri,
      chars: [...buffer, "\n"].join("").split(""),
      index: info.textSource.range.start.pos,
    };
  }
};

const appendChild = (
  uri: string,
  documents: DocumentManager,
  engine: EngineDelegate,
  edit: AppendChild
) => {
  const info = getSourceNodeFromPath(uri, engine, edit.nodePath);
  const [exprUri, expr] = engine.getExpressionById(info.sourceId) as [
    string,
    Fragment | Element | Reference
  ];
  if (isNode(expr)) {
    if (expr.nodeKind === NodeKind.Element) {
      return appendElement(documents, expr, exprUri, edit);
    } else if (expr.nodeKind === NodeKind.Fragment) {
      return appendRoot(expr, exprUri, edit);
    }
  } else if (isScriptExpression(expr)) {
    if (expr.scriptKind === ScriptExpressionKind.Reference) {
      return appendSlot(documents, uri, engine, expr, edit);
    }
  }

  throw new Error(`Unknown expr`);
};

const appendRoot = (expr: Fragment, exprUri: string, edit: AppendChild) => {
  return {
    uri: exprUri,
    chars: getChildInsertionContent(edit.child, false).split(""),
    index: expr.range.end.pos,
  };
};

const appendSlot = (
  documents: DocumentManager,
  uri: string,
  engine: EngineDelegate,
  expr: Reference,
  edit: AppendChild
) => {
  const doc = documents.open(uri) as PCDocument;
  const path = edit.nodePath.split(".");
  path.pop();

  const exprName = expr.path[0].name;

  let instanceElement: VirtualElement;
  let instancePath: string;

  for (let i = path.length; i > 0; i--) {
    const ancestorPath = path.slice(0, i).join(".");
    const ancestor = getNodeByPath(
      ancestorPath,
      doc.getContent().preview
    ) as VirtualElement;
    if (ancestor.sourceInfo?.instanceOf) {
      instanceElement = ancestor;
      instancePath = ancestorPath;
      break;
    }
  }

  // there should always be an instance element. If not, then there's a bug
  if (!instanceElement) {
    throw new Error(`Instance element not found`);
  }

  return updateAttribute(uri, engine, {
    kind: VirtualObjectEditKind.UpdateAttribute,
    nodePath: instancePath,
    name: exprName,
    value: getChildInsertionContent(edit.child, true),
  });
};

const appendElement = (
  documents: DocumentManager,
  expr: Element,
  exprUri: string,
  edit: AppendChild
) => {
  const source = documents.open(exprUri).openSource().getText();

  const tagBuffer = source.substring(
    expr.openTagRange.start.pos,
    expr.openTagRange.end.pos
  );

  // self closing
  if (tagBuffer.trim().lastIndexOf("/>") !== -1) {
    return {
      uri: exprUri,
      chars: [
        ">",
        getChildInsertionContent(edit.child, false),
        `</${expr.tagName}>`,
      ]
        .join("")
        .split(""),
      index: tagBuffer.trim().lastIndexOf("/>"),
      deleteCount: 2,
    };
  }

  const endTagPos =
    expr.range.start.pos +
    source
      .substring(expr.range.start.pos, expr.range.end.pos)
      .lastIndexOf(`</${expr.tagName}>`);

  return {
    uri: exprUri,
    chars: getChildInsertionContent(edit.child, false).split(""),
    index: endTagPos,
  };
};

const setTextNodeValue = (
  uri: string,
  engine: EngineDelegate,
  edit: SetTextNodeValue
) => {
  const info = getSourceNodeFromPath(uri, engine, edit.nodePath);
  return {
    uri: info.textSource.uri,
    chars: edit.value.split(""),
    index: info.textSource.range.start.pos,
    deleteCount:
      info.textSource.range.end.pos - info.textSource.range.start.pos,
  };
};

const addFrame = (
  uri: string,
  engine: EngineDelegate,
  { child, box }: AddFrame
) => {
  const info = getSourceNodeFromPath(uri, engine, "");
  const [exprUri, expr] = engine.getExpressionById(info.sourceId) as [
    string,
    Fragment | Element | Reference
  ];

  return {
    uri: exprUri,
    chars: (
      `\n\n<!--\n  @frame { x: ${Math.round(box.x)}, y: ${Math.round(
        box.y
      )}, width: ${Math.round(box.width)}, height: ${Math.round(
        box.height
      )} }\n-->\n` + getChildInsertionContent(child, false)
    ).split(""),
    index: expr.range.end.pos,
  };
};

const getChildInsertionContent = (
  insertion: ChildInsertion,
  isAttributeValue: boolean
) => {
  switch (insertion.kind) {
    case ChildInsertionKind.Element: {
      return isAttributeValue ? `{${insertion.value}}` : insertion.value;
    }
    case ChildInsertionKind.Text: {
      return isAttributeValue ? `"${insertion.value}"` : insertion.value;
    }
  }
};
