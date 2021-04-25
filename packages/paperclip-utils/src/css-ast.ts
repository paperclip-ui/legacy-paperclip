import { SourceLocation } from "./base-ast";
import { BasicRaws, Expression } from "./ast";

export type Sheet = {
  rules: Rule[];
  raws: BasicRaws;
  declarations: StyleDeclaration[];
};

export enum RuleKind {
  Style = "Style",
  Charset = "Charset",
  Namespace = "Namespace",
  Include = "Include",
  Comment = "Comment",
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
  ruleKind: TKind;
  location: SourceLocation;
};

export enum SelectorKind {
  Group = "Group",
  Combo = "Combo",
  Descendent = "Descendent",
  Within = "Within",
  Prefixed = "Prefixed",
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
  selectorKind: TKind;
  location: SourceLocation;
};

type GroupSelector = {
  selectors: Selector[];
} & BaseSelector<SelectorKind.Group>;

type WithinSelector = {
  selectors: Selector;
} & BaseSelector<SelectorKind.Within>;

type PrefixedSelector = {
  connector: string;
  postfixSelector?: Selector;
} & BaseSelector<SelectorKind.Prefixed>;

type ComboSelector = {
  selectors: Selector[];
} & BaseSelector<SelectorKind.Combo>;

type DescendentSelector = {
  ancestor: Selector;
  descendent: Selector;
} & BaseSelector<SelectorKind.Descendent>;

type PseudoElementSelector = {
  separator: string;
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
  operator?: string;
  name: string;
  value?: string;
} & BaseSelector<SelectorKind.Attribute>;

type ClassSelector = {
  className: string;
} & BaseSelector<SelectorKind.Class>;

type AllSelector = BaseSelector<SelectorKind.AllSelector>;

export type Selector =
  | GroupSelector
  | WithinSelector
  | PrefixedSelector
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
  location: SourceLocation;
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
export type Content = BaseStyleDeclaration<StyleDeclarationKind.Content>;

export type IncludeReference = {
  parts: IncludePart[];
  location: SourceLocation;
};

export type IncludePart = {
  name: string;
  location: SourceLocation;
};

export type StyleDeclaration =
  | KeyValueDeclaration
  | Include
  | MediaDeclaration
  | Content;

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
  conditionText: string;
  rules: ChildRule[];
  location: SourceLocation;
  declarations: StyleDeclaration[];
};

type BaseConditionRule<TRule extends RuleKind> = ConditionShape &
  BaseRule<TRule>;

type MediaRule = BaseConditionRule<RuleKind.Media>;
export type CommentRule = {
  value: string;
} & BaseRule<RuleKind.Comment>;
type FontFaceRule = {
  declarations: StyleDeclaration[];
} & BaseRule<RuleKind.FontFace>;
type CharsetRule = {} & BaseRule<RuleKind.Charset>;

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
export type ChildRule = any;
export type Rule =
  | StyleRule
  | ConditionRule
  | MixinRule
  | ExportRule
  | CharsetRule
  | CommentRule
  | MediaRule
  | FontFaceRule
  | IncludeRule
  | KeyframesRule
  | KeyframeRule;

export type StyleExpression =
  | Rule
  | Include
  | MixinName
  | IncludePart
  | IncludeReference
  | StyleDeclaration
  | Selector;

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
  switch (rule.ruleKind) {
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
  return RuleKind[(expression as Rule).ruleKind] != null;
};
export const isStyleDeclaration = (
  expression: Expression
): expression is StyleDeclaration => {
  return (
    StyleDeclarationKind[(expression as StyleDeclaration).declarationKind] !=
    null
  );
};

export const isMaybeStyleSheet = (expression): expression is Sheet =>
  expression.rules != null &&
  expression.rules != null &&
  expression.raws != null;

export const isStyleObject = (expression): expression is StyleExpression => {
  return (
    expression.rules != null ||
    isStyleDeclaration(expression) ||
    isRule(expression) ||
    isStyleSelector(expression)
  );
};

export const isStyleSelector = (expression): expression is Selector => {
  return SelectorKind[(expression as Selector).selectorKind] != null;
};

export const isSelector = (expression): expression is Selector => {
  return SelectorKind[expression.kind] != null;
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
    switch (rule.ruleKind) {
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
  switch (selector.selectorKind) {
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
