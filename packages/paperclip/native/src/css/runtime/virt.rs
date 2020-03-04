use std::fmt;
use serde::{Serialize};

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct CSSSheet {
  pub rules: Vec<Rule>,
}

impl CSSSheet {
  pub fn extend(&mut self, other: CSSSheet) {
    self.rules.extend(other.rules);
  }
}

impl fmt::Display for CSSSheet {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    for rule in &self.rules {
      write!(f, "{}", rule.to_string())?;
    }
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
  Keyframes(KeyframesRule),
}

impl fmt::Display for Rule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Rule::Style(rule) => write!(f, "{}", rule.to_string()),
      Rule::Charset(value) => write!(f, "@charset {};", value),
      Rule::Namespace(value) => write!(f, "@namespace {};", value),
      Rule::FontFace(rule) => write!(f, "{}", rule.to_string()),
      Rule::Media(rule) => write!(f, "{}", rule.to_string()),
      Rule::Document(rule) => write!(f, "{}", rule.to_string()),
      Rule::Page(rule) => write!(f, "{}", rule.to_string()),
      Rule::Supports(rule) => write!(f, "{}", rule.to_string()),
      Rule::Keyframes(rule) => write!(f, "{}", rule.to_string()),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct FontFaceRule {
  pub style: Vec<CSSStyleProperty>
}

impl fmt::Display for FontFaceRule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "@font-family {{")?;
    for property in &self.style {
      write!(f, "{}: {};", &property.name, &property.value)?;
    }
    write!(f, "}}")?;
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
  pub style: Vec<CSSStyleProperty>
}

impl fmt::Display for KeyframeRule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "{} {{", &self.key)?;
    for property in &self.style {
      write!(f, "{}: {};", &property.name, &property.value)?;
    }
    writeln!(f, "}}")?;

    Ok(())
  }
}


#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleRule {
  pub selector_text: String,
  pub style: Vec<CSSStyleProperty>
}

impl fmt::Display for StyleRule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, " {} {{", &self.selector_text)?;
    for property in &self.style {
      write!(f, "{}: {};", &property.name, &property.value)?;
    }
    write!(f, "}}")?;
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct CSSStyleProperty {
  pub name: String,
  pub value: String
}