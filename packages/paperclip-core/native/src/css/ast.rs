use crate::base::ast::{BasicRaws, Range};
use crate::core::ast as core_ast;
use crate::core::ast::{Expr, ExprVisitor};
use crate::pc::ast as pc_ast;
use serde::Serialize;
use std::fmt;

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "declarationKind")]
pub enum Declaration {
  KeyValue(KeyValueDeclaration),
  Include(Include),
  Content(Content),
  Media(ConditionRule),
}

impl Declaration {
  pub fn get_range(&self) -> &Range {
    match self {
      Declaration::KeyValue(kv) => &kv.range,
      Declaration::Include(kv) => &kv.range,
      Declaration::Content(kv) => &kv.range,
      Declaration::Media(kv) => &kv.range,
    }
  }
}

impl Expr for Declaration {
  fn walk<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    visitor.visit_css_decl(self);
  }

  fn get_id<'a>(&'a self) -> &'a String {
    match self {
      Declaration::KeyValue(kv) => &kv.id,
      Declaration::Include(kv) => &kv.id,
      Declaration::Content(kv) => &kv.id,
      Declaration::Media(kv) => &kv.id,
    }
  }

  fn wrap<'a>(&'a self) -> pc_ast::Expression<'a> {
    return pc_ast::Expression::CSS(Expression::Declaration(self));
  }
}

impl fmt::Display for Declaration {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Declaration::KeyValue(kv) => kv.fmt(f),
      Declaration::Include(inc) => inc.fmt(f),
      Declaration::Media(media) => media.fmt(f),
      Declaration::Content(_) => writeln!(f, "@content;"),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "cssObjectKind")]
