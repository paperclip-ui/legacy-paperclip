use super::virt::Rule;
use crate::base::ast::ExprTextSource;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SetSelectorText {
  #[serde(rename = "selectorText")]
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
#[serde(tag = "kind")]
pub enum Action {
  InsertRule(InsertRule),
  DeleteRule(DeleteRule),
  ReplaceRule(ReplaceRule),
  SetDeclaration(SetDeclaration),
  SetSelectorText(SetSelectorText),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Mutation {
  pub path: Vec<usize>,
  pub action: Action,
}
