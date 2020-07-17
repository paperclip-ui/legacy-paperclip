export type VirtSheet = {
  rules: VirtRule[];
};

export enum VirtRuleKind {
  Style = "Style",
  Media = "Media"
}

export type BaseVirtRule<TKind extends VirtRuleKind> = {
  kind: TKind;
};

export type VirtStyleRule = {
  selector_text: string;
} & BaseVirtRule<VirtRuleKind.Style>;

export type MediaRule = {
  rules: VirtRule[];
} & BaseVirtRule<VirtRuleKind.Media>;

export type VirtRule = VirtStyleRule | MediaRule;