pub enum Expression<'a> {
  Declaration(&'a Declaration),
  Rule(&'a Rule),
  StyleRule(&'a StyleRule),
  Sheet(&'a Sheet),
}

impl<'a> Expression<'a> {
  pub fn get_id(&self) -> &String {
    match self {
      Expression::Declaration(decl) => decl.get_id(),
      Expression::Rule(rule) => rule.get_id(),
      Expression::Sheet(rule) => &rule.id,
      Expression::StyleRule(rule) => &rule.id,
    }
  }
  pub fn get_range(&self) -> &Range {
    match self {
      Expression::Declaration(decl) => decl.get_range(),
      Expression::Rule(rule) => rule.get_range(),
      Expression::Sheet(rule) => &rule.range,
      Expression::StyleRule(rule) => &rule.range,
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct KeyValueDeclaration {
  pub id: String,
  pub name: String,
  pub value: String,
  pub range: Range,
  pub raws: BasicRaws,

  #[serde(rename = "nameRange")]
  pub name_range: Range,

  #[serde(rename = "valueRange")]
  pub value_range: Range,
}

impl fmt::Display for KeyValueDeclaration {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "{}:{};", &self.name, &self.value)?;
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Content {
  pub id: String,
  pub raws: BasicRaws,
  pub range: Range,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Include {
  pub id: String,
  #[serde(rename = "mixinName")]
  pub mixin_name: IncludeReference,
  pub declarations: Vec<Declaration>,
  pub rules: Vec<Rule>,
  pub range: Range,
  pub raws: BasicRaws,
}

impl Include {
  // pub fn get_object_by_id<'a>(&'a self, id: &String) -> Option<Expression<'a>> {
  //   get_object_by_id_in_style_rules_or_declarations(&self.rules, &self.declarations, id)
  // }
  pub fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    walk_exprs(&self.rules, visitor);
    walk_exprs(&self.declarations, visitor);
  }
}

impl fmt::Display for Include {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "@include {}", &self.mixin_name)?;

    if (self.rules.len() > 0 || self.declarations.len() > 0) {
      writeln!(f, "{{")?;

      for decl in &self.declarations {
        writeln!(f, "{}", decl.to_string());
      }

      for rule in &self.rules {
        writeln!(f, "{}", rule.to_string());
      }
      writeln!(f, "}}")?;
    } else {
      writeln!(f, ";");
    }
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct IncludeReference {
  pub id: String,
  pub parts: Vec<IncludeReferencePart>,
  pub range: Range,
}

impl fmt::Display for IncludeReference {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(
      f,
      "{}",
      self
        .parts
        .iter()
        .map(|part| part.name.to_string())
        .collect::<Vec<String>>()
        .join(".")
    );
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct IncludeReferencePart {
  pub id: String,
  pub name: String,
  pub range: Range,
}

impl fmt::Display for IncludeReferencePart {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "{}", &self.name)?;
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct CharsetRule {
  pub id: String,
  pub raws: BasicRaws,
  pub value: String,
  pub range: Range,
}

impl fmt::Display for CharsetRule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "charset \"{}\";", &self.value)?;
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "ruleKind")]
pub enum Rule {
  Style(StyleRule),
  Comment(Comment),
  Charset(CharsetRule),
  // Namespace(String),
  FontFace(FontFaceRule),
  Media(ConditionRule),
  Export(ExportRule),
  Mixin(MixinRule),
  Include(Include),
  Supports(ConditionRule),
  Page(ConditionRule),
  Document(ConditionRule),
  Keyframes(KeyframesRule),
}

impl Rule {
  pub fn get_range(&self) -> &Range {
    match self {
      Rule::Comment(rule) => &rule.range,
      Rule::Style(rule) => &rule.range,
      Rule::Charset(value) => &value.range,
      Rule::Export(export) => &export.range,
      Rule::FontFace(rule) => &rule.range,
      Rule::Media(rule) => &rule.range,
      Rule::Mixin(rule) => &rule.range,
      Rule::Include(rule) => &rule.range,
      Rule::Supports(value) => &value.range,
      Rule::Keyframes(rule) => &rule.range,
      Rule::Document(rule) => &rule.range,
      Rule::Page(rule) => &rule.range,
    }
  }
}

impl Expr for Rule {
  fn walk<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    visitor.visit_css_rule(self);
    if !visitor.should_continue() {
      return;
    }

    match self {
      Rule::Style(rule) => rule.walk_inside(visitor),
      Rule::Export(rule) => rule.walk_inside(visitor),
      Rule::Media(rule) => rule.walk_inside(visitor),
      Rule::Mixin(rule) => rule.walk_inside(visitor),
      Rule::Include(rule) => rule.walk_inside(visitor),
      _ => {}
    }
  }
  fn get_id(&self) -> &String {
    match self {
      Rule::Comment(rule) => &rule.id,
      Rule::Style(rule) => &rule.id,
      Rule::Charset(value) => &value.id,
      Rule::Export(export) => &export.id,
      Rule::FontFace(rule) => &rule.id,
      Rule::Media(rule) => &rule.id,
      Rule::Mixin(rule) => &rule.id,
      Rule::Include(rule) => &rule.id,
      // Rule::Namespace(value) => &value,
      Rule::Supports(value) => &value.id,
      Rule::Keyframes(rule) => &rule.id,
      Rule::Document(rule) => &rule.id,
      Rule::Page(rule) => &rule.id,
    }
  }
  fn wrap<'a>(&'a self) -> pc_ast::Expression<'a> {
    pc_ast::Expression::CSS(Expression::Rule(self))
  }
}

impl fmt::Display for Rule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Rule::Comment(rule) => write!(f, "{}", rule.to_string()),
      Rule::Style(rule) => write!(f, "{}", rule.to_string()),
      Rule::Charset(value) => write!(f, "@charset {}", value),
      Rule::Export(export) => write!(f, "{}", export),
      // Rule::Namespace(value) => write!(f, "@namespace {}", value),
      Rule::FontFace(rule) => write!(f, "{}", rule.to_string()),
      Rule::Media(rule) => write!(f, "{}", rule.to_string()),
      Rule::Mixin(rule) => write!(f, "{}", rule.to_string()),
      Rule::Include(rule) => write!(f, "{}", rule.to_string()),
      Rule::Supports(rule) => write!(f, "{}", rule.to_string()),
      Rule::Keyframes(rule) => write!(f, "{}", rule.to_string()),
      Rule::Document(rule) => write!(f, "{}", rule.to_string()),
      Rule::Page(rule) => write!(f, "{}", rule.to_string()),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Comment {
  pub id: String,
  pub value: String,
  pub range: Range,
}

impl fmt::Display for Comment {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "/*{}*/", self.value)
  }
}

