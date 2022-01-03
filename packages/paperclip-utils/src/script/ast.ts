import { Node, traverseExpression } from "../html/ast";
import { StringRange } from "../base/ast";

export enum ScriptExpressionKind {
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

type BaseScriptExpression<TKind extends ScriptExpressionKind> = {
  scriptKind: TKind;
};

export type ScriptNode = Node & BaseScriptExpression<ScriptExpressionKind.Node>;

export type ScriptObjectProperty = {
  key: string;
  value: ScriptExpression;
};

export enum ScriptConjunctionOperatorKind {
  And = "And",
  Or = "Or"
}

export type ScriptConjunction = {
  left: ScriptExpression;
  range: StringRange;
  right: ScriptExpression;
  operator: ScriptConjunctionOperatorKind;
} & BaseScriptExpression<ScriptExpressionKind.Conjunction>;

export type ScriptObject = {
  properties: ScriptObjectProperty[];
  range: StringRange;
} & BaseScriptExpression<ScriptExpressionKind.Object>;

export type ScriptArray = {
  values: ScriptExpression[];
  range: StringRange;
} & BaseScriptExpression<ScriptExpressionKind.Array>;

export type ScriptString = {
  value: string;
  range: StringRange;
} & BaseScriptExpression<ScriptExpressionKind.String>;

export type ScriptBoolean = {
  value: boolean;
  range: StringRange;
} & BaseScriptExpression<ScriptExpressionKind.Boolean>;

export type ScriptNot = {
  expression: ScriptExpression;
  range: StringRange;
} & BaseScriptExpression<ScriptExpressionKind.Not>;

export type ScriptGroup = {
  expression: ScriptExpression;
  range: StringRange;
} & BaseScriptExpression<ScriptExpressionKind.Group>;

export type ScriptNumber = {
  value: number;
  range: StringRange;
} & BaseScriptExpression<ScriptExpressionKind.Number>;

export type Reference = {
  path: ReferencePart[];
  range: StringRange;
} & BaseScriptExpression<ScriptExpressionKind.Reference>;

export type ReferencePart = {
  name: string;
  optional: boolean;
};

export type ScriptExpression =
  | Reference
  | ScriptNode
  | ScriptObject
  | ScriptGroup
  | ScriptArray
  | ScriptNumber
  | ScriptString
  | ScriptBoolean
  | ScriptConjunction
  | ScriptNot;

export const traverseJSExpression = (
  expr: ScriptExpression,
  each: (expr: ScriptExpression) => void | boolean
) => {
  if (expr.scriptKind === ScriptExpressionKind.Conjunction) {
    return (
      traverseJSExpression(expr.left, each) &&
      traverseJSExpression(expr.right, each)
    );
  } else if (expr.scriptKind === ScriptExpressionKind.Array) {
    for (const value of expr.values) {
      if (traverseJSExpression(value, each) === false) {
        return false;
      }
    }
  } else if (expr.scriptKind === ScriptExpressionKind.Node) {
    return traverseExpression(expr, each);
  }
  return true;
};
