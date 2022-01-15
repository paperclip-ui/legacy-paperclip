/**
 */

export enum VirtualobjectEditKind {
  // We use this be default to ensure that we maintain positional information
  // about an inserted element
  InsertNodeBefore = "InsertNodeBefore",
  SetTextNodeValue = "SetTextNodeValue",
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

export type SetAnnotations = {
  nodePath: string;
  value: Record<string, string | Object>;
} & VirtualObjectBaseEdit<VirtualobjectEditKind.SetAnnotations>;

/**
 */

export type VirtualObjectEdit =
  | InsertNodeBefore
  | SetTextNodeValue
  | SetAnnotations;