impl BasicRaws {
  pub fn new(before: Option<&[u8]>, after: Option<&[u8]>) -> BasicRaws {
    BasicRaws {
      before: if let Some(v) = before {
        std::str::from_utf8(v).unwrap().to_string()
      } else {
        "".to_string()
      },
      after: if let Some(v) = after {
        std::str::from_utf8(v).unwrap().to_string()
      } else {
        "".to_string()
      },
    }
  }
}
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleRule {
  pub id: String,
  pub selector: Selector,
  pub declarations: Vec<Declaration>,
  pub children: Vec<Rule>,
  pub range: Range,
  pub raws: BasicRaws,
}

impl StyleRule {
  pub fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    walk_exprs(&self.children, visitor);
    walk_exprs(&self.declarations, visitor);
  }
}

impl fmt::Display for StyleRule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "{} {{", &self.selector)?;
    for decl in &self.declarations {
      write!(f, "  {}", &decl.to_string())?;
    }
    writeln!(f, "}}")?;

    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ChildRuleSelector {
  pub id: String,
  pub connector: String,
  pub selector: Option<Selector>,
  pub range: Range,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ChildStyleRule {
  pub id: String,
  pub selectors: Vec<ChildRuleSelector>,
  pub declarations: Vec<Declaration>,
  pub children: Vec<ChildStyleRule>,
  pub range: Range,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct FontFaceRule {
  pub id: String,
  pub declarations: Vec<Declaration>,
  pub raws: BasicRaws,
  pub range: Range,
}

impl fmt::Display for FontFaceRule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "@font-family {{")?;
    for decl in &self.declarations {
      write!(f, "  {}", &decl.to_string())?;
    }
    writeln!(f, "}}")?;

    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ExportRule {
  pub id: String,
  pub rules: Vec<Rule>,
  pub range: Range,
  pub raws: BasicRaws,
}

impl fmt::Display for ExportRule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "@export  {{")?;
    for rule in &self.rules {
      rule.fmt(f);
    }
    writeln!(f, "}}")?;

    Ok(())
  }
}

impl ExportRule {
  pub fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    walk_exprs(&self.rules, visitor);
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ConditionRule {
  pub id: String,
  pub name: String,

  #[serde(rename = "conditionText")]
  pub condition_text: String,
  pub rules: Vec<Rule>,
  pub declarations: Vec<Declaration>,
  pub range: Range,
  pub raws: BasicRaws,
}

impl ConditionRule {
  // pub fn get_object_by_id<'a>(&'a self, id: &String) -> Option<Expression<'a>> {
  //   get_object_by_id_in_style_rules_or_declarations(&self.rules, &self.declarations, id)
  // }

  pub fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    walk_exprs(&self.rules, visitor);
    walk_exprs(&self.declarations, visitor);
  }
}

impl fmt::Display for ConditionRule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "@{} {} {{", &self.name, &self.condition_text)?;
    for rule in &self.rules {
      write!(f, "{}\n", &rule.to_string())?;
    }
    writeln!(f, "}}")?;

    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct MixinRule {
  pub id: String,
  pub name: core_ast::StringLiteral,
  pub raws: BasicRaws,
  pub range: Range,
  pub declarations: Vec<Declaration>,
  pub rules: Vec<Rule>,
}

