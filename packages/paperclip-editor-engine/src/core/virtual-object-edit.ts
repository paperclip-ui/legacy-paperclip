/**
 */

import { Node } from "@paperclip-ui/core";

export enum VirtualObjectEditKind {
  // We use this be default to ensure that we maintain positional information
  // about an inserted element
  InsertNodeBefore = "InsertNodeBefore",
  SetTextNodeValue = "SetTextNodeValue",
  AddAttribute = "AddAttribute",
  DeleteAttribute = "DeleteAttribute",
  UpdateAttribute = "UpdateAttribute",
  SetAnnotations = "SetAnnotations",

  // inserts a child into a parent element. This will happen
  // if there are no siblings to insert before
  AppendChild = "AppendChild",
  SetStyleDeclaration = "SetStyleDeclaration",
  PrependChild = "PrependChild",
  AddFrame = "AddFrame",
  DeleteNode = "DeleteNode",

  // TODO: needs to scan all documents where reference is used. Probably needs to use inferencing engine for this.
  RenameReferenceName = "RenameReferenceName",

  // Should
  RenameComponentName = "RenameComponentName",
}

/**
 * Child insertion struct that contains all of the infomation to insert elements
 * into a document. Elements with namespaces will be auto-imported into the doc
 */

export type ChildInsertion = {
  // String value of the child to insert
  value: string;

  // source documents of any elements that are included
  namespaces?: Record<string, string>;
};

export enum EditTargetKind {
  VirtualNode = "VirtualNode",
  Expression = "Expression",
}

export type BaseEditTarget<TKind extends EditTargetKind> = {
  kind: TKind;
};

export type ExpressionEditTarget = {
  sourceId: string;
} & BaseEditTarget<EditTargetKind.Expression>;

export type VirtualNodeEditTarget = {
  nodePath: string;
} & BaseEditTarget<EditTargetKind.VirtualNode>;

export type EditTarget = ExpressionEditTarget | VirtualNodeEditTarget;

/**
 */

export type VirtualObjectBaseEdit<TKind extends VirtualObjectEditKind> = {
  kind: TKind;
};

export type InsertNodeBefore = {
  beforeNodePath: string;
  node: ChildInsertion;
} & VirtualObjectBaseEdit<VirtualObjectEditKind.InsertNodeBefore>;

export type SetTextNodeValue = {
  nodePath: string;
  value: string;
} & VirtualObjectBaseEdit<VirtualObjectEditKind.SetTextNodeValue>;

export type AddAttribute = {
  target: EditTarget;
  name: string;
  value: string;
} & VirtualObjectBaseEdit<VirtualObjectEditKind.AddAttribute>;

export type SetStyleDeclaration = {
  target: EditTarget;
  name: string;
  oldName?: string;
  value: string;
} & VirtualObjectBaseEdit<VirtualObjectEditKind.SetStyleDeclaration>;

export type DeleteAttribute = {
  target: EditTarget;
  name: string;
} & VirtualObjectBaseEdit<VirtualObjectEditKind.DeleteAttribute>;

export type UpdateAttribute = {
  nodePath: string;
  name: string;
  newName?: string;
  value: string;
} & VirtualObjectBaseEdit<VirtualObjectEditKind.UpdateAttribute>;

export type SetAnnotations = {
  nodePath: string;
  value: Record<string, string | Object>;
} & VirtualObjectBaseEdit<VirtualObjectEditKind.SetAnnotations>;

export type AppendChild = {
  nodePath: string;
  child: ChildInsertion;
} & VirtualObjectBaseEdit<VirtualObjectEditKind.AppendChild>;

export type PrependChild = {
  target?: EditTarget;
  child: ChildInsertion;
} & VirtualObjectBaseEdit<VirtualObjectEditKind.PrependChild>;

export type AddFrame = {
  box: { x: number; y: number; width: number; height: number };
  child: ChildInsertion;
} & VirtualObjectBaseEdit<VirtualObjectEditKind.AddFrame>;

export type DeleteNode = {
  nodePath: string;
} & VirtualObjectBaseEdit<VirtualObjectEditKind.DeleteNode>;

/**
 */

export type VirtualObjectEdit =
  | InsertNodeBefore
  | AddAttribute
  | UpdateAttribute
  | SetTextNodeValue
  | PrependChild
  | SetStyleDeclaration
  | DeleteAttribute
  | AddFrame
  | DeleteNode
  | SetAnnotations
  | AppendChild;
