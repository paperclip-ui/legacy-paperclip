import { ExprTextSource } from "../base/virt";
import { VirtScriptObject } from "../script/virt";
import { VirtualElementSourceInfo, VirtualNode } from "./virt";

export enum ActionKind {
  ReplaceNode = "ReplaceNode",
  InsertChild = "InsertChild",
  DeleteChild = "DeleteChild",
  SetAttribute = "SetAttribute",
  SetElementSourceInfo = "SetElementSourceInfo",
  SetAnnotations = "SetAnnotations",
  SourceUriChanged = "SourceUriChanged",
  SetText = "SetText",
  SetElementSourceId = "SetElementSourceId",
  RemoveAttribute = "RemoveAttribute",
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
export type SetElementSourceInfo = {
  value: VirtualElementSourceInfo;
} & BaseAction<ActionKind.SetElementSourceInfo>;
export type SetElementSourceId = {
  value: string;
} & BaseAction<ActionKind.SetElementSourceId>;
export type SetAnnotations = {
  value?: VirtScriptObject;
} & BaseAction<ActionKind.SetAnnotations>;
export type RemoveAttribute = {
  name: string;
} & BaseAction<ActionKind.RemoveAttribute>;
export type SetText = {
  value: string;
} & BaseAction<ActionKind.SetText>;

export type Action =
  | ReplaceNode
  | InsertChild
  | DeleteChild
  | SetElementSourceInfo
  | SetAttribute
  | SetAnnotations
  | SetElementSourceId
  | SetText
  | RemoveAttribute;

export type Mutation = {
  nodePath: number[];
  action: Action;
};
