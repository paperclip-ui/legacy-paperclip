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
  private _engine: EngineDelegate;
  constructor(private _options: PCSourceWriterOptions) {}
  async getContentChanges(
    mutations: PCMutation[]
  ): Promise<Record<string, ContentChange[]>> {
    const changes: ContentChange[] = [];
    const engine = this._options.engine;
    for (const { ExprTextSource, action } of mutations) {
      const ast = engine.parseContent(
        await this._options.getContent(ExprTextSource.uri)
      );

      switch (action.kind) {
        case PCMutationActionKind.ANNOTATIONS_CHANGED: {
          changes.push(
            this._getAnnotationChange(
              ExprTextSource,
              action.annotationsSource,
              action.annotations
            )
          );
          break;
        }
        case PCMutationActionKind.EXPRESSION_DELETED: {
          changes.push(
            ...this._getExpressionDeletedChanged(ExprTextSource, ast)
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
    ExprTextSource: ExprTextSource,
    ast: Node
  ): ContentChange[] {
    const node = getAssocNode(ExprTextSource, ast);
    const parent = getParentNode(node, ast);
    const childIndex = parent.children.findIndex(child => child === node);

    const changes = [];

    const beforeChild = childIndex > 0 ? parent.children[childIndex - 1] : null;

    // if before child is a comment, then assume it's an annotation
    if (beforeChild && beforeChild.nodeKind === NodeKind.Comment) {
      changes.push({
        uri: ExprTextSource.uri,
        start: beforeChild.location.start,
        end: beforeChild.location.end,
        value: ""
      });
    }

    changes.push({
      uri: ExprTextSource.uri,
      start: ExprTextSource.location.start,
      end: ExprTextSource.location.end,
      value: ""
    });

    return changes;
  }

  private _getAnnotationChange(
    ExprTextSource: ExprTextSource,
    annotationsSource: ExprTextSource | null,
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
      uri: ExprTextSource.uri,
      start: annotationsSource
        ? annotationsSource.location.start
        : ExprTextSource.location.start,
      end: annotationsSource
        ? annotationsSource.location.end
        : ExprTextSource.location.start,

      // newline may have been clipped off, so re-add if that happens
      value: buffer.join("")
    };
  }
}

const getAssocNode = (ExprTextSource: ExprTextSource, root: Node): Node => {
  let foundExpr: Expression;
  traverseExpression(root, node => {
    if (
      node.location.start === ExprTextSource.location.start &&
      node.location.end === ExprTextSource.location.end
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
