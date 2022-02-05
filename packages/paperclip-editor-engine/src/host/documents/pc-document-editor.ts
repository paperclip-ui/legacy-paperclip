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
  EditTarget,
  EditTargetKind,
  PrependChild,
  InstanceInsertion,
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
  getInstanceComponentInfo,
  Reference,
  ScriptExpressionKind,
  ScriptObject,
  VirtualElement,
  VirtualText,
  Fragment,
  DependencyContent,
  DependencyNodeContent,
  getImports,
  getAttributeStringValue,
  infer,
} from "@paperclip-ui/core";
import { TextEdit } from "../../core/crdt-document";
import { flatten, camelCase } from "lodash";
import * as path from "path";
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
    const sourceEdits: DocumentTextEdit[] = flatten(
      edits.map(mapVirtualSourceEdit(originUri, this._manager, this._engine))
    ).filter(Boolean) as DocumentTextEdit[];

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
  const [child, additionalEdit] = getChildInsertionContent(
    edit.node,
    info.textSource.uri,
    engine,
    false
  );
  return {
    uri: info.textSource.uri,
    chars: child.split(""),
    index: info.textSource.range.start.pos,
  };
};
const prependChild = (
  uri: string,
  engine: EngineDelegate,
  edit: PrependChild
) => {
  const [exprUri, expr] = getEditTarget(edit.target, uri, engine);
  const [child] = getChildInsertionContent(edit.child, exprUri, engine, false);
  return {
    uri: exprUri,
    chars: child.split(""),
    index: 0,
  };
};

const getEditTarget = (
  target: EditTarget,
  uri: string,
  engine: EngineDelegate
) => {
  switch (target.kind) {
    case EditTargetKind.Expression: {
      return engine.getExpressionById(target.sourceId);
    }
    case EditTargetKind.VirtualNode: {
      const info = getSourceNodeFromPath(uri, engine, target.nodePath);
      return engine.getExpressionById(info.sourceId) as [string, Element];
    }
  }
};

const addAttribute = (
  uri: string,
  engine: EngineDelegate,
  edit: AddAttribute
) => {
  const [sourceUri, expr] = getEditTarget(edit.target, uri, engine);

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
): DocumentTextEdit | DocumentTextEdit[] => {
  const info = getSourceNodeFromPath(uri, engine, edit.nodePath);
  const [exprUri, expr] = engine.getExpressionById(info.sourceId) as [
    string,
    Fragment | Element | Reference
  ];
  if (isNode(expr)) {
    if (expr.nodeKind === NodeKind.Element) {
      return appendElement(uri, documents, engine, expr, exprUri, edit);
    } else if (expr.nodeKind === NodeKind.Fragment) {
      return appendRoot(expr, engine, exprUri, edit);
    }
  } else if (isScriptExpression(expr)) {
    if (expr.scriptKind === ScriptExpressionKind.Reference) {
      return appendSlot(documents, uri, engine, expr, edit);
    }
  }

  throw new Error(`Unknown expr`);
};

