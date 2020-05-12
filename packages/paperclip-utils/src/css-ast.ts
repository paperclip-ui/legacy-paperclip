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

type GroupSelector = {
  selectors: Selector[]
} & BaseSelector<SelectorKind.Group>;

type ComboSelector = {
  selectors: Selector[]
} & BaseSelector<SelectorKind.Combo>;

type DescendentSelector = {
  parent: Selector,
  descendent: Selector
} & BaseSelector<SelectorKind.Descendent>;

type PseudoElementSelector = {
  selector: string,
  target: Selector,
  name: string
} & BaseSelector<SelectorKind.PseudoElement>;

type PseudoParamElementSelector = {
  target: Selector,
  name: string,
  param: string
} & BaseSelector<SelectorKind.PseudoParamElement>;

type NotSelector = {
  selector: Selector
} & BaseSelector<SelectorKind.Not>;

type ChildSelector = {
  parent: Selector,
  child: Selector
} & BaseSelector<SelectorKind.Child>;

type AdjacentSelector = {
  selector: Selector,
  nextSiblingSelector: Selector
} & BaseSelector<SelectorKind.Adjacent>;

type SiblingSelector = {
  selector: Selector,
  siblingSelector: Selector
} & BaseSelector<SelectorKind.Sibling>;

type IdSelector = {
  id: string;
} & BaseSelector<SelectorKind.Id>;

type ElementSelector = {
  tagName: string
} & BaseSelector<SelectorKind.Element>;

type AttributeSelector = {
  name: string,
  value?: string
} & BaseSelector<SelectorKind.Attribute>;

type ClassSelector = {
  className: string
} & BaseSelector<SelectorKind.Class>;

type AllSelector = BaseSelector<SelectorKind.AllSelector>;


export type Selector = 
GroupSelector
| ComboSelector
| DescendentSelector
| PseudoElementSelector
| PseudoParamElementSelector
| NotSelector
| ChildSelector
| AdjacentSelector
| SiblingSelector
| IdSelector
| ElementSelector
| AttributeSelector
| ClassSelector
| AllSelector

type StyleDeclaration = {
  name: string;
  value: string;
  location: SourceLocation;
  nameLocation: SourceLocation;
  valueLocation: SourceLocation;
};

export type StyleRule = {
  selector: Selector;
  style: StyleDeclaration[];
} & BaseRule<RuleKind.Style>;

type BaseConditionRule<TRule extends RuleKind> = {
  name: string,
  condition_text: string,
  rules: StyleRule[]
} & BaseRule<TRule>;

type MediaRule = BaseConditionRule<RuleKind.Media>;

export type ConditionRule = MediaRule;
export type Rule = StyleRule | ConditionRule;

export const getSheetClassNames = (sheet: Sheet, allClassNames: string[] = []) => {
  return getRulesClassNames(sheet.rules, allClassNames);
}

const getRulesClassNames = (rules: Rule[], allClassNames: string[] = []) => {
  for (const rule of rules) {
    getRuleClassNames(rule, allClassNames);
  }
  return allClassNames;
}

export const getRuleClassNames = (rule: Rule, allClassNames: string[] = []) => {
  switch (rule.kind) {
    case RuleKind.Media: {
      getRulesClassNames(rule.rules, allClassNames);
      break;
    }
    case RuleKind.Style: {
      getSelectorClassNames(rule.selector, allClassNames);
      break;
    }
  }

  return allClassNames;
}

export const getSelectorClassNames = (selector: Selector, allClassNames: string[] = []) => {
  switch(selector.kind) {
    case SelectorKind.Combo: 
    case SelectorKind.Group: {
      for (const child of selector.selectors) {
        getSelectorClassNames(child, allClassNames);
      }
      break;
    }
    case SelectorKind.Descendent: {
      getSelectorClassNames(selector.parent, allClassNames);
      getSelectorClassNames(selector.descendent, allClassNames);
      break;
    }
    case SelectorKind.PseudoElement: {
      getSelectorClassNames(selector.target, allClassNames);
      break;
    }
    case SelectorKind.PseudoParamElement: {
      getSelectorClassNames(selector.target, allClassNames);
      break;
    }
    case SelectorKind.Not: {
      getSelectorClassNames(selector.selector, allClassNames);
      break;
    }
    case SelectorKind.Child: {
      getSelectorClassNames(selector.parent, allClassNames);
      getSelectorClassNames(selector.child, allClassNames);
      break;
    }
    case SelectorKind.Adjacent: {
      getSelectorClassNames(selector.selector, allClassNames);
      getSelectorClassNames(selector.nextSiblingSelector, allClassNames);
      break;
    }
    case SelectorKind.Sibling: {
      getSelectorClassNames(selector.selector, allClassNames);
      getSelectorClassNames(selector.siblingSelector, allClassNames);
      break;
    }
    case SelectorKind.Class: {
      allClassNames.push(selector.className);
      break;
    }
  }

  return allClassNames;
}