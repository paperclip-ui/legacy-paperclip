import { Node, traverseExpression } from "../html/ast";
import { StringRange } from "../base/ast";

export enum JsExpressionKind {
  Node = "Node",
  Reference = "Reference",
  Array = "Array",
  Object = "Object",
  String = "String",
  Number = "Number",
  Boolean = "Boolean",
  Conjunction = "Conjunction",
  Not = "Not",
  Group = "Group"
}

type BaseJsExpression<TKind extends JsExpressionKind> = {
  jsKind: TKind;
};

export type JsNode = Node & BaseJsExpression<JsExpressionKind.Node>;

export type JsObjectProperty = {
  key: string;
  value: JsExpression;
};

export enum JsConjunctionOperatorKind {
  And = "And",
  Or = "Or"
}

export type JsConjunction = {
  left: JsExpression;
  range: StringRange;
  right: JsExpression;
  operator: JsConjunctionOperatorKind;
} & BaseJsExpression<JsExpressionKind.Conjunction>;

export type JsObject = {
  properties: JsObjectProperty[];
  range: StringRange;
} & BaseJsExpression<JsExpressionKind.Object>;

export type JsArray = {
  values: JsExpression[];
  range: StringRange;
} & BaseJsExpression<JsExpressionKind.Array>;

export type JsString = {
  value: string;
  range: StringRange;
} & BaseJsExpression<JsExpressionKind.String>;

export type JsBoolean = {
  value: boolean;
  range: StringRange;
} & BaseJsExpression<JsExpressionKind.Boolean>;

export type JsNot = {
  expression: JsExpression;
  range: StringRange;
} & BaseJsExpression<JsExpressionKind.Not>;

export type JsGroup = {
  expression: JsExpression;
  range: StringRange;
} & BaseJsExpression<JsExpressionKind.Group>;

export type JsNumber = {
  value: number;
  range: StringRange;
} & BaseJsExpression<JsExpressionKind.Number>;

export type Reference = {
  path: ReferencePart[];
  range: StringRange;
} & BaseJsExpression<JsExpressionKind.Reference>;

export type ReferencePart = {
  name: string;
  optional: boolean;
};

export type JsExpression =
  | Reference
  | JsNode
  | JsObject
  | JsGroup
  | JsArray
  | JsNumber
  | JsString
  | JsBoolean
  | JsConjunction
  | JsNot;

export const traverseJSExpression = (
  expr: JsExpression,
  each: (expr: JsExpression) => void | boolean
) => {
  if (expr.jsKind === JsExpressionKind.Conjunction) {
    return (
      traverseJSExpression(expr.left, each) &&
      traverseJSExpression(expr.right, each)
    );
  } else if (expr.jsKind === JsExpressionKind.Array) {
    for (const value of expr.values) {
      if (traverseJSExpression(value, each) === false) {
        return false;
      }
    }
  } else if (expr.jsKind === JsExpressionKind.Node) {
    return traverseExpression(expr, each);
  }
  return true;
};
