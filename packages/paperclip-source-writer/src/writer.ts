import { EngineDelegate } from "@paperclip-ui/core";
import {
  CSSDeclarationChanged,
  PCMutation,
  PCMutationActionKind,
} from "./mutations";
import {
  ExprTextSource,
  StringRange,
  NodeKind,
  Node,
  traverseExpression,
  Expression,
  getParentNode,
  DependencyNodeContent,
  getPCNodeAnnotations,
  getNodeById,
} from "@paperclip-ui/utils";
import { editString } from "./string-editor";

export type ContentChange = {
  uri: string;
  start: number;
  end: number;
  value: string;
};

const ANNOTATION_KEYS = ["title", "width", "height", "x", "y"];

// TODO: add more tests here

export class PCSourceWriter {
  constructor(private _engine: EngineDelegate) {}

  apply(mutations: PCMutation[]): Record<string, ContentChange[]> {
    const changes = this._getContentChanges(mutations);

    for (const uri in changes) {
      const newContent = editString(
        this._engine.getVirtualContent(uri),
        changes[uri]
      );
      this._engine.updateVirtualFileContent(uri, newContent);
    }

    // return changes so that

    return changes;
  }

  private _getContentChanges(
    mutations: PCMutation[]
  ): Record<string, ContentChange[]> {
    const changes: ContentChange[] = [];
    const engine = this._engine;
    for (const { targetId, action } of mutations) {
      const [uri, targetAst] = engine.getExpressionById(targetId);
      const documentAst = engine.getLoadedAst(uri) as DependencyNodeContent;

      const textSource = { uri, range: targetAst.range };

      switch (action.kind) {
        case PCMutationActionKind.ANNOTATIONS_CHANGED: {
          changes.push(
            this._getAnnotationChange(
              textSource,
              getPCNodeAnnotations(
                getNodeById((targetAst as Node).id, documentAst),
                documentAst
              )?.range,
              action.annotations
            )
          );
          break;
        }
        case PCMutationActionKind.CSS_DECLARATION_CHANGED: {
          changes.push(this._getCSSDeclarationChange(textSource, action));
          break;
        }
        case PCMutationActionKind.EXPRESSION_DELETED: {
          changes.push(
            ...this._getExpressionDeletedChanged(textSource, targetAst as Node)
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
    const childIndex = parent.children.findIndex((child) => child === node);

    const changes = [];

    const beforeChild = childIndex > 0 ? parent.children[childIndex - 1] : null;

    // if before child is a comment, then assume it's an annotation
    if (beforeChild && beforeChild.nodeKind === NodeKind.Comment) {
      changes.push({
        uri: exprTextSource.uri,
        start: beforeChild.range.start.pos,
        end: beforeChild.range.end.pos,
        value: "",
      });
    }

    changes.push({
      uri: exprTextSource.uri,
      start: exprTextSource.range.start.pos,
      end: exprTextSource.range.end.pos,
      value: "",
    });

    return changes;
  }

  private _getCSSDeclarationChange(
    exprTextSource: ExprTextSource,
    action: CSSDeclarationChanged
  ) {
    return {
      uri: exprTextSource.uri,
      start: exprTextSource.range.start.pos,
      end: exprTextSource.range.end.pos,
      value: `${action.name}: ${action.value};`,
    };
  }

  private _getAnnotationChange(
    exprTextSource: ExprTextSource,
    annotationsRange: StringRange | null,
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
    if (!annotationsRange) {
      buffer.unshift("\n");
      buffer.push("\n");
    }

    return {
      uri: exprTextSource.uri,
      start: annotationsRange
        ? annotationsRange.start.pos
        : exprTextSource.range.start.pos,
      end: annotationsRange
        ? annotationsRange.end.pos
        : exprTextSource.range.start.pos,

      // newline may have been clipped off, so re-add if that happens
      value: buffer.join(""),
    };
  }
}

const getAssocNode = (exprTextSource: ExprTextSource, root: Node): Node => {
  let foundExpr: Expression;
  traverseExpression(root, null, (node) => {
    if (
      node.range.start.pos === exprTextSource.range.start.pos &&
      node.range.end.pos === exprTextSource.range.end.pos
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
