import { EngineDelegate } from "paperclip";
import { EventEmitter } from "events";
import {
  AnnotationsChanged,
  PCMutation,
  PCMutationAction,
  PCMutationActionKind
} from "./mutations";
import {
  ExprTextSource,
  SourceLocation,
  VirtJsObject,
  VirtualElement,
  NodeKind,
  Node,
  traverseExpression,
  Expression,
  Fragment,
  getParentNode,
  LoadedPCData,
  getNodeByPath,
  DependencyNodeContent,
  getPCNodeAnnotations,
  getNodeById
} from "paperclip-utils";

type PCSourceWriterOptions = {
  engine: EngineDelegate;
};

export type ContentChange = {
  uri: string;
  start: number;
  end: number;
  value: string;
};

const ANNOTATION_KEYS = ["title", "width", "height", "x", "y"];

export class PCSourceWriter {
  constructor(private _options: PCSourceWriterOptions) {}
  async getContentChanges(
    mutations: PCMutation[]
  ): Promise<Record<string, ContentChange[]>> {
    const changes: ContentChange[] = [];
    const engine = this._options.engine;
    for (const { nodePath, nodeUri, action } of mutations) {
      const ast = engine.getLoadedAst(nodeUri) as DependencyNodeContent;
      const pcData = engine.getLoadedData(nodeUri) as LoadedPCData;
      const virtNode = getNodeByPath(nodePath, pcData.preview);

      const sourceInfo = engine.getVirtualNodeSourceInfo(nodePath, nodeUri);
      const pcNode = getNodeById(sourceInfo.sourceId, ast);

      switch (action.kind) {
        case PCMutationActionKind.ANNOTATIONS_CHANGED: {
          const el = virtNode as VirtualElement;

          changes.push(
            this._getAnnotationChange(
              sourceInfo.textSource,
              getPCNodeAnnotations(pcNode, ast)?.location,
              action.annotations
            )
          );
          break;
        }
        case PCMutationActionKind.EXPRESSION_DELETED: {
          changes.push(
            ...this._getExpressionDeletedChanged(sourceInfo.textSource, ast)
          );
          break;
        }
      }
    }

    const changesByUri = {};

    for (const change of changes) {
      if (!changesByUri[change.uri]) {
        changesByUri[change.uri] = [];
      }
      changesByUri[change.uri].push(change);
    }

    return changesByUri;
  }

  private _getExpressionDeletedChanged(
    exprTextSource: ExprTextSource,
    ast: Node
  ): ContentChange[] {
    const node = getAssocNode(exprTextSource, ast);
    const parent = getParentNode(node, ast);
    const childIndex = parent.children.findIndex(child => child === node);

    const changes = [];

    const beforeChild = childIndex > 0 ? parent.children[childIndex - 1] : null;

    // if before child is a comment, then assume it's an annotation
    if (beforeChild && beforeChild.nodeKind === NodeKind.Comment) {
      changes.push({
        uri: exprTextSource.uri,
        start: beforeChild.location.start,
        end: beforeChild.location.end,
        value: ""
      });
    }

    changes.push({
      uri: exprTextSource.uri,
      start: exprTextSource.location.start,
      end: exprTextSource.location.end,
      value: ""
    });

    return changes;
  }

  private _getAnnotationChange(
    exprTextSource: ExprTextSource,
    annottaionsLocation: SourceLocation | null,
    annotations: Object | null
  ): ContentChange {
    const buffer = ["<!--\n"];

    for (const key in annotations) {
      const chunk = [`  @${key} `];
      const value = annotations[key];
      if (
        Array.isArray(value) ||
        typeof value === "string" ||
        typeof value === "number"
      ) {
        chunk.push(JSON.stringify(value));
      } else {
        chunk.push("{ ");
        const items = [];
        const sortedKeys = Object.keys(value).sort((a, b) => {
          return ANNOTATION_KEYS.indexOf(a) < ANNOTATION_KEYS.indexOf(b)
            ? -1
            : 1;
        });

        for (const k of sortedKeys) {
          items.push(`${k}: ${JSON.stringify(value[k])}`);
        }
        chunk.push(items.join(", "), " }");
      }

      buffer.push(chunk.join(""), "\n");
    }

    buffer.push("-->");

    // insertion - give it some padding
    if (!annottaionsLocation) {
      buffer.unshift("\n");
      buffer.push("\n");
    }

    return {
      uri: exprTextSource.uri,
      start: annottaionsLocation
        ? annottaionsLocation.start
        : exprTextSource.location.start,
      end: annottaionsLocation
        ? annottaionsLocation.end
        : exprTextSource.location.start,

      // newline may have been clipped off, so re-add if that happens
      value: buffer.join("")
    };
  }
}

const getAssocNode = (exprTextSource: ExprTextSource, root: Node): Node => {
  let foundExpr: Expression;
  traverseExpression(root, node => {
    if (
      node.location.start === exprTextSource.location.start &&
      node.location.end === exprTextSource.location.end
    ) {
      foundExpr = node;
      return false;
    }
  });

  // should NOT happen
  if (!foundExpr) {
    console.error(
      `[PCSourceWriter] Cannot find associated node, content is likely out of sync with visual editor.`
    );
  }

  return foundExpr as Node;
};
