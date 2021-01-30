import { SourceLocation } from "./base-ast";
import { Expression } from "./ast";

export type Sheet = {
  rules: Rule[];
  declarations: StyleDeclaration[];
};

export enum RuleKind {
  Style = "Style",
  Charset = "Charset",
  Namespace = "Namespace",
  Include = "Include",
  FontFace = "FontFace",
  Media = "Media",
  Mixin = "Mixin",
  Export = "Export",
  Supports = "Supports",
  Page = "Page",
  Document = "Document",
  Keyframes = "Keyframes",
  Keyframe = "Keyframe"
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
  selectors: Selector[];
} & BaseSelector<SelectorKind.Group>;

type ComboSelector = {
  selectors: Selector[];
} & BaseSelector<SelectorKind.Combo>;

type DescendentSelector = {
  ancestor: Selector;
  descendent: Selector;
} & BaseSelector<SelectorKind.Descendent>;

type PseudoElementSelector = {
  selector: string;
  target: Selector;
  name: string;
} & BaseSelector<SelectorKind.PseudoElement>;

type PseudoParamElementSelector = {
  target: Selector;
  name: string;
  param: string;
} & BaseSelector<SelectorKind.PseudoParamElement>;

type NotSelector = {
  selector: Selector;
} & BaseSelector<SelectorKind.Not>;

type ChildSelector = {
  parent: Selector;
  child: Selector;
} & BaseSelector<SelectorKind.Child>;

type AdjacentSelector = {
  selector: Selector;
  nextSiblingSelector: Selector;
} & BaseSelector<SelectorKind.Adjacent>;

type SiblingSelector = {
  selector: Selector;
  siblingSelector: Selector;
} & BaseSelector<SelectorKind.Sibling>;

type IdSelector = {
  id: string;
} & BaseSelector<SelectorKind.Id>;

type ElementSelector = {
  tagName: string;
} & BaseSelector<SelectorKind.Element>;

type AttributeSelector = {
  name: string;
  value?: string;
} & BaseSelector<SelectorKind.Attribute>;

type ClassSelector = {
  className: string;
} & BaseSelector<SelectorKind.Class>;

type AllSelector = BaseSelector<SelectorKind.AllSelector>;

export type Selector =
  | GroupSelector
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
  | AllSelector;

export enum StyleDeclarationKind {
  KeyValue = "KeyValue",
  Include = "Include",
  Media = "Media",
  Content = "Content"
}

type BaseStyleDeclaration<TKind extends StyleDeclarationKind> = {
  declarationKind: TKind;
};

export type KeyValueDeclaration = {
  name: string;
  value: string;
  location: SourceLocation;
  nameLocation: SourceLocation;
  valueLocation: SourceLocation;
} & BaseStyleDeclaration<StyleDeclarationKind.KeyValue>;

export type MediaDeclaration = ConditionShape &
  BaseStyleDeclaration<StyleDeclarationKind.Media>;

export type Include = BaseInclude &
  BaseStyleDeclaration<StyleDeclarationKind.Include>;

export type IncludeReference = {
  parts: IncludePart[];
  location: SourceLocation;
};

export type IncludePart = {
  name: string;
  location: SourceLocation;
};

export type StyleDeclaration = KeyValueDeclaration | Include | MediaDeclaration;

export type StyleRule = {
  location: SourceLocation;
  selector: Selector;
  declarations: StyleDeclaration[];
  children: StyleRule[];
} & BaseRule<RuleKind.Style>;

/*

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct KeyframeRule {
  pub key: String,
  pub declarations: Vec<Declaration>,
  pub location: Location,
}
*/

export type KeyframeRule = {
  key: string;
  declarations: StyleDeclaration[];
  location: SourceLocation;
} & BaseRule<RuleKind.Keyframe>;

/*

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct KeyframesRule {
  pub name: String,
  pub rules: Vec<KeyframeRule>,
  pub location: Location,
}*/

export type KeyframesRule = {
  name: string;
  rules: KeyframeRule[];
  location: SourceLocation;
} & BaseRule<RuleKind.Keyframes>;

