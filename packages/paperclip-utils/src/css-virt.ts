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

export const getAllVirtSheetClassNames = (
  sheets: Record<string, VirtSheet>,
  allClassNames: string[] = []
) => {
  for (const uri in sheets) {
    getAllVirtRuleClassNames(sheets[uri].rules, allClassNames);
  }
  return allClassNames;
};

const getAllVirtRuleClassNames = (
  rules: VirtRule[],
  allClassNames: string[]
) => {
  for (const rule of rules) {
    getAllVirtRuleClassNames2(rule, allClassNames);
  }
  return allClassNames;
};

const getAllVirtRuleClassNames2 = (rule: VirtRule, allClassNames: string[]) => {
  switch (rule.kind) {
    case VirtRuleKind.Media: {
      getAllVirtRuleClassNames(rule.rules, allClassNames);
      break;
    }
    case VirtRuleKind.Style: {
      const classNames = (
        rule.selector_text.match(/\.[^\s:\[~>+,\.]+/g) || []
      ).map(str => str.substr(1));
      for (const className of classNames) {
        if (allClassNames.indexOf(className) === -1) {
          allClassNames.push(className);
        }
      }
      break;
    }
  }
  return allClassNames;
};