const appendRoot = (
  expr: Fragment,
  engine: EngineDelegate,
  exprUri: string,
  edit: AppendChild
) => {
  const [child] = getChildInsertionContent(edit.child, exprUri, engine, false);
  return {
    uri: exprUri,
    chars: child.split(""),
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

  const [child, additionalEdits] = getChildInsertionContent(
    edit.child,
    uri,
    engine,
    true
  );

  if (exprName === "children") {
    return appendChild(uri, documents, engine, {
      kind: VirtualObjectEditKind.AppendChild,
      nodePath: instancePath,
      child: edit.child,
    });
  }

  return [
    updateAttribute(uri, engine, {
      kind: VirtualObjectEditKind.UpdateAttribute,
      nodePath: instancePath,
      name: exprName,
      value: child,
    }),
    ...additionalEdits,
  ];
};

const appendElement = (
  uri: string,
  documents: DocumentManager,
  engine: EngineDelegate,
  expr: Element,
  exprUri: string,
  edit: AppendChild
) => {
  const element = getNodeByPath(
    edit.nodePath,
    (engine.getLoadedData(uri) as LoadedPCData).preview
  );

  const [_componentUri, component] =
    getInstanceComponentInfo(expr, exprUri, engine.getLoadedGraph()) || [];

  // if appending to instance of component, need to make sure that
  // {children} exists, otherwise it's a no-op
  if (component) {
    const inference = infer(component);
    if (!inference.properties.children) {
      return null;
    }
  }

  const source = documents.open(exprUri).openSource().getText();

  const tagBuffer = source.substring(
    expr.openTagRange.start.pos,
    expr.openTagRange.end.pos
  );

  // self closing
  if (tagBuffer.trim().lastIndexOf("/>") !== -1) {
    const [child, additionalEdits] = getChildInsertionContent(
      edit.child,
      exprUri,
      engine,
      false
    );

    const tagSrc = source.substring(expr.range.start.pos, expr.range.end.pos);

    return [
      {
        uri: exprUri,
        chars: [">", child, `</${expr.tagName}>`].join("").split(""),

        // remove WS at end too so that <div /> isn't converted to <div ></div>
        index: expr.range.start.pos + tagSrc.replace(/\s*\/>$/, "").length,
        deleteCount: tagSrc.match(/\s*\/>$/)[0].length,
      },
      ...additionalEdits,
    ];
  }

  const endTagPos =
    expr.range.start.pos +
    source
      .substring(expr.range.start.pos, expr.range.end.pos)
      .lastIndexOf(`</${expr.tagName}>`);

  const [child, additionalEdit] = getChildInsertionContent(
    edit.child,
    exprUri,
    engine,
    false
  );

  return [
    {
      uri: exprUri,
      chars: child.split(""),
      index: endTagPos,
    },
    ...additionalEdit,
  ];
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

  const [childValue, additionalEdits] = getChildInsertionContent(
    child,
    exprUri,
    engine,
    false
  );

  return [
    {
      uri: exprUri,
      chars: (
        `\n\n<!--\n  @frame { x: ${Math.round(box.x)}, y: ${Math.round(
          box.y
        )}, width: ${Math.round(box.width)}, height: ${Math.round(
          box.height
        )} }\n-->\n` + childValue
      ).split(""),
      index: expr.range.end.pos,
    },
    ...additionalEdits,
  ];
};

const getChildInsertionContent = (
  insertion: ChildInsertion,
  documentUri: string,
  engine: EngineDelegate,
  isAttributeValue: boolean
): [string, DocumentTextEdit[]] => {
  switch (insertion.kind) {
    case ChildInsertionKind.Element: {
      return [isAttributeValue ? `{${insertion.value}}` : insertion.value, []];
    }
    case ChildInsertionKind.Text: {
      return [isAttributeValue ? `"${insertion.value}"` : insertion.value, []];
    }
    case ChildInsertionKind.Instance: {
      const importEdits: DocumentTextEdit[] = [];

      let prefix: string = "";
      let ns: string;

      if (documentUri !== insertion.sourceUri) {
        const ret = autoAddImport(documentUri, engine, insertion);
        ns = ret.ns;
        importEdits.push(ret.edit);
      }

      if (ns) {
        prefix = `${ns}.`;
      }

      let buffer = `<${prefix}${insertion.name} />`;

      if (isAttributeValue) {
        buffer = `{${buffer}}`;
      }

      return [buffer, importEdits];
    }
  }
};

const autoAddImport = (
  exprUri: string,
  engine: EngineDelegate,
  insertion: InstanceInsertion
): { ns: string; edit?: DocumentTextEdit } | undefined => {
  let ns: string;

  const ast = engine.getLoadedAst(exprUri) as DependencyNodeContent;
  const data = engine.getLoadedData(exprUri) as LoadedPCData;
  const imports = getImports(ast);
  const importExpr = imports.find(
    (imp) =>
      data.dependencies[getAttributeStringValue("as", imp)] ===
        insertion.sourceUri ||
      data.dependencies[getAttributeStringValue("src", imp)] ===
        insertion.sourceUri
  );

  if (importExpr) {
    ns = getAttributeStringValue("as", importExpr);

    // No namespace? add the attribute
    if (!ns) {
      ns = getUniqueImportId(insertion.sourceUri, imports);
      return {
        ns,
        edit: addAttribute(exprUri, engine, {
          kind: VirtualObjectEditKind.AddAttribute,
          target: {
            kind: EditTargetKind.Expression,
            sourceId: importExpr.id,
          },
          name: "as",
          value: `"${ns}"`,
        }),
      };
    }

    // no import? add it
  } else {
    ns = getUniqueImportId(insertion.sourceUri, imports);
    return {
      ns,
      edit: prependChild(exprUri, engine, {
        kind: VirtualObjectEditKind.PrependChild,
        target: { kind: EditTargetKind.Expression, sourceId: ast.id },
        child: {
          kind: ChildInsertionKind.Element,
          value: `<import src="${engine.resolveFile(
            exprUri,
            insertion.sourceUri
          )}" as="${ns}" />\n`,
        },
      }),
    };
  }
  return { ns };
};

const getUniqueImportId = (uri: string, imports: Element[]) => {
  let i = 2;
  const base = camelCase(path.basename(uri).replace(".pc", ""));
  let ns = base;
  while (imports.some((imp) => getAttributeStringValue("as", imp) === ns)) {
    ns = base + i;
    i++;
  }

  return ns;
};
