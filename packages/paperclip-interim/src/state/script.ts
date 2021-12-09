import { StringRange } from "paperclip-utils";
import { InterimElement } from "./html";

export enum InterimScriptExpressionKind {
  Reference = "Reference",
  Conjunction = "Conjunction",
  Number = "Number",
  Boolean = "Boolean",
  Group = "Group",
  Not = "Not",
  String = "String",
  Element = "ScriptElement"
}

type BaseInterimScriptExpression<TKind extends InterimScriptExpressionKind> = {
  kind: TKind;
  range: StringRange;
};

export enum InterimConjunctionOperator {
  Or = "Or",
  And = "And"
}

export type InterimConjunction = {
  operator: InterimConjunctionOperator;
  left: InterimScriptExpression;
  right: InterimScriptExpression;
} & BaseInterimScriptExpression<InterimScriptExpressionKind.Conjunction>;

export type InterimReference = {
  name?: string;
  optional?: boolean;
} & BaseInterimScriptExpression<InterimScriptExpressionKind.Reference>;

export type InterimNumber = {
  value: string;
} & BaseInterimScriptExpression<InterimScriptExpressionKind.Number>;

export type InterimString = {
  value: string;
} & BaseInterimScriptExpression<InterimScriptExpressionKind.String>;

export type InterimGroup = {
  inner: InterimScriptExpression;
} & BaseInterimScriptExpression<InterimScriptExpressionKind.Group>;

export type InterimBoolean = {
  value: boolean;
} & BaseInterimScriptExpression<InterimScriptExpressionKind.Boolean>;

export type InterimNot = {
  expression: InterimScriptExpression;
} & BaseInterimScriptExpression<InterimScriptExpressionKind.Not>;

export type InterimScriptEelement = {
  kind: InterimScriptExpressionKind;
  element: InterimElement;
} & BaseInterimScriptExpression<InterimScriptExpressionKind.Element>;

export type InterimScriptExpression =
  | InterimNot
  | InterimString
  | InterimGroup
  | InterimNumber
  | InterimBoolean
  | InterimReference
  | InterimScriptEelement
  | InterimConjunction;
