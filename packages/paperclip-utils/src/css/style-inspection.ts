// 1:1 with Rust

export enum SelectorScopeKind {
  Element = "Element",
  Document = "Document"
}

type BaseSelectorScope<TKind extends SelectorScopeKind> = {
  kind: TKind;
};

export type ElementSelectorScope = BaseSelectorScope<SelectorScopeKind.Element>;
export type DocumentSelectorScope = BaseSelectorScope<
  SelectorScopeKind.Document
>;

export type SelectorScope = ElementSelectorScope | DocumentSelectorScope;

export enum SelectorInfoKind {
  List = "list",
  All = "All",
  Element = "Element",
  PseudoElement = "PseudoElement",
  PsuedoParamElement = "PseudoParamElement",
  Attribute = "Attribute",
  Not = "Not",
  Id = "Id",
  Class = "Class",
  Combo = "Combo",
  Child = "Child",
  Descendent = "Descendent",
  Adjacent = "Adjacent",
  Sibling = "Sibling"
}

export type BaseSelectorInfo<TKind extends SelectorInfoKind> = {
  kind: TKind;
};

export type GroupSelectorInfo<TKind extends SelectorInfoKind> = {
  selectors: Array<BaseSelectorInfo<SelectorInfoKind>>;
} & BaseSelectorInfo<TKind>;

export type TargetSelectorInfo<TKind extends SelectorInfoKind> = {
  value: string;
} & BaseSelectorInfo<TKind>;

export type WrapperSelectorInfo<TKind extends SelectorInfoKind> = {
  selector: BaseSelectorInfo<SelectorInfoKind>;
} & BaseSelectorInfo<TKind>;

export type BinarySelectorInfo<TKind extends SelectorInfoKind> = {
  left: BaseSelectorInfo<SelectorInfoKind>;
  right: BaseSelectorInfo<SelectorInfoKind>;
} & BaseSelectorInfo<TKind>;

export type ListSelectorInfo = GroupSelectorInfo<SelectorInfoKind.List>;
export type ElementSelectorInfo = TargetSelectorInfo<SelectorInfoKind.Element>;
export type AllSelectorInfo = GroupSelectorInfo<SelectorInfoKind.All>;
export type PseudoElementSelectorInfo = TargetSelectorInfo<
  SelectorInfoKind.PseudoElement
>;
export type PseudoParamElementSelectorInfo = TargetSelectorInfo<
  SelectorInfoKind.PsuedoParamElement
>;
export type AttributeSelectorInfo = TargetSelectorInfo<
  SelectorInfoKind.Attribute
>;
export type NotSelectorInfo = WrapperSelectorInfo<SelectorInfoKind.Not>;
export type IdSelectorInfo = TargetSelectorInfo<SelectorInfoKind.Id>;

export type ClassSelectorInfo = {
  name: string;
  value: string;
  scope: SelectorScope;
} & BaseSelectorInfo<SelectorInfoKind.Class>;

export type ComboSelectorInfo = GroupSelectorInfo<SelectorInfoKind.Combo>;
export type ChildSelectorInfo = BinarySelectorInfo<SelectorInfoKind.Child>;
export type DescendentSelectorInfo = BinarySelectorInfo<
  SelectorInfoKind.Descendent
>;
export type AdjacentSelectorInfo = BinarySelectorInfo<
  SelectorInfoKind.Adjacent
>;
export type SiblingSelectorInfo = BinarySelectorInfo<SelectorInfoKind.Sibling>;

export type SelectorInfo =
  | ListSelectorInfo
  | ElementSelectorInfo
  | AllSelectorInfo
  | PseudoElementSelectorInfo
  | PseudoParamElementSelectorInfo
  | AttributeSelectorInfo
  | NotSelectorInfo
  | IdSelectorInfo
  | ClassSelectorInfo
  | ComboSelectorInfo
  | ChildSelectorInfo
  | DescendentSelectorInfo
  | AdjacentSelectorInfo
  | SiblingSelectorInfo;

export type StyleDeclarationInfo = {
  sourceId: string;
  name: string;
  value: string;
  active: boolean;
};

export type MediaInfo = {
  conditionText: string;
  active: boolean;
};

export type StyleRuleInfo = {
  selectorText: string;
  inherited: boolean;
  selectorInfo: SelectorInfo;
  pseudoElementName?: string;
  sourceId: string;
  sourceUri: string;
  media?: MediaInfo;
  declarations: StyleDeclarationInfo[];
  specificity: number;
};

export type NodeStyleInspection = {
  styleRules: StyleRuleInfo[];
};
