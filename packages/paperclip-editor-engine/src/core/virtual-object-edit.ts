/**
 */

export enum VirtualobjectEditKind {
  // We use this be default to ensure that we maintain positional information
  // about an inserted element
  InsertNodeBefore = "InsertNodeBefore",

  // inserts a child into a parent element. This will happen
  // if there are no siblings to insert before
  AppendChild = "AppendChild",
  SetAttribute = "SetAttribute",
  SetTextNodeValue = "SetTextNodeValue",
  SetSourceText = "SetSourceText"
}

/**
 */

export type VirtualObjectBaseEdit<TKind extends VirtualobjectEditKind> = {
  kind: TKind;
};

export type InsertNodeBefore = {
  beforeNodeId: string;
  node: string;
} & VirtualObjectBaseEdit<VirtualobjectEditKind.InsertNodeBefore>;

/**
 */

export type VirtualObjectEdit = InsertNodeBefore;