impl fmt::Display for MixinRule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "@mixin {} {{", &self.name.value)?;
    for decl in &self.declarations {
      write!(f, "{}\n", &decl.to_string())?;
    }
    for rule in &self.rules {
      write!(f, "{}\n", &rule.to_string())?;
    }
    writeln!(f, "}}")?;

    Ok(())
  }
}

impl MixinRule {
  pub fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    walk_exprs(&self.rules, visitor);
    walk_exprs(&self.declarations, visitor);
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct KeyframesRule {
  pub id: String,
  pub name: String,
  pub rules: Vec<KeyframeRule>,
  pub range: Range,
  pub raws: BasicRaws,
}

impl fmt::Display for KeyframesRule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "@keyframes {} {{", &self.name)?;
    for rule in &self.rules {
      write!(f, "{}\n", &rule.to_string())?;
    }
    writeln!(f, "}}")?;

    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct KeyframeRule {
  pub id: String,
  pub key: String,
  pub raws: BasicRaws,
  pub declarations: Vec<Declaration>,
  pub range: Range,
}

impl fmt::Display for KeyframeRule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "{} {{", &self.key)?;
    for decl in &self.declarations {
      write!(f, " {}", &decl.to_string())?;
    }
    writeln!(f, "}}")?;

    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "selectorKind")]
pub enum Selector {
  Group(GroupSelector),
  Prefixed(PrefixedSelector),
  Combo(ComboSelector),
  Descendent(DescendentSelector),
  PseudoElement(PseudoElementSelector),
  PseudoParamElement(PseudoParamElementSelector),
  SubElement(SubElementSelector),
  Not(NotSelector),
  Global(GlobalSelector),
  This(SelfSelector),
  Within(WithinSelector),
  Child(ChildSelector),
  Adjacent(AdjacentSelector),
  Sibling(SiblingSelector),
  Id(IdSelector),
  Element(ElementSelector),
  Attribute(AttributeSelector),
  Class(ClassSelector),
  AllSelector(AllSelector),
}

