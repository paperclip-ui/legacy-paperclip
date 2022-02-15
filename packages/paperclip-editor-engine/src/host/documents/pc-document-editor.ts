import {
  AddAttribute,
  AppendChild,
  SetTextNodeValue,
  UpdateAttribute,
  VirtualObjectEdit,
  SetAnnotations,
  InsertNodeBefore,
  ChildInsertion,
  DeleteNode,
  AddFrame,
  EditTarget,
  EditTargetKind,
  PrependChild,
  SetStyleDeclaration,
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
  DependencyNodeContent,
  getImports,
  getAttributeStringValue,
  infer,
  Expression,
  isAttribute,
  getASTAncestors,
  getAttribute,
  ELEMENT_INSERT_ATTR,
  Node,
  getASTParent,
  isStyleDeclaration,
  getVirtNodeBySourceId,
  getNodePath,
  StyleElement,
  StyleDeclarationKind,
} from "@paperclip-ui/core";
import { TextEdit } from "../../core/crdt-document";
import { flatten, camelCase } from "lodash";
import * as path from "path";
import { VirtualObjectEditKind } from "../../core";
import { PCDocument } from "./pc";

const INDENT = "  ";

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
        return insertNodeBefore(uri, documents, engine, edit);
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
        return addFrame(uri, documents, engine, edit);
      case VirtualObjectEditKind.DeleteNode:
        return deleteNode(uri, engine, edit);
      case VirtualObjectEditKind.SetStyleDeclaration:
        return cssSetDeclaration(uri, documents, engine, edit);
      default: {
        throw new Error(`Unhandled edit`);
      }
    }
  };

