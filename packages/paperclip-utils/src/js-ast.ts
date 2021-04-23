import { Node } from "./ast";
import { SourceLocation } from "./base-ast";

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
  location: SourceLocation;
  right: JsExpression;
  operator: JsConjunctionOperatorKind;
} & BaseJsExpression<JsExpressionKind.Conjunction>;

export type JsObject = {
  properties: JsObjectProperty[];
  location: SourceLocation;
} & BaseJsExpression<JsExpressionKind.Object>;

export type JsArray = {
  values: JsExpression[];
  location: SourceLocation;
} & BaseJsExpression<JsExpressionKind.Array>;

export type JsString = {
  value: string;
  location: SourceLocation;
} & BaseJsExpression<JsExpressionKind.String>;

export type JsBoolean = {
  value: boolean;
  location: SourceLocation;
} & BaseJsExpression<JsExpressionKind.Boolean>;

export type JsNot = {
  expression: JsExpression;
  location: SourceLocation;
} & BaseJsExpression<JsExpressionKind.Not>;

export type JsGroup = {
  expression: JsExpression;
  location: SourceLocation;
} & BaseJsExpression<JsExpressionKind.Group>;

export type JsNumber = {
  value: number;
  location: SourceLocation;
} & BaseJsExpression<JsExpressionKind.Number>;

export type Reference = {
  path: ReferencePart[];
  location: SourceLocation;
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
