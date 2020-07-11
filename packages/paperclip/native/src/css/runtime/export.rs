use super::virt;
use crate::base::ast::ExprSource;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub struct Exports {
  #[serde(rename = "classNames")]
  pub class_names: Vec<ClassNameExport>,
  pub mixins: HashMap<String, MixinExport>,
  pub variables: HashMap<String, VarExport>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ClassNameExport {
  pub name: String,
  pub public: bool,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct VarExport {
  pub name: String,
  pub value: String,
  pub source: ExprSource,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct MixinExport {
  pub declarations: Vec<virt::CSSStyleProperty>,
  pub public: bool,
}

impl Exports {
  pub fn new() -> Exports {
    Exports {
      class_names: vec![],
      mixins: HashMap::new(),
      variables: HashMap::new(),
    }
  }
  pub fn extend(&mut self, exports: &Exports) {
    self.class_names.extend(exports.class_names.clone());
    self.mixins.extend(exports.mixins.clone());
    self.variables.extend(exports.variables.clone());
  }
}
