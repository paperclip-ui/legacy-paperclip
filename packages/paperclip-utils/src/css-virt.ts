export type VirtSheet = {
  rules: VirtRule[];
};

export enum VirtRuleKind {
  Style = "Style",
  Media = "Media",
  FontFace = "FontFace"
}

export type BaseVirtRule<TKind extends VirtRuleKind> = {
  kind: TKind;
};

export type VirtDeclaration = {
  name: string;
  value: string;
  sourceId: string;
};

export type VirtFontFace = {
  style: VirtDeclaration[];
} & BaseVirtRule<VirtRuleKind.Style>;

export type VirtStyleRule = {
  selectorText: string;
  style: VirtDeclaration[];
} & BaseVirtRule<VirtRuleKind.FontFace>;

export type MediaRule = {
  rules: VirtRule[];
} & BaseVirtRule<VirtRuleKind.Media>;

export type VirtRule = VirtStyleRule | MediaRule | VirtStyleRule;
