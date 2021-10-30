import { IntermElement } from "./html";

export enum IntermScriptExpression {
  Reference = "Reference",
  Element = "Element"
}

type BaseScriptExpression<TKind extends IntermScriptExpression> = {
  kind: TKind;
};

export type IntermReference = {
  name?: string;
  optional?: boolean;
} & BaseScriptExpression<IntermScriptExpression.Reference>;

export type IntermScriptEelement = {
  kind: IntermScriptExpression;
  element: IntermElement;
} & BaseScriptExpression<IntermScriptExpression.Element>;

export type ScriptExpression = IntermReference | IntermScriptExpression;
