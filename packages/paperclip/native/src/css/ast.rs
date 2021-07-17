use crate::base::ast::{BasicRaws, Location};
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
  pub fn get_location(&self) -> &Location {
    match self {
      Declaration::KeyValue(kv) => &kv.location,
      Declaration::Include(kv) => &kv.location,
      Declaration::Content(kv) => &kv.location,
      Declaration::Media(kv) => &kv.location,
    }
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
pub enum CSSObject<'a> {
  Declaration(&'a Declaration),
  Rule(&'a Rule),
  StyleRule(&'a StyleRule),
  Sheet(&'a Sheet),
}

impl<'a> CSSObject<'a> {
  pub fn get_location(&self) -> &Location {
    match self {
      CSSObject::Declaration(decl) => decl.get_location(),
      CSSObject::Rule(rule) => rule.get_location(),
      CSSObject::Sheet(rule) => &rule.location,
      CSSObject::StyleRule(rule) => &rule.location,
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct KeyValueDeclaration {
  pub name: String,
  pub value: String,
  pub location: Location,
  pub raws: BasicRaws,

  #[serde(rename = "nameLocation")]
  pub name_location: Location,

  #[serde(rename = "valueLocation")]
  pub value_location: Location,
}

impl fmt::Display for KeyValueDeclaration {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "{}:{};", &self.name, &self.value)?;
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Content {
  pub raws: BasicRaws,
  pub location: Location,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Include {
  pub id: String,
  #[serde(rename = "mixinName")]
  pub mixin_name: IncludeReference,
  pub declarations: Vec<Declaration>,
  pub rules: Vec<StyleRule>,
  pub location: Location,
  pub raws: BasicRaws,
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
  pub parts: Vec<IncludeReferencePart>,
  pub location: Location,
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
  pub name: String,
  pub location: Location,
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
  pub location: Location,
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
  pub fn get_id(&self) -> &String {
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
  pub fn get_object_by_id<'a>(&'a self, id: &String) -> Option<CSSObject<'a>> {
    if self.get_id() == id {
      return Some(CSSObject::Rule(self));
    }

    if let Rule::Style(rule) = self {
      return rule.get_object_by_id(id);
    }

    return None;
  }
  pub fn get_location(&self) -> &Location {
    match self {
      Rule::Comment(rule) => &rule.location,
      Rule::Style(rule) => &rule.location,
      Rule::Charset(value) => &value.location,
      Rule::Export(export) => &export.location,
      Rule::FontFace(rule) => &rule.location,
      Rule::Media(rule) => &rule.location,
      Rule::Mixin(rule) => &rule.location,
      Rule::Include(rule) => &rule.location,
      Rule::Supports(value) => &value.location,
      Rule::Keyframes(rule) => &rule.location,
      Rule::Document(rule) => &rule.location,
      Rule::Page(rule) => &rule.location,
    }
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
  pub location: Location,
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
  pub children: Vec<StyleRule>,
  pub location: Location,
  pub raws: BasicRaws,
}

impl StyleRule {
  pub fn get_object_by_id<'a>(&'a self, id: &String) -> Option<CSSObject<'a>> {
    if (&self.id == id) {
      return Some(CSSObject::StyleRule(&self));
    }
    for child in &self.children {
      let sub = child.get_object_by_id(id);
      if sub != None {
        return sub;
      }
    }
    return None;
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
  pub connector: String,
  pub selector: Option<Selector>,
  pub location: Location,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ChildStyleRule {
  pub selectors: Vec<ChildRuleSelector>,
  pub declarations: Vec<Declaration>,
  pub children: Vec<ChildStyleRule>,
  pub location: Location,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct FontFaceRule {
  pub id: String,
  pub declarations: Vec<Declaration>,
  pub raws: BasicRaws,
  pub location: Location,
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
  pub location: Location,
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

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ConditionRule {
  pub id: String,
  pub name: String,

  #[serde(rename = "conditionText")]
  pub condition_text: String,
  pub rules: Vec<StyleRule>,
  pub declarations: Vec<Declaration>,
  pub location: Location,
  pub raws: BasicRaws,
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
  pub name: MixinName,
  pub raws: BasicRaws,
  pub location: Location,
  pub declarations: Vec<Declaration>,
  pub rules: Vec<StyleRule>,
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

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct MixinName {
  pub value: String,
  pub location: Location,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct KeyframesRule {
  pub id: String,
  pub name: String,
  pub rules: Vec<KeyframeRule>,
  pub location: Location,
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
  pub key: String,
  pub raws: BasicRaws,
  pub declarations: Vec<Declaration>,
  pub location: Location,
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
  pub fn get_location(&self) -> &Location {
    match self {
      Selector::Group(selector) => &selector.location,
      Selector::Combo(selector) => &selector.location,
      Selector::Prefixed(selector) => &selector.location,
      Selector::Element(selector) => &selector.location,
      Selector::Descendent(selector) => &selector.location,
      Selector::Not(selector) => &selector.location,
      Selector::SubElement(selector) => &selector.location,
      Selector::Within(selector) => &selector.location,
      Selector::Global(selector) => &selector.location,
      Selector::This(selector) => &selector.location,
      Selector::Adjacent(selector) => &selector.location,
      Selector::PseudoElement(selector) => &selector.location,
      Selector::PseudoParamElement(selector) => &selector.location,
      Selector::Sibling(selector) => &selector.location,
      Selector::Child(selector) => &selector.location,
      Selector::Class(selector) => &selector.location,
      Selector::Id(selector) => &selector.location,
      Selector::Attribute(selector) => &selector.location,
      Selector::AllSelector(selector) => &selector.location,
    }
  }
  pub fn get_pseudo_element_name(&self) -> Option<String> {
    let mut pseudo_element_name = None;

    self.walk(&mut |descendent| {
      if let Selector::PseudoElement(pseudo_element) = descendent {
        pseudo_element_name = Some(pseudo_element.name.to_string());
        return false;
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
  pub connector: String,

  #[serde(rename = "postfixSelector")]
  pub postfix_selector: Option<Box<Selector>>,
  pub location: Location,
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
  pub selectors: Vec<Selector>,
  pub location: Location,
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
  pub selectors: Vec<Selector>,
  pub location: Location,
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
  pub ancestor: Box<Selector>,
  pub descendent: Box<Selector>,
  pub location: Location,
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
  pub selector: Box<Selector>,
  pub location: Location,
}

impl fmt::Display for GlobalSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, ":global({})", self.selector.to_string())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SelfSelector {
  pub selector: Option<Box<Selector>>,
  pub location: Location,
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
  pub parent: Box<Selector>,
  pub child: Box<Selector>,
  pub location: Location,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct WithinSelector {
  pub selector: Box<Selector>,
  pub location: Location,
}

impl fmt::Display for WithinSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, ":within({})", self.selector.to_string())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct NotSelector {
  pub selector: Box<Selector>,
  pub location: Location,
}

impl fmt::Display for NotSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, ":not({})", self.selector.to_string())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SubElementSelector {
  pub name: String,
  pub selector: Box<Selector>,
  pub location: Location,
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
  pub location: Location,
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
  pub location: Location,
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
  pub location: Location,
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
  pub location: Location,
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
  pub location: Location,
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
  pub location: Location,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct AllSelector {
  pub location: Location,
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
  pub location: Location,
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
  pub location: Location,
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
  pub location: Location,
}

impl fmt::Display for Sheet {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    for rule in &self.rules {
      write!(f, "{}", &rule.to_string())?;
    }
    Ok(())
  }
}

impl Sheet {
  pub fn get_object_by_id<'a>(&'a self, id: &String) -> Option<CSSObject<'a>> {
    if &self.id == id {
      return Some(CSSObject::Sheet(&self));
    }

    for rule in &self.rules {
      let nested_object = rule.get_object_by_id(id);
      if nested_object != None {
        return nested_object;
      }
    }

    return None;
  }
}