const cssSetDeclaration = (
  uri: string,
  documents: DocumentManager,
  engine: EngineDelegate,
  edit: SetStyleDeclaration
) => {
  const [exprUri, expr] = getEditTarget(edit.target, uri, engine);

  // no name? Clear it
  const decl = edit.name && edit.value ? `${edit.name}: ${edit.value};` : "";

  if (isStyleDeclaration(expr)) {
    return {
      uri: exprUri,
      chars: decl.split(""),
      index: expr.range.start.pos,
      deleteCount: expr.range.end.pos - expr.range.start.pos,
    };
  }

  if (isNode(expr) && expr.nodeKind === NodeKind.Element) {
    const styleBlock = expr.children.find(
      (child) => child.nodeKind === NodeKind.StyleElement
    ) as StyleElement;
    if (styleBlock) {
      const existingDecl = styleBlock.sheet.declarations.find(
        (decl) =>
          decl.declarationKind === StyleDeclarationKind.KeyValue &&
          (edit.oldName != null
            ? decl.name === edit.oldName
            : decl.name === edit.name)
      );
      if (existingDecl) {
        return {
          uri: exprUri,
          chars: decl.split(""),
          index: existingDecl.range.start.pos,
          deleteCount:
            existingDecl.range.end.pos - existingDecl.range.start.pos,
        };
      } else {
        const lastDecl = styleBlock.sheet.declarations.length
          ? styleBlock.sheet.declarations[
              styleBlock.sheet.declarations.length - 1
            ]
          : null;
        if (lastDecl) {
          return {
            uri: exprUri,
            chars: (
              "\n" +
              getExprIndentation(exprUri, engine, styleBlock) +
              INDENT +
              decl
            ).split(""),
            index: lastDecl.range.end.pos,
          };
        } else {
          return {
            uri: exprUri,
            chars: (
              "\n" +
              getExprIndentation(exprUri, engine, styleBlock) +
              INDENT +
              decl
            ).split(""),
            index: styleBlock.range.start.pos + "<style>".length,
          };
        }
      }
    } else {
      return prependChild(exprUri, documents, engine, {
        kind: VirtualObjectEditKind.PrependChild,
        target: { kind: EditTargetKind.Expression, sourceId: expr.id },
        child: { value: `<style>\n${INDENT}${decl}\n</style>` },
      });
    }
  }

  return null;
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

  const [sourceUri, expr] = engine.getExpressionById(info.sourceId);

  const ownerExpr = getASTAncestors(
    expr,
    engine.getLoadedAst(uri) as DependencyNodeContent
  ).find((expr) => isAttribute(expr) || isNode(expr));

  if (ownerExpr && isAttribute(ownerExpr)) {
    return [
      {
        uri: sourceUri,
        chars: [],
        index: ownerExpr.range.start.pos,
        deleteCount: ownerExpr.range.end.pos - ownerExpr.range.start.pos,
      },
    ];
  }

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

const getNodeIndentation = (
  uri: string,
  engine: EngineDelegate,
  nodePath: string
) => {
  const info = getSourceNodeFromPath(uri, engine, nodePath);
  const [exprUri, expr] = engine.getExpressionById(info.sourceId) as [
    string,
    Element
  ];
  return getExprIndentation(exprUri, engine, expr);
};

const getExprIndentation = (
  uri: string,
  engine: EngineDelegate,
  expr: Expression
) => {
  const content = engine.getVirtualContent(uri);
  const lines = content.split("\n");
  return lines[expr.range.start.line - 1].match(/^[\s\t]*/)[0];
};

const insertNodeBefore = (
  uri: string,
  documents: DocumentManager,
  engine: EngineDelegate,
  edit: InsertNodeBefore
) => {
  const [exprUri, expr] = getEditTarget(
    { kind: EditTargetKind.VirtualNode, nodePath: edit.beforeNodePath },
    uri,
    engine
  );
  const parentExpr = getASTParent(
    expr,
    engine.getLoadedAst(uri) as DependencyNodeContent
  ) as Fragment | Element;
  const [child, additionalEdit] = getChildInsertionContent(
    edit.node,
    documents,
    exprUri,
    engine,
    false
  );

  const trailing =
    parentExpr.range.end.line === parentExpr.range.start.line ? "" : "\n";
  const chars = addMultiLineIndentation(
    child,
    getExprIndentation(exprUri, engine, expr)
  ).split("");
  if (
    parentExpr.children.findIndex((child) => child.id === expr.id) === 0 &&
    parentExpr.nodeKind === NodeKind.Element
  ) {
    return {
      uri: exprUri,
      chars: ["\n", ...chars],
      index: parentExpr.tagNameRange.end.pos + 1,
    };
  }

  return {
    uri: exprUri,
    chars: [...chars, trailing],
    index: expr.range.start.pos,
  };
};
const prependChild = (
  uri: string,
  documents: DocumentManager,
  engine: EngineDelegate,
  edit: PrependChild
) => {
  const [exprUri, expr] = getEditTarget(edit.target, uri, engine) as [
    string,
    Node
  ];
  const [child] = getChildInsertionContent(
    edit.child,
    documents,
    exprUri,
    engine,
    false
  );

  if (expr.nodeKind === NodeKind.Element) {
    if (expr.children.length === 0) {
      const root = (engine.getLoadedData(exprUri) as LoadedPCData).preview;
      const virtNode = getVirtNodeBySourceId(root, expr.id);
      return appendChild(uri, documents, engine, {
        kind: VirtualObjectEditKind.AppendChild,
        nodePath: getNodePath(virtNode, root),
        child: { value: child },
      });
    } else {
      const root = (engine.getLoadedData(exprUri) as LoadedPCData).preview;
      const virtNode = getVirtNodeBySourceId(root, expr.children[0].id);
      return insertNodeBefore(uri, documents, engine, {
        kind: VirtualObjectEditKind.InsertNodeBefore,
        beforeNodePath: getNodePath(virtNode, root),
        node: { value: child },
      });
    }
  }

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
    index: (expr as Element).tagNameRange.end.pos,
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
  const [exprUri, expr] = getEditTarget(
    { kind: EditTargetKind.VirtualNode, nodePath: edit.nodePath },
    uri,
    engine
  );
  if (isNode(expr)) {
    if (expr.nodeKind === NodeKind.Element) {
      return appendElement(uri, documents, engine, expr, exprUri, edit);
    } else if (expr.nodeKind === NodeKind.Fragment) {
      return appendRoot(expr, documents, engine, exprUri, edit);
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
  documents: DocumentManager,
  engine: EngineDelegate,
  exprUri: string,
  edit: AppendChild
) => {
  const [child] = getChildInsertionContent(
    edit.child,
    documents,
    exprUri,
    engine,
    false
  );
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
    documents,
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
const deleteAttr = (uri: string, expr: Expression): DocumentTextEdit => ({
  uri,
  chars: [],
  index: expr.range.start.pos - 1,
  deleteCount: expr.range.end.pos - expr.range.start.pos + 1,
});

const addMultiLineIndentation = (buffer: string, indent: string) => {
  return buffer
    .split("\n")
    .map((line) => indent + line)
    .join("\n");
};

const appendElement = (
  uri: string,
  documents: DocumentManager,
  engine: EngineDelegate,
  expr: Element,
  exprUri: string,
  edit: AppendChild
): DocumentTextEdit[] => {
  const [_componentUri, component] =
    getInstanceComponentInfo(expr, exprUri, engine.getLoadedGraph()) || [];

  const edits: DocumentTextEdit[] = [];

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

  const [child, additionalChildEdits] = getChildInsertionContent(
    edit.child,
    documents,
    exprUri,
    engine,
    false
  );

  const parentIndentation = getExprIndentation(exprUri, engine, expr);

  // self closing
  if (tagBuffer.trim().lastIndexOf("/>") !== -1) {
    const tagSrc = source.substring(expr.range.start.pos, expr.range.end.pos);

    edits.push({
      uri: exprUri,
      chars: [
        ">\n",
        addMultiLineIndentation(child, parentIndentation + INDENT),
        `\n${parentIndentation}</${expr.tagName}>`,
      ]
        .join("")
        .split(""),

      // remove WS at end too so that <div /> isn't converted to <div ></div>
      index: expr.range.start.pos + tagSrc.replace(/\s*\/>$/, "").length,
      deleteCount: tagSrc.match(/\s*\/>$/)[0].length,
    });
  } else {
    const indentation = !expr.children.length
      ? parentIndentation + INDENT
      : getExprIndentation(
          exprUri,
          engine,
          expr.children[expr.children.length - 1]
        );
    let endTagIndentation = "";

    let buffer = child;

    // if inline, then maintain that
    if (
      expr.range.end.line !== expr.range.start.line ||
      !expr.children.length
    ) {
      buffer = "\n" + indentation + child + "\n";

      if (!expr.children.length) {
        buffer += parentIndentation;
      }
    }

    edits.push({
      uri: exprUri,
      chars: buffer.split(""),
      index: expr.range.end.pos - `</${expr.tagName}>`.length,
    });
  }

  const insertAttrExpr = getAttribute(ELEMENT_INSERT_ATTR, expr);

  if (insertAttrExpr) {
    edits.push(deleteAttr(exprUri, insertAttrExpr));
  }

  return [...edits, ...additionalChildEdits];
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
  documents: DocumentManager,
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
    documents,
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
  documents: DocumentManager,
  documentUri: string,
  engine: EngineDelegate,
  isAttributeValue: boolean
): [string, DocumentTextEdit[]] => {
  const child = (engine.parseContent(insertion.value, "virt.pc") as Fragment)
    .children[0];
  const isText = child.nodeKind === NodeKind.Text;

  let buffer = insertion.value;
  const edits = [];

  if (insertion.namespaces) {
    for (const namespace in insertion.namespaces) {
      // double check to make sure that the namespace is actually used
      if (!buffer.includes(`<${namespace}.`)) {
        continue;
      }

      const importUri = insertion.namespaces[namespace];

      if (importUri === documentUri) {
        buffer = buffer.replace(new RegExp(`${namespace}.`, "g"), ``);
      } else {
        const { ns, edit } = autoAddImport(
          documentUri,
          documents,
          engine,
          importUri
        );
        buffer = buffer.replace(new RegExp(`${namespace}.`, "g"), `${ns}.`);
        edits.push(edit);
      }
    }
  }

  if (isAttributeValue) {
    if (isText) {
      buffer = `"${buffer}"`;
    } else {
      buffer = `{${buffer}}`;
    }
  }

  return [buffer, edits];
};

const maybeBreak = (buffer: string, ast: Node, isFirstChild: boolean) => {
  if (isNode(ast) && ast.nodeKind === NodeKind.Element) {
    return `\n${INDENT}${buffer}\n`;
  }
  return buffer;
};

const autoAddImport = (
  exprUri: string,
  documents: DocumentManager,
  engine: EngineDelegate,
  importUri: string
): { ns: string; edit?: DocumentTextEdit } | undefined => {
  let ns: string;

  const ast = engine.getLoadedAst(exprUri) as DependencyNodeContent;
  const data = engine.getLoadedData(exprUri) as LoadedPCData;
  const imports = getImports(ast);
  const importExpr = imports.find(
    (imp) =>
      data.dependencies[getAttributeStringValue("as", imp)] === importUri ||
      data.dependencies[getAttributeStringValue("src", imp)] === importUri
  );

  if (importExpr) {
    ns = getAttributeStringValue("as", importExpr);

    // No namespace? add the attribute
    if (!ns) {
      ns = getUniqueImportId(importUri, imports);
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
    ns = getUniqueImportId(importUri, imports);
    return {
      ns,
      edit: {
        uri: exprUri,
        chars: `<import src="${engine.resolveFile(
          exprUri,
          importUri
        )}" as="${ns}" />\n`.split(""),
        index: 0,
      },
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