impl Selector {
  pub fn last(&self) -> &Selector {
    let mut curr: &Selector = self;
    loop {
      match curr {
        Selector::Group(selector) => {
          curr = selector.selectors.last().unwrap();
        }
        Selector::Combo(selector) => {
          curr = selector.selectors.last().unwrap();
        }
        Selector::Prefixed(selector) => {
          if let Some(postfix) = &selector.postfix_selector {
            curr = postfix.as_ref();
          } else {
            return curr;
          }
        }
        Selector::Element(selector) => {
          return curr;
        }
        Selector::Descendent(selector) => {
          curr = selector.descendent.as_ref();
        }
        Selector::Not(selector) => {
          return curr;
        }
        Selector::SubElement(selector) => {
          return curr;
        }
        Selector::Within(selector) => {
          return curr;
        }
        Selector::Global(selector) => {
          return curr;
        }
        Selector::This(selector) => {
          return curr;
        }
        Selector::Adjacent(selector) => {
          curr = selector.next_sibling_selector.as_ref();
        }
        Selector::PseudoElement(selector) => {
          return curr;
        }
        Selector::PseudoParamElement(selector) => {
          return curr;
        }
        Selector::Sibling(selector) => {
          curr = selector.sibling_selector.as_ref();
        }
        Selector::Child(selector) => {
          curr = selector.child.as_ref();
        }
        Selector::Class(selector) => {
          return curr;
        }
        Selector::Id(selector) => {
          return curr;
        }
        Selector::Attribute(selector) => {
          return curr;
        }
        Selector::AllSelector(selector) => {
          return curr;
        }
      }
    }
    return curr;
  }
  pub fn walk(&self, each: &mut FnMut(&Selector) -> bool) -> bool {
    if each(self) == false {
      return false;
    }

    match self {
      Selector::PseudoElement(_)
      | Selector::Attribute(_)
      | Selector::Element(_)
      | Selector::AllSelector(_)
      | Selector::PseudoParamElement(_)
      | Selector::Id(_)
      | Selector::Class(_) => {
        return true;
      }
      Selector::Child(sel) => {
        if !each(&sel.parent) || !each(&sel.child) {
          return false;
        }
      }
      Selector::Sibling(sel) => {
        if !each(&sel.selector) || !each(&sel.sibling_selector) {
          return false;
        }
      }
      Selector::Group(selector) => {
        for child in &selector.selectors {
          if !child.walk(each) {
            return false;
          }
        }
      }
      Selector::Combo(selector) => {
        for part in &selector.selectors {
          if !part.walk(each) {
            return false;
          }
        }
      }
      Selector::Prefixed(selector) => {
        if let Some(sel) = &selector.postfix_selector {
          if !sel.walk(each) {
            return false;
          }
        }
      }
      Selector::Descendent(selector) => {
        if !each(&selector.ancestor) || !each(&selector.descendent) {
          return false;
        }
      }
      Selector::Not(selector) => {
        if !each(&selector.selector) {
          return false;
        }
      }
      Selector::SubElement(selector) => {
        if !each(&selector.selector) {
          return false;
        }
      }
      Selector::Within(selector) => {
        if !each(&selector.selector) {
          return false;
        }
      }
      Selector::Global(selector) => {
        if !each(&selector.selector) {
          return false;
        }
      }
      Selector::This(selector) => {
        if let Some(sel) = &selector.selector {
          if !sel.walk(each) {
            return false;
          }
        }
      }
      Selector::Adjacent(selector) => {
        if !each(&selector.selector) || !each(&selector.next_sibling_selector) {
          return false;
        }
      }
    }
    return true;
  }
  pub fn is_global(&self) -> bool {
    let mut is_global = false;
    self.walk(&mut |descendent| {
      if let Selector::Global(_) = descendent {
        is_global = true;
        return false;
      }
      return true;
    });

    return is_global;
  }
  pub fn get_range(&self) -> &Range {
    match self {
      Selector::Group(selector) => &selector.range,
      Selector::Combo(selector) => &selector.range,
      Selector::Prefixed(selector) => &selector.range,
      Selector::Element(selector) => &selector.range,
      Selector::Descendent(selector) => &selector.range,
      Selector::Not(selector) => &selector.range,
      Selector::SubElement(selector) => &selector.range,
      Selector::Within(selector) => &selector.range,
      Selector::Global(selector) => &selector.range,
      Selector::This(selector) => &selector.range,
      Selector::Adjacent(selector) => &selector.range,
      Selector::PseudoElement(selector) => &selector.range,
      Selector::PseudoParamElement(selector) => &selector.range,
      Selector::Sibling(selector) => &selector.range,
      Selector::Child(selector) => &selector.range,
      Selector::Class(selector) => &selector.range,
      Selector::Id(selector) => &selector.range,
      Selector::Attribute(selector) => &selector.range,
      Selector::AllSelector(selector) => &selector.range,
    }
  }
  pub fn get_pseudo_element_name(&self) -> Option<String> {
    let mut pseudo_element_name = None;

    self.walk(&mut |descendent| {
      if let Selector::PseudoElement(pseudo_element) = descendent {
        if matches!(pseudo_element.name.as_str(), "before" | "after") {
          pseudo_element_name = Some(pseudo_element.name.to_string());
          return false;
        }
      }
      return true;
    });

    pseudo_element_name
  }
}

impl fmt::Display for Selector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Selector::Group(selector) => write!(f, "{}", selector.to_string()),
      Selector::Combo(selector) => write!(f, "{}", selector.to_string()),
      Selector::Prefixed(selector) => write!(f, "{}", selector.to_string()),
      Selector::Element(selector) => write!(f, "{}", selector.to_string()),
      Selector::Descendent(selector) => write!(f, "{}", selector.to_string()),
      Selector::Not(selector) => write!(f, "{}", selector.to_string()),
      Selector::SubElement(selector) => write!(f, "{}", selector.to_string()),
      Selector::Within(selector) => write!(f, "{}", selector.to_string()),
      Selector::Global(selector) => write!(f, "{}", selector.to_string()),
      Selector::This(selector) => write!(f, "{}", selector.to_string()),
      Selector::Adjacent(selector) => write!(f, "{}", selector.to_string()),
      Selector::PseudoElement(selector) => write!(f, "{}", selector.to_string()),
      Selector::PseudoParamElement(selector) => write!(f, "{}", selector.to_string()),
      Selector::Sibling(selector) => write!(f, "{}", selector.to_string()),
      Selector::Child(selector) => write!(f, "{}", selector.to_string()),
      Selector::Class(selector) => write!(f, "{}", selector.to_string()),
      Selector::Id(selector) => write!(f, "{}", selector.to_string()),
      Selector::Attribute(selector) => write!(f, "{}", selector.to_string()),
      Selector::AllSelector(_) => write!(f, "*"),
    }
  }
}

// &--test, & + &, &:hover { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct PrefixedSelector {
  pub id: String,
  pub connector: String,

  #[serde(rename = "postfixSelector")]
  pub postfix_selector: Option<Box<Selector>>,
  pub range: Range,
}

impl fmt::Display for PrefixedSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    if let Some(postfix_selector) = &self.postfix_selector {
      write!(f, "&{}{}", self.connector, postfix_selector.to_string())
    } else {
      write!(f, "&{}", self.connector)
    }
    // write!(f, "&{}", self.connector)
  }
}

// a, b, h1, h2 { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct GroupSelector {
  pub id: String,
  pub selectors: Vec<Selector>,
  pub range: Range,
}

impl fmt::Display for GroupSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    let text: Vec<String> = (&self.selectors)
      .into_iter()
      .map(|selector| selector.to_string())
      .collect();

    write!(f, "{}", text.join(", "))
  }
}

// a.b[c=d] {}
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ComboSelector {
  pub id: String,
  pub selectors: Vec<Selector>,
  pub range: Range,
}

impl fmt::Display for ComboSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    let text: Vec<String> = (&self.selectors)
      .into_iter()
      .map(|selector| selector.to_string())
      .collect();

    write!(f, "{}", text.join(""))
  }
}

// a b {}
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct DescendentSelector {
  pub id: String,
  pub ancestor: Box<Selector>,
  pub descendent: Box<Selector>,
  pub range: Range,
}

impl fmt::Display for DescendentSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(
      f,
      "{} {}",
      self.ancestor.to_string(),
      self.descendent.to_string()
    )
  }
}

// :global(.selector)
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct GlobalSelector {
  pub id: String,
  pub selector: Box<Selector>,
  pub range: Range,
}

impl fmt::Display for GlobalSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, ":global({})", self.selector.to_string())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SelfSelector {
  pub id: String,
  pub selector: Option<Box<Selector>>,
  pub range: Range,
}

impl fmt::Display for SelfSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    if let Some(selector) = &self.selector {
      write!(f, ":self({})", selector.to_string())
    } else {
      write!(f, ":self")
    }
  }
}

// a > b {}
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ChildSelector {
  pub id: String,
  pub parent: Box<Selector>,
  pub child: Box<Selector>,
  pub range: Range,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct WithinSelector {
  pub id: String,
  pub selector: Box<Selector>,
  pub range: Range,
}

impl fmt::Display for WithinSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, ":within({})", self.selector.to_string())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct NotSelector {
  pub id: String,
  pub selector: Box<Selector>,
  pub range: Range,
}

impl fmt::Display for NotSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, ":not({})", self.selector.to_string())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SubElementSelector {
  pub id: String,
  pub name: String,
  pub selector: Box<Selector>,
  pub range: Range,
}

impl fmt::Display for SubElementSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(
      f,
      ":{}({})",
      self.name.to_string(),
      self.selector.to_string()
    )
  }
}

