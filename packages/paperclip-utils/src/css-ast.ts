import { SourceLocation } from "./base-ast";

export type Sheet = {
  rules: Rule[];
};

export enum RuleKind {
  Style = "Style",
  Charset = "Charset",
  Namespace = "Namespace",
  FontFace = "FontFace",
  Media = "Media",
  Supports = "Supports",
  Page = "Page",
  Document = "Document",
  Keyframes = "Keyframes"
}

type BaseRule<TKind extends RuleKind> = {
  kind: TKind;
};

export enum SelectorKind {
  Group = "Group",
  Combo = "Combo",
  Descendent = "Descendent",
  PseudoElement = "PseudoElement",
  PseudoParamElement = "PseudoParamElement",
  Not = "Not",
  Child = "Child",
  Adjacent = "Adjacent",
  Sibling = "Sibling",
  Id = "Id",
  Element = "Element",
  Attribute = "Attribute",
  Class = "Class",
  AllSelector = "AllSelector"
}

export type BaseSelector<TKind extends SelectorKind> = {
  kind: TKind;
};

type IdSelector = {
  id: string;
} & BaseSelector<SelectorKind.Id>;

export type Selector = IdSelector;

type StyleDeclaration = {
  name: string;
  value: string;
  location: SourceLocation;
  nameLocation: SourceLocation;
  valueLocation: SourceLocation;
};

type StyleRule = {
  selector: Selector;
  declarations: StyleDeclaration[];
} & BaseRule<RuleKind.Style>;

export type Rule = StyleRule;
