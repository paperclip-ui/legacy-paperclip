use crate::css::runtime::export as css_export;
use serde::Serialize;
use std::collections::{BTreeMap, HashMap};

#[derive(Debug, PartialEq, Clone, Serialize)]
pub struct Exports {
  pub style: css_export::Exports,
  pub components: BTreeMap<String, ComponentExport>,
}

#[derive(Debug, PartialEq, Clone, Serialize)]
pub struct ComponentExport {
  pub name: String,
  pub properties: BTreeMap<String, Property>,
  pub public: bool,
}

#[derive(Debug, PartialEq, Clone, Serialize)]
pub struct Property {
  pub name: String,
  pub optional: bool,
}
