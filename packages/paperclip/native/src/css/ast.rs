use std::fmt;
use serde::{Serialize};
use crate::base::ast::{Location};

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Declaration {
  pub name: String,
  pub value: String,
  pub location: Location,

  #[serde(rename = "nameLocation")]
  pub name_location: Location,
  
  #[serde(rename = "valueLocation")]
  pub value_location: Location
}

impl fmt::Display for Declaration {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "{}:{};", &self.name, &self.value)?;
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
  Supports(ConditionRule),
  Page(ConditionRule),
  Document(ConditionRule),
  Keyframes(KeyframesRule)
}

impl fmt::Display for Rule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Rule::Style(rule) => write!(f, "{}", rule.to_string()),
      Rule::Charset(value) => write!(f, "@charset {}", value),
      Rule::Namespace(value) => write!(f, "@namespace {}", value),
      Rule::FontFace(rule) => write!(f, "{}", rule.to_string()),
      Rule::Media(rule) => write!(f, "{}", rule.to_string()),
      Rule::Supports(rule) => write!(f, "{}", rule.to_string()),
      Rule::Keyframes(rule) => write!(f, "{}", rule.to_string()),
      Rule::Document(rule) => write!(f, "{}", rule.to_string()),
      Rule::Page(rule) => write!(f, "{}", rule.to_string())
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleRule {
  pub selector: Selector,
  pub declarations: Vec<Declaration>
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
pub struct FontFaceRule {
  pub declarations: Vec<Declaration>
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
pub struct ConditionRule {
  pub name: String,
  pub condition_text: String,
  pub rules: Vec<StyleRule>
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
pub struct KeyframesRule {
  pub name: String,
  pub rules: Vec<KeyframeRule>
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
  pub declarations: Vec<Declaration>
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
  Combo(ComboSelector),
  Descendent(DescendentSelector),
  PseudoElement(PseudoElementSelector),
  PseudoParamElement(PseudoParamElementSelector),
  Not(NotSelector),
  Child(ChildSelector),
  Adjacent(AdjacentSelector),
  Sibling(SiblingSelector),
  Id(IdSelector),
  Element(ElementSelector),
  Attribute(AttributeSelector),
  Class(ClassSelector),
  AllSelector
}

impl fmt::Display for Selector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Selector::Group(selector) => write!(f, "{}", selector.to_string()),
      Selector::Combo(selector) => write!(f, "{}", selector.to_string()),
      Selector::Element(selector) => write!(f, "{}", selector.to_string()),
      Selector::Descendent(selector) => write!(f, "{}", selector.to_string()),
      Selector::Not(selector) => write!(f, "{}", selector.to_string()),
      Selector::Adjacent(selector) => write!(f, "{}", selector.to_string()),
      Selector::PseudoElement(selector) => write!(f, "{}", selector.to_string()),
      Selector::PseudoParamElement(selector) => write!(f, "{}", selector.to_string()),
      Selector::Sibling(selector) => write!(f, "{}", selector.to_string()),
      Selector::Child(selector) => write!(f, "{}", selector.to_string()),
      Selector::Class(selector) => write!(f, "{}", selector.to_string()),
      Selector::Id(selector) => write!(f, "{}", selector.to_string()),
      Selector::Attribute(selector) => write!(f, "{}", selector.to_string()),
      Selector::AllSelector => write!(f, "*")
    }
  }
}

// a, b, h1, h2 { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct GroupSelector {
  pub selectors: Vec<Selector>
}

impl fmt::Display for GroupSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    let text: Vec<String> = (&self.selectors).into_iter().map(|selector| {
      selector.to_string()
    }).collect();

    write!(f, "{}", text.join(", "))
  }
}

// a.b[c=d] {}
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ComboSelector {
  pub selectors: Vec<Selector>
}

impl fmt::Display for ComboSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    let text: Vec<String> = (&self.selectors).into_iter().map(|selector| {
      selector.to_string()
    }).collect();

    write!(f, "{}", text.join(""))
  }
}

// a b {}
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct DescendentSelector {
  pub parent: Box<Selector>,
  pub descendent: Box<Selector>
}

impl fmt::Display for DescendentSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{} {}", self.parent.to_string(), self.descendent.to_string())
  }
}

// a > b {}
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ChildSelector {
  pub parent: Box<Selector>,
  pub child: Box<Selector>
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct NotSelector {
  pub selector: Box<Selector>
}

impl fmt::Display for NotSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, ":not({})", self.selector.to_string())
  }
}

impl fmt::Display for ChildSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{} > {}", self.parent.to_string(), self.child.to_string())
  }
}

// a + b {}
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct AdjacentSelector {
  pub selector: Box<Selector>,
  pub next_sibling_selector: Box<Selector>
}

impl fmt::Display for AdjacentSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{} + {}", self.selector.to_string(), self.next_sibling_selector.to_string())
  }
}

// a ~ b {}
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SiblingSelector {
  pub selector: Box<Selector>,
  pub sibling_selector: Box<Selector>
}

impl fmt::Display for SiblingSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{} ~ {}", self.selector.to_string(), self.sibling_selector.to_string())
  }
}

// div:before, div::after { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct PseudoElementSelector {
  pub separator: String, // : or ::
  pub target: Option<Box<Selector>>,
  pub name: String
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
    write!(f, "{}{}{}", stringify_optional_selector(&self.target), &self.separator, &self.name)?;
    Ok(())
  }
}

// :nth-of-type(div) { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct PseudoParamElementSelector {
  pub target: Option<Box<Selector>>,
  pub name: String,
  pub param: String
}

impl fmt::Display for PseudoParamElementSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{}:{}({})", stringify_optional_selector(&self.target), &self.name, &self.param)?;
    Ok(())
  }
}

// div { }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ElementSelector {
  pub tag_name: String
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
  pub class_name: String
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
  pub id: String
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
  pub value: Option<String>
}


impl fmt::Display for AttributeSelector {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "[{}", &self.name)?;
    if let Some(value) = &self.value {
      write!(f, "=\"{}\"", value)?;
    }
    write!(f, "]")?;
    Ok(())
  }
}


#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Sheet {
  pub rules: Vec<Rule>
}

impl fmt::Display for Sheet {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    for rule in &self.rules {
      write!(f, "{}", &rule.to_string())?;
    }
    Ok(())
  }
}
