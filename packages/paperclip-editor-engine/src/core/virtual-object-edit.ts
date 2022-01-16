/**
 */

export enum VirtualobjectEditKind {
  // We use this be default to ensure that we maintain positional information
  // about an inserted element
  InsertNodeBefore = "InsertNodeBefore",
  SetTextNodeValue = "SetTextNodeValue",
  AddAttribute = "AddAttribute",
  UpdateAttribute = "UpdateAttribute",
  SetAnnotations = "SetAnnotations",
  SetNodeType = "SetNodeType",

  // inserts a child into a parent element. This will happen
  // if there are no siblings to insert before
  AppendChild = "AppendChild",
  SetAttribute = "SetAttribute"
}

/**
 */

export type VirtualObjectBaseEdit<TKind extends VirtualobjectEditKind> = {
  kind: TKind;
};

export type InsertNodeBefore = {
  beforeNodePath: string;
  node: string;
} & VirtualObjectBaseEdit<VirtualobjectEditKind.InsertNodeBefore>;

export type SetTextNodeValue = {
  nodePath: string;
  value: string;
} & VirtualObjectBaseEdit<VirtualobjectEditKind.SetTextNodeValue>;

export type AddAttribute = {
  nodePath: string;
  name: string;
  value: string;
} & VirtualObjectBaseEdit<VirtualobjectEditKind.AddAttribute>;

export type UpdateAttribute = {
  nodePath: string;
  name: string;
  newName?: string;
  value: string;
} & VirtualObjectBaseEdit<VirtualobjectEditKind.UpdateAttribute>;

export type SetAnnotations = {
  nodePath: string;
  value: Record<string, string | Object>;
} & VirtualObjectBaseEdit<VirtualobjectEditKind.SetAnnotations>;

export type AppendChild = {
  nodePath: string;
  child: string;
} & VirtualObjectBaseEdit<VirtualobjectEditKind.AppendChild>;

/**
 */

export type VirtualObjectEdit =
  | InsertNodeBefore
  | AddAttribute
  | UpdateAttribute
  | SetTextNodeValue
  | SetAnnotations
  | AppendChild;
