use crate::base::ast::Location;
use serde::Serialize;
use std::fmt;

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "declarationKind")]
pub enum Declaration {
  KeyValue(KeyValueDeclaration),
  Include(IncludeDeclaration),
}

impl fmt::Display for Declaration {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Declaration::KeyValue(kv) => kv.fmt(f),
      Declaration::Include(inc) => inc.fmt(f),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct KeyValueDeclaration {
  pub name: String,
  pub value: String,
  pub location: Location,

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
pub struct IncludeDeclaration {
  pub mixins: Vec<Vec<IncludeDeclarationPart>>,
}

impl fmt::Display for IncludeDeclaration {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(
      f,
      "@include {}",
      &self
        .mixins
        .iter()
        .map(|path| {
          path
            .iter()
            .map(|part| part.name.to_string())
            .collect::<Vec<String>>()
            .join(".")
        })
        .collect::<Vec<String>>()
        .join(" ")
    )?;
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct IncludeDeclarationPart {
  pub name: String,
  pub location: Location,
}

impl fmt::Display for IncludeDeclarationPart {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "{}", &self.name)?;
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum Rule {
  Style(StyleRule),
  Charset(String),
  Namespace(String),
  FontFace(FontFaceRule),
  Media(ConditionRule),
  Export(ExportRule),
  Mixin(MixinRule),
  Supports(ConditionRule),
  Page(ConditionRule),
  Document(ConditionRule),
  Keyframes(KeyframesRule),
}

impl fmt::Display for Rule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Rule::Style(rule) => write!(f, "{}", rule.to_string()),
      Rule::Charset(value) => write!(f, "@charset {}", value),
      Rule::Export(export) => write!(f, "{}", export),
      Rule::Namespace(value) => write!(f, "@namespace {}", value),
      Rule::FontFace(rule) => write!(f, "{}", rule.to_string()),
      Rule::Media(rule) => write!(f, "{}", rule.to_string()),
      Rule::Mixin(rule) => write!(f, "{}", rule.to_string()),
      Rule::Supports(rule) => write!(f, "{}", rule.to_string()),
      Rule::Keyframes(rule) => write!(f, "{}", rule.to_string()),
      Rule::Document(rule) => write!(f, "{}", rule.to_string()),
      Rule::Page(rule) => write!(f, "{}", rule.to_string()),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleRule {
  pub selector: Selector,
  pub declarations: Vec<Declaration>,
  pub children: Vec<StyleRule>,
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
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ChildStyleRule {
  pub selectors: Vec<ChildRuleSelector>,
  pub declarations: Vec<Declaration>,
  pub children: Vec<ChildStyleRule>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct FontFaceRule {
  pub declarations: Vec<Declaration>,
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
  pub rules: Vec<Rule>,
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
  pub name: String,
  pub condition_text: String,
  pub rules: Vec<StyleRule>,
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
  pub name: MixinName,
  pub location: Location,
  pub declarations: Vec<Declaration>,
}

impl fmt::Display for MixinRule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "@mixin {} {{", &self.name.value)?;
    for decl in &self.declarations {
      write!(f, "{}\n", &decl.to_string())?;
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
  pub name: String,
  pub rules: Vec<KeyframeRule>,
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
  pub declarations: Vec<Declaration>,
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
#[serde(tag = "kind")]
pub enum Selector {
  Group(GroupSelector),
  Prefixed(PrefixedSelector),
  Combo(ComboSelector),
  Descendent(DescendentSelector),
  PseudoElement(PseudoElementSelector),
  PseudoParamElement(PseudoParamElementSelector),
  Not(NotSelector),
  Global(GlobalSelector),
  Child(ChildSelector),
  Adjacent(AdjacentSelector),
  Sibling(SiblingSelector),
  Id(IdSelector),
  Element(ElementSelector),
  Attribute(AttributeSelector),
  Class(ClassSelector),
  AllSelector,
  None,
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
      Selector::Global(selector) => write!(f, "{}", selector.to_string()),
      Selector::Adjacent(selector) => write!(f, "{}", selector.to_string()),
      Selector::PseudoElement(selector) => write!(f, "{}", selector.to_string()),
      Selector::PseudoParamElement(selector) => write!(f, "{}", selector.to_string()),
      Selector::Sibling(selector) => write!(f, "{}", selector.to_string()),
      Selector::Child(selector) => write!(f, "{}", selector.to_string()),
      Selector::Class(selector) => write!(f, "{}", selector.to_string()),
      Selector::Id(selector) => write!(f, "{}", selector.to_string()),
      Selector::Attribute(selector) => write!(f, "{}", selector.to_string()),
      Selector::None => write!(f, ""),
      Selector::AllSelector => write!(f, "*"),
    }
  }
}

// &--test, & + &, &:hover { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct PrefixedSelector {
  pub connector: String,
  pub postfix_selector: Option<Box<Selector>>,
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
  pub parent: Box<Selector>,
  pub descendent: Box<Selector>,
}

impl fmt::Display for DescendentSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(
      f,
      "{} {}",
      self.parent.to_string(),
      self.descendent.to_string()
    )
  }
}

// :global(.selector)
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct GlobalSelector {
  pub selector: Box<Selector>,
}

impl fmt::Display for GlobalSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, ":global({})", self.selector.to_string())
  }
}
// a > b {}
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ChildSelector {
  pub parent: Box<Selector>,
  pub child: Box<Selector>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct NotSelector {
  pub selector: Box<Selector>,
}

impl fmt::Display for NotSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, ":not({})", self.selector.to_string())
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
  pub target: Option<Box<Selector>>,
  pub name: String,
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
    write!(
      f,
      "{}{}{}",
      stringify_optional_selector(&self.target),
      &self.separator,
      &self.name
    )?;
    Ok(())
  }
}

// :nth-of-type(div) { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct PseudoParamElementSelector {
  pub target: Option<Box<Selector>>,
  pub name: String,
  pub param: String,
}

impl fmt::Display for PseudoParamElementSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(
      f,
      "{}:{}({})",
      stringify_optional_selector(&self.target),
      &self.name,
      &self.param
    )?;
    Ok(())
  }
}

// div { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ElementSelector {
  #[serde(rename = "tagName")]
  pub tag_name: String,
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
  pub rules: Vec<Rule>,
}

impl fmt::Display for Sheet {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    for rule in &self.rules {
      write!(f, "{}", &rule.to_string())?;
    }
    Ok(())
  }
}
