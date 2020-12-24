import { EngineDelegate, createEngineDelegate } from "paperclip";
import { EventEmitter } from "events";
import {
  AnnotationsChanged,
  PCMutation,
  PCMutationAction,
  PCMutationActionKind
} from "./mutations";
import {
  ExprSource,
  SourceLocation,
  VirtJsObject,
  NodeKind,
  Node,
  traverseExpression,
  Expression,
  Fragment,
  getParentNode
} from "paperclip-utils";

type ContentChangedHandler = (uri: string, content: string) => void;
type PCSourceWriterOptions = {
  getContent: (uri: string) => Promise<string> | string;
};

export type ContentChange = {
  start: number;
  end: number;
  value: string;
};

const ANNOTATION_KEYS = ["title", "width", "height", "x", "y"];

export class PCSourceWriter {
  private _engine: EngineDelegate;
  constructor(private _options: PCSourceWriterOptions) {}
  async getContentChanges({ exprSource, action }: PCMutation) {
    const changes: ContentChange[] = [];
    const engine = await this._loadEngine();
    const ast = engine.parseContent(
      await this._options.getContent(exprSource.uri)
    );

    switch (action.kind) {
      case PCMutationActionKind.ANNOTATIONS_CHANGED: {
        changes.push(
          this._getAnnotationChange(
            exprSource,
            action.annotationsSource,
            action.annotations
          )
        );
        break;
      }
      case PCMutationActionKind.EXPRESSION_DELETED: {
        changes.push(...this._getExpressionDeletedChanged(exprSource, ast));
        break;
      }
    }

    return changes;
  }

  private async _loadEngine() {
    if (this._engine) {
      return this._engine;
    }

    return (this._engine = await createEngineDelegate());
  }

  private _getExpressionDeletedChanged(
    exprSource: ExprSource,
    ast: Node
  ): ContentChange[] {
    const node = getAssocNode(exprSource, ast);
    const parent = getParentNode(node, ast);
    const childIndex = parent.children.findIndex(child => child === node);

    const changes = [];

    const beforeChild = childIndex > 0 ? parent.children[childIndex - 1] : null;

    // if before child is a comment, then assume it's an annotation
    if (beforeChild && beforeChild.kind === NodeKind.Comment) {
      changes.push({
        start: beforeChild.location.start,
        end: beforeChild.location.end,
        value: ""
      });
    }

    changes.push({
      start: exprSource.location.start,
      end: exprSource.location.end,
      value: ""
    });

    return changes;
  }

  private _getAnnotationChange(
    exprSource: ExprSource,
    annotationsSource: ExprSource | null,
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
    if (!annotationsSource) {
      buffer.unshift("\n");
      buffer.push("\n");
    }

    return {
      start: annotationsSource
        ? annotationsSource.location.start
        : exprSource.location.start,
      end: annotationsSource
        ? annotationsSource.location.end
        : exprSource.location.start,
      value: buffer.join("")
    };
  }
}

const getAssocNode = (exprSource: ExprSource, root: Node): Node => {
  let foundExpr: Expression;
  traverseExpression(root, node => {
    if (
      node.location.start === exprSource.location.start &&
      node.location.end === exprSource.location.end
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
