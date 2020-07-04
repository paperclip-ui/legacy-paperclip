import { Node } from "./ast";
import { SourceLocation } from "./base-ast";

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
  location: SourceLocation;
} & BaseStatement<StatementKind.Object>;

export type JsArray = {
  values: Statement[];
  location: SourceLocation;
} & BaseStatement<StatementKind.Array>;

export type JsString = {
  value: string;
  location: SourceLocation;
} & BaseStatement<StatementKind.String>;

export type JsBoolean = {
  value: boolean;
  location: SourceLocation;
} & BaseStatement<StatementKind.Boolean>;

export type JsNumber = {
  value: number;
  location: SourceLocation;
} & BaseStatement<StatementKind.Number>;

export type Reference = {
  path: ReferencePart[];
  location: SourceLocation;
} & BaseStatement<StatementKind.Reference>;

export type ReferencePart = {
  name: string;
  optional: boolean;
};

export type Statement =
  | Reference
  | JsNode
  | JsObject
  | JsArray
  | JsNumber
  | JsString
  | JsBoolean;
