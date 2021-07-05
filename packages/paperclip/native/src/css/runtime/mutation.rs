use super::virt::Rule;
use crate::base::ast::ExprTextSource;
use crate::base::ast::Location;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SetSelectorText {
  pub selector_text: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct InsertRule {
  pub index: usize,
  pub rule: Rule,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ReplaceRule {
  pub index: usize,
  pub rule: Rule,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct DeleteRule {
  pub index: usize,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SetDeclaration {
  pub name: String,
  pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SourceChanged {
  #[serde(rename = "propertyName")]
  pub property_name: String,

  #[serde(rename = "newSouroce")]
  pub new_source: ExprTextSource,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum Action {
  InsertRule(InsertRule),
  DeleteRule(DeleteRule),
  ReplaceRule(ReplaceRule),
  SourceChanged(SourceChanged),
  SetDeclaration(SetDeclaration),
  SetSelectorText(SetSelectorText),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Mutation {
  pub path: Vec<usize>,
  pub action: Action,
}
