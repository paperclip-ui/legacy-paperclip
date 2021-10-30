import { StringRange } from "paperclip-utils";
import { IntermElement } from "./html";

export enum IntermIntermScriptExpressionKind {
  Reference = "Reference",
  Conjunction = "Conjunction",
  Number = "Number",
  Boolean = "Boolean",
  Group = "Group",
  Not = "Not",
  String = "String",
  Element = "Element"
}

type BaseIntermScriptExpression<
  TKind extends IntermIntermScriptExpressionKind
> = {
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
} & BaseIntermScriptExpression<IntermIntermScriptExpressionKind.Conjunction>;

export type IntermReference = {
  name?: string;
  optional?: boolean;
} & BaseIntermScriptExpression<IntermIntermScriptExpressionKind.Reference>;

export type IntermNumber = {
  value: string;
} & BaseIntermScriptExpression<IntermIntermScriptExpressionKind.Number>;

export type IntermString = {
  value: string;
} & BaseIntermScriptExpression<IntermIntermScriptExpressionKind.String>;

export type IntermGroup = {
  inner: IntermScriptExpression;
} & BaseIntermScriptExpression<IntermIntermScriptExpressionKind.Group>;

export type IntermBoolean = {
  value: boolean;
} & BaseIntermScriptExpression<IntermIntermScriptExpressionKind.Boolean>;

export type IntermNot = {
  expression: IntermScriptExpression;
} & BaseIntermScriptExpression<IntermIntermScriptExpressionKind.Not>;

export type IntermScriptEelement = {
  kind: IntermIntermScriptExpressionKind;
  element: IntermElement;
} & BaseIntermScriptExpression<IntermIntermScriptExpressionKind.Element>;

export type IntermScriptExpression =
  | IntermNot
  | IntermString
  | IntermGroup
  | IntermNumber
  | IntermBoolean
  | IntermReference
  | IntermScriptEelement
  | IntermConjunction;