type ConditionShape = {
  name: string;
  condition_text: string;
  rules: StyleRule[];
  location: SourceLocation;
  declarations: StyleDeclaration[];
};

type BaseConditionRule<TRule extends RuleKind> = ConditionShape &
  BaseRule<TRule>;

type MediaRule = BaseConditionRule<RuleKind.Media>;
type BaseInclude = {
  mixinName: IncludeReference;
  location: SourceLocation;
  declarations: StyleDeclaration[];
  rules: StyleRule[];
};

type IncludeRule = BaseInclude & BaseRule<RuleKind.Include>;

export type MixinRule = {
  name: MixinName;
  declarations: StyleDeclaration[];
  location: SourceLocation;
} & BaseRule<RuleKind.Mixin>;

export type MixinName = {
  value: string;
  location: SourceLocation;
};

export type ExportRule = {
  rules: Rule[];
  location: SourceLocation;
} & BaseRule<RuleKind.Export>;

export type ConditionRule = MediaRule;
export type Rule =
  | StyleRule
  | ConditionRule
  | MixinRule
  | ExportRule
  | IncludeRule
  | KeyframesRule
  | KeyframeRule;

export type StyleExpression =
  | Rule
  | Include
  | MixinName
  | IncludePart
  | IncludeReference;

export const getSheetClassNames = (
  sheet: Sheet,
  allClassNames: string[] = []
) => {
  return getRulesClassNames(sheet.rules, allClassNames);
};

const getRulesClassNames = (rules: Rule[], allClassNames: string[] = []) => {
  for (const rule of rules) {
    getRuleClassNames(rule, allClassNames);
  }
  return allClassNames;
};

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
};

export const traverseSheet = (
  sheet: Sheet,
  each: (rule: StyleExpression) => void
) => {
  return traverseStyleExpressions(sheet.rules, each);
};

const traverseStyleExpressions = (
  rules: StyleExpression[],
  each: (rule: StyleExpression) => void | boolean
) => {
  for (const rule of rules) {
    if (!traverseStyleExpression(rule, each)) {
      return false;
    }
  }
  return true;
};

export const isRule = (expression: StyleExpression): expression is Rule => {
  return RuleKind[(expression as Rule).kind] != null;
};
export const isStyleDeclaration = (
  expression: Expression
): expression is StyleDeclaration => {
  return (
    StyleDeclarationKind[(expression as StyleDeclaration).declarationKind] !=
    null
  );
};

export const isIncludePart = (
  expression: Expression
): expression is IncludePart => {
  return (expression as any).name != null;
};

export const traverseStyleExpression = (
  rule: StyleExpression,
  each: (rule: StyleExpression) => void | boolean
) => {
  if (each(rule) === false) {
    return false;
  }
  if (isRule(rule)) {
    switch (rule.kind) {
      case RuleKind.Media: {
        return traverseStyleExpressions(rule.rules, each);
      }
      case RuleKind.Export: {
        return traverseStyleExpressions(rule.rules, each);
      }
      case RuleKind.Style: {
        return (
          traverseStyleExpressions(rule.declarations, each) &&
          traverseStyleExpressions(rule.children, each)
        );
      }
      case RuleKind.Mixin: {
        return traverseStyleExpressions(rule.declarations, each);
      }
    }
  } else if (isStyleDeclaration(rule)) {
    switch (rule.declarationKind) {
      case StyleDeclarationKind.Include: {
        for (const part of rule.mixinName.parts) {
          if (!traverseStyleExpression(part, each)) {
            return false;
          }
        }
        return true;
      }
    }
  }

  return true;
};

export const getSelectorClassNames = (
  selector: Selector,
  allClassNames: string[] = []
) => {
  switch (selector.kind) {
    case SelectorKind.Combo:
    case SelectorKind.Group: {
      for (const child of selector.selectors) {
        getSelectorClassNames(child, allClassNames);
      }
      break;
    }
    case SelectorKind.Descendent: {
      getSelectorClassNames(selector.ancestor, allClassNames);
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
};
