use super::virt::{ElementSourceInfo, Node};
use crate::base::ast::ExprTextSource;
use crate::css::runtime::mutation as css_mutation;
use crate::script::runtime::virt as script_virt;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct InsertChild {
  pub child: Node,
  pub index: usize,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct DeleteChild {
  pub index: usize,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SetAttribute {
  pub name: String,
  pub value: Option<String>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct RemoveAttribute {
  pub name: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct UpdateSheet {
  pub mutations: Vec<css_mutation::Mutation>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SetText {
  pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SetAnnotations {
  pub value: Option<script_virt::Object>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SetElementSourceInfo {
  pub value: ElementSourceInfo,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ReplaceNode {
  pub replacement: Node,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum Action {
  ReplaceNode(ReplaceNode),
  InsertChild(InsertChild),
  DeleteChild(DeleteChild),
  SetAttribute(SetAttribute),
  SetText(SetText),
  SetAnnotations(SetAnnotations),
  SetElementSourceInfo(SetElementSourceInfo),
  RemoveAttribute(RemoveAttribute),
  UpdateSheet(UpdateSheet),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Mutation {
  #[serde(rename = "nodePath")]
  node_path: Vec<usize>,
  action: Action,
}

impl Mutation {
  pub fn new(node_path: Vec<usize>, action: Action) -> Mutation {
    Mutation { node_path, action }
  }
}
