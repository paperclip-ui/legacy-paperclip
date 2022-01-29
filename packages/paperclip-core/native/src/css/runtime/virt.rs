use serde::Serialize;
use std::fmt;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct CSSSheet {
  pub id: String,
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

#[derive(Debug, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum Rule {
  Style(StyleRule),
  Charset(CharsetRule),
  // Namespace(String),
  FontFace(FontFaceRule),
  Media(ConditionRule),
  Supports(ConditionRule),
  Page(ConditionRule),
  Document(ConditionRule),
  Keyframes(KeyframesRule),
}

// need to implement partialeq here like so since PartialEq trait
// does not check custom implementations for enums
impl PartialEq for Rule {
  fn eq(&self, other: &Self) -> bool {
    match (self, other) {
      (Rule::Style(a), Rule::Style(b)) => a == b,
      (Rule::Charset(a), Rule::Charset(b)) => a == b,
      // (Rule::Namespace(a), Rule::Namespace(b)) => a == b,
      (Rule::FontFace(a), Rule::FontFace(b)) => a == b,
      (Rule::Media(a), Rule::Media(b)) => a == b,
      (Rule::Supports(a), Rule::Supports(b)) => a == b,
      (Rule::Page(a), Rule::Page(b)) => a == b,
      (Rule::Document(a), Rule::Document(b)) => a == b,
      (Rule::Keyframes(a), Rule::Keyframes(b)) => a == b,
      _ => false,
    }
  }
}

impl fmt::Display for Rule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Rule::Style(rule) => write!(f, "{}", rule.to_string()),
      Rule::Charset(value) => write!(f, "@charset {};", value),
      // Rule::Namespace(value) => write!(f, "@namespace {};", value),
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
pub struct CharsetRule {
  pub id: String,
  pub value: String,
}

impl fmt::Display for CharsetRule {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "@charset \"{}\"", self.value)?;
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct FontFaceRule {
  pub id: String,
  pub style: Vec<CSSStyleProperty>,
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
#[derive(Debug, Serialize, Clone)]
pub struct ConditionRule {
  pub id: String,
  pub name: String,
  #[serde(rename = "conditionText")]
  pub condition_text: String,
  pub rules: Vec<Rule>,
}

impl PartialEq for ConditionRule {
  fn eq(&self, other: &Self) -> bool {
    if self.name != other.name {
      return false;
    }

    if self.condition_text != other.condition_text {
      return false;
    }

    if self.rules.len() != other.rules.len() {
      return false;
    }

    for i in 0..self.rules.len() {
      if self.rules.get(i) != other.rules.get(i) {
        return false;
      }
    }

    true
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
pub struct KeyframesRule {
  pub id: String,
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
  pub id: String,
  pub key: String,
  pub style: Vec<CSSStyleProperty>,
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

#[derive(Debug, Serialize, Hash, Clone)]
pub struct StyleRule {
  pub id: String,
  pub exported: bool,

  #[serde(rename = "sourceId")]
  pub source_id: String,

  #[serde(rename = "selectorText")]
  pub selector_text: String,
  pub style: Vec<CSSStyleProperty>,
}

impl PartialEq for StyleRule {
  fn eq(&self, other: &Self) -> bool {
    self.exported == other.exported
      && self.selector_text == other.selector_text
      && self.style == other.style
  }
}

impl Eq for StyleRule {}

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

#[derive(Debug, Serialize, Hash, Clone)]
pub struct CSSStyleProperty {
  pub id: String,
  pub name: String,
  pub value: String,

  #[serde(rename = "sourceId")]
  pub source_id: String,
}

impl PartialEq for CSSStyleProperty {
  fn eq(&self, other: &Self) -> bool {
    self.name == other.name && self.value == other.value
  }
}

impl Eq for CSSStyleProperty {}