impl fmt::Display for ChildSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(
      f,
      "{} > {}",
      self.parent.to_string(),
      self.child.to_string()
    )
  }
}

// a + b {}
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct AdjacentSelector {
  pub selector: Box<Selector>,

  #[serde(rename = "nextSiblingSelector")]
  pub next_sibling_selector: Box<Selector>,
  pub range: Range,
}

impl fmt::Display for AdjacentSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(
      f,
      "{} + {}",
      self.selector.to_string(),
      self.next_sibling_selector.to_string()
    )
  }
}

// a ~ b {}
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SiblingSelector {
  pub selector: Box<Selector>,

  #[serde(rename = "siblingSelector")]
  pub sibling_selector: Box<Selector>,
  pub range: Range,
}

impl fmt::Display for SiblingSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(
      f,
      "{} ~ {}",
      self.selector.to_string(),
      self.sibling_selector.to_string()
    )
  }
}

// div:before, div::after { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct PseudoElementSelector {
  pub separator: String, // : or ::
  pub name: String,
  pub range: Range,
}

fn stringify_optional_selector(selector: &Option<Box<Selector>>) -> String {
  if let Some(item) = selector {
    item.to_string()
  } else {
    "".to_string()
  }
}

impl fmt::Display for PseudoElementSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{}{}", &self.separator, &self.name)?;
    Ok(())
  }
}

// :nth-of-type(div) { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct PseudoParamElementSelector {
  pub name: String,
  pub param: String,
  pub range: Range,
}

impl fmt::Display for PseudoParamElementSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, ":{}({})", &self.name, &self.param)?;
    Ok(())
  }
}

// div { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ElementSelector {
  #[serde(rename = "tagName")]
  pub tag_name: String,
  pub range: Range,
}

impl fmt::Display for ElementSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{}", &self.tag_name)?;
    Ok(())
  }
}

// .div { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ClassSelector {
  #[serde(rename = "className")]
  pub class_name: String,
  pub range: Range,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct AllSelector {
  pub range: Range,
}

impl fmt::Display for AllSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "*")
  }
}

impl fmt::Display for ClassSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, ".{}", &self.class_name)?;
    Ok(())
  }
}

// #div { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct IdSelector {
  pub id: String,
  pub range: Range,
}

impl fmt::Display for IdSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "#{}", &self.id)?;
    Ok(())
  }
}

// #div { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct AttributeSelector {
  pub name: String,
  pub operator: Option<String>,
  pub value: Option<String>,
  pub range: Range,
}

impl fmt::Display for AttributeSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "[{}", &self.name)?;
    if let Some(value) = &self.value {
      if let Some(operator) = &self.operator {
        write!(f, "{}{}", operator, value)?;
      }
    }
    write!(f, "]")?;
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Sheet {
  pub id: String,
  pub raws: BasicRaws,
  pub rules: Vec<Rule>,
  pub declarations: Vec<Declaration>,
  pub range: Range,
}

impl Expr for Sheet {
  fn walk<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    visitor.visit_css_sheet(self);
    // walk_rules_and_decls(&self.rules, &self.declarations, visitor);
    walk_exprs(&self.rules, visitor);
    walk_exprs(&self.declarations, visitor);
  }
  fn get_id<'a>(&'a self) -> &'a String {
    &self.id
  }
  fn wrap<'a>(&'a self) -> pc_ast::Expression<'a> {
    pc_ast::Expression::CSS(Expression::Sheet(self))
  }
}

impl fmt::Display for Sheet {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    for rule in &self.rules {
      write!(f, "{}", &rule.to_string())?;
    }
    Ok(())
  }
}

fn walk_exprs<'a, TExpr: Expr>(exprs: &'a Vec<TExpr>, visitor: &mut ExprVisitor<'a>) {
  if !visitor.should_continue() {
    return;
  }
  for expr in exprs {
    expr.walk(visitor);
    if !visitor.should_continue() {
      return;
    }
  }
}
