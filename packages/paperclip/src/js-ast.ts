import { Node } from "./ast";

export enum StatementKind {
  Node = "Node",
  Reference = "Reference",
  Array = "Array",
  Object = "Object",
  String = "String",
  Number = "Number",
  Boolean = "Boolean"
}

type BaseStatement<TKind extends StatementKind> = {
  jsKind: TKind;
};

export type JsNode = Node & BaseStatement<StatementKind.Node>;

export type JsObjectProperty = {
  key: string;
  value: Statement;
};
export type JsObject = {
  properties: JsObjectProperty[];
} & BaseStatement<StatementKind.Object>;

export type JsArray = {
  values: Statement[];
} & BaseStatement<StatementKind.Array>;

export type JsString = {
  value: string;
} & BaseStatement<StatementKind.String>;

export type JsBoolean = {
  value: boolean;
} & BaseStatement<StatementKind.Boolean>;

export type JsNumber = {
  value: number;
} & BaseStatement<StatementKind.Number>;

export type Reference = {
  path: string[];
} & BaseStatement<StatementKind.Reference>;

export type Statement =
  | Reference
  | JsNode
  | JsObject
  | JsArray
  | JsNumber
  | JsString
  | JsBoolean;
