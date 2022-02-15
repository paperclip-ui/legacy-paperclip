import { BasicRaws, StringRange } from "../base/ast";
import { Expression } from "../html/ast";

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
  Keyframe = "Keyframe",
}

type BaseRule<TKind extends RuleKind> = {
  id: string;
  ruleKind: TKind;
  range: StringRange;
};

export enum SelectorKind {
  Group = "Group",
  Combo = "Combo",
  Descendent = "Descendent",
  This = "This",
  Within = "Within",
  Global = "Global",
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
  AllSelector = "AllSelector",
}

export type BaseSelector<TKind extends SelectorKind> = {
  id: string;
  selectorKind: TKind;
  range: StringRange;
};

type GroupSelector = {
  selectors: Selector[];
} & BaseSelector<SelectorKind.Group>;

type WithinSelector = {
  selector: Selector;
} & BaseSelector<SelectorKind.Within>;

type GlobalSelector = {
  selector: Selector;
} & BaseSelector<SelectorKind.Global>;

type SelfSelector = {
  selector: Selector;
} & BaseSelector<SelectorKind.This>;

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
  | GlobalSelector
  | PrefixedSelector
  | ComboSelector
  | DescendentSelector
  | SelfSelector
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
  Content = "Content",
}

type BaseStyleDeclaration<TKind extends StyleDeclarationKind> = {
  id: string;
  declarationKind: TKind;
  range: StringRange;
};

export type KeyValueDeclaration = {
  name: string;
  value: string;
  range: StringRange;
  nameRange: StringRange;
  valueRange: StringRange;
  raws: BasicRaws;
} & BaseStyleDeclaration<StyleDeclarationKind.KeyValue>;

export type MediaDeclaration = ConditionShape &
  BaseStyleDeclaration<StyleDeclarationKind.Media>;

export type Include = BaseInclude &
  BaseStyleDeclaration<StyleDeclarationKind.Include>;
export type Content = {
  raws: BasicRaws;
} & BaseStyleDeclaration<StyleDeclarationKind.Content>;

export type IncludeReference = {
  id: string;
  parts: IncludePart[];
  range: StringRange;
};

export type IncludePart = {
  id: string;
  name: string;
  range: StringRange;
};

export type StyleDeclaration =
  | KeyValueDeclaration
  | Include
  | MediaDeclaration
  | Content;

export type StyleRule = {
  range: StringRange;
  selector: Selector;
  declarations: StyleDeclaration[];
  children: StyleRule[];
  raws: BasicRaws;
} & BaseRule<RuleKind.Style>;

/*

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct KeyframeRule {
  pub key: String,
  pub declarations: Vec<Declaration>,
  pub range: StringRange,
}
*/

export type KeyframeRule = {
  key: string;
  raws: BasicRaws;
  declarations: StyleDeclaration[];
  range: StringRange;
} & BaseRule<RuleKind.Keyframe>;

/*

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct KeyframesRule {
  pub name: String,
  pub rules: Vec<KeyframeRule>,
  pub range: StringRange,
}*/

export type KeyframesRule = {
  name: string;
  rules: KeyframeRule[];
  raws: BasicRaws;
  range: StringRange;
} & BaseRule<RuleKind.Keyframes>;

type ConditionShape = {
  name: string;
  conditionText: string;
  rules: ChildRule[];
  raws: BasicRaws;
  range: StringRange;
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
  raws: BasicRaws;
} & BaseRule<RuleKind.FontFace>;
type CharsetRule = {
  value: string;
  raws: BasicRaws;
} & BaseRule<RuleKind.Charset>;

type BaseInclude = {
  mixinName: IncludeReference;
  range: StringRange;
  declarations: StyleDeclaration[];
  rules: StyleRule[];
  raws: BasicRaws;
};

type IncludeRule = BaseInclude & BaseRule<RuleKind.Include>;

export type MixinRule = {
  name: MixinName;
  raws: BasicRaws;
  declarations: StyleDeclaration[];
  range: StringRange;
  rules: StyleRule[];
} & BaseRule<RuleKind.Mixin>;

export type MixinName = {
  id: string;
  value: string;
  range: StringRange;
};

export type ExportRule = {
  rules: Rule[];
  range: StringRange;
  raws: BasicRaws;
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
  owner: Expression,
  each: (rule: StyleExpression, parent: Expression) => void
) => {
  return (
    traverseStyleExpressions(sheet.declarations, owner, each) &&
    traverseStyleExpressions(sheet.rules, owner, each)
  );
};

type TraverseEach = (
  rule: StyleExpression,
  parent: Expression
) => void | boolean;

const traverseChildren =
  (
    traverse: (
      rule: StyleExpression,
      owner: Expression,
      each: TraverseEach
    ) => boolean
  ) =>
  (rules: StyleExpression[], owner: Expression, each: TraverseEach) => {
    for (const rule of rules) {
      if (!traverse(rule, owner, each)) {
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
  owner: Expression,
  each: (rule: StyleExpression, parent: Expression) => void | boolean
) => {
  if (each(rule, owner) === false) {
    return false;
  }
  if (isRule(rule)) {
    switch (rule.ruleKind) {
      case RuleKind.Media: {
        return traverseChildren(traverseStyleExpression)(
          rule.rules,
          rule,
          each
        );
      }
      case RuleKind.Export: {
        return traverseStyleExpressions(rule.rules, rule, each);
      }
      case RuleKind.Style: {
        return traverseStyleRule(rule, each);
      }
      case RuleKind.Mixin: {
        return traverseStyleExpressions(rule.declarations, rule, each);
      }
      case RuleKind.Keyframes: {
        return traverseChildren((child: KeyframeRule) => {
          return traverseStyleExpressions(child.declarations, child, each);
        })(rule.rules, rule, each);
      }
    }
  } else if (isStyleDeclaration(rule)) {
    switch (rule.declarationKind) {
      case StyleDeclarationKind.Include: {
        each(rule.mixinName, rule);
        for (const part of rule.mixinName.parts) {
          if (!traverseStyleExpression(part, rule.mixinName, each)) {
            return false;
          }
        }
        return true;
      }
    }
  }

  return true;
};

const traverseStyleExpressions = traverseChildren(traverseStyleExpression);

const traverseStyleRule = (
  rule: StyleRule,
  each: (rule: StyleExpression, parent: Expression) => void | boolean
) =>
  traverseStyleExpressions(rule.declarations, rule, each) &&
  traverseChildren(traverseStyleExpression)(rule.children, rule, each);

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
