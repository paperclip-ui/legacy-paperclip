use serde::Serialize;
use std::fmt;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ConditionRule<TStyleRule: fmt::Display> {
  pub name: String,
  #[serde(rename = "conditionText")]
  pub condition_text: String,
  pub rules: Vec<TStyleRule>,
}

impl<TStyleRule: fmt::Display> fmt::Display for ConditionRule<TStyleRule> {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    writeln!(f, "@{} {} {{", &self.name, &self.condition_text)?;
    for rule in &self.rules {
      write!(f, "{}\n", &rule.to_string())?;
    }
    writeln!(f, "}}")?;

    Ok(())
  }
}
