import { VirtualNode } from "./virt";

export enum ActionKind {
  ReplaceNode = "ReplaceNode",
  InsertChild = "InsertChild",
  DeleteChild = "DeleteChild",
  SetAttribute = "SetAttribute",
  SourceChanged = "SourceChanged",
  SourceUriChanged = "SourceUriChanged",
  SetText = "SetText",
  RemoveAttribute = "RemoveAttribute"
}

export type BaseAction<TKind extends ActionKind> = {
  kind: TKind;
};

export type ReplaceNode = {
  replacement: VirtualNode;
} & BaseAction<ActionKind.ReplaceNode>;
export type InsertChild = {
  child: VirtualNode;
  index: number;
} & BaseAction<ActionKind.InsertChild>;
export type DeleteChild = {
  index: number;
} & BaseAction<ActionKind.DeleteChild>;
export type SetAttribute = {
  name: string;
  value?: string;
} & BaseAction<ActionKind.SetAttribute>;
export type RemoveAttribute = {
  name: string;
} & BaseAction<ActionKind.RemoveAttribute>;
export type SetText = {
  value: string;
} & BaseAction<ActionKind.SetText>;
export type SourceUriChanged = {
  newUri: string;
} & BaseAction<ActionKind.SourceUriChanged>;
export type SourceChanged = {
  propertyName: string;
  newLocation: Location;
} & BaseAction<ActionKind.SourceChanged>;

export type Action =
  | ReplaceNode
  | InsertChild
  | DeleteChild
  | SetAttribute
  | SourceChanged
  | SourceUriChanged
  | SetText
  | RemoveAttribute;

export type Mutation = {
  nodePath: number[];
  action: Action;
};
