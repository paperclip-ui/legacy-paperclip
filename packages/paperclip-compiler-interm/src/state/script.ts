import { StringRange } from "paperclip-utils";
import { IntermElement } from "./html";

export enum IntermScriptExpressionKind {
  Reference = "Reference",
  Conjunction = "Conjunction",
  Number = "Number",
  Boolean = "Boolean",
  Group = "Group",
  Not = "Not",
  String = "String",
  Element = "Element"
}

type BaseIntermScriptExpression<TKind extends IntermScriptExpressionKind> = {
  kind: TKind;
  range: StringRange;
};

export enum IntermConjunctionOperator {
  Or = "Or",
  And = "And"
}

export type IntermConjunction = {
  operator: IntermConjunctionOperator;
  left: IntermScriptExpression;
  right: IntermScriptExpression;
} & BaseIntermScriptExpression<IntermScriptExpressionKind.Conjunction>;

export type IntermReference = {
  name?: string;
  optional?: boolean;
} & BaseIntermScriptExpression<IntermScriptExpressionKind.Reference>;

export type IntermNumber = {
  value: string;
} & BaseIntermScriptExpression<IntermScriptExpressionKind.Number>;

export type IntermString = {
  value: string;
} & BaseIntermScriptExpression<IntermScriptExpressionKind.String>;

export type IntermGroup = {
  inner: IntermScriptExpression;
} & BaseIntermScriptExpression<IntermScriptExpressionKind.Group>;

export type IntermBoolean = {
  value: boolean;
} & BaseIntermScriptExpression<IntermScriptExpressionKind.Boolean>;

export type IntermNot = {
  expression: IntermScriptExpression;
} & BaseIntermScriptExpression<IntermScriptExpressionKind.Not>;

export type IntermScriptEelement = {
  kind: IntermScriptExpressionKind;
  element: IntermElement;
} & BaseIntermScriptExpression<IntermScriptExpressionKind.Element>;

export type IntermScriptExpression =
  | IntermNot
  | IntermString
  | IntermGroup
  | IntermNumber
  | IntermBoolean
  | IntermReference
  | IntermScriptEelement
  | IntermConjunction;
