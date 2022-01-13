/**
 */

export enum DocumentEditKind {
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

export type DocumentBaseEdit<TKind extends DocumentEditKind> = {
  kind: TKind;
};

/**
 * Handles inserting and deleting source text
 */

export type SetSourceText = {
  value: string;
  start: number;
  end: number;
} & DocumentBaseEdit<DocumentEditKind.SetSourceText>;

/**
 */

export type DocumentEdit = SetSourceText;
