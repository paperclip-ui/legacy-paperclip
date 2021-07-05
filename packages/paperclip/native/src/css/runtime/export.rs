use super::virt;
use crate::base::ast::ExprTextSource;
use serde::Serialize;
use std::collections::BTreeMap;

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub struct Exports {
  #[serde(rename = "classNames")]
  pub class_names: BTreeMap<String, ClassNameExport>,
  pub mixins: BTreeMap<String, MixinExport>,
  pub variables: BTreeMap<String, VarExport>,
  pub keyframes: BTreeMap<String, KeyframesExport>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ClassNameExport {
  pub name: String,
  #[serde(rename = "scopedName")]
  pub scoped_name: String,
  pub public: bool,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct VarExport {
  pub name: String,
  pub value: String,
  pub source: ExprTextSource,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct KeyframesExport {
  pub name: String,
  pub public: bool,
  pub source: ExprTextSource,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct MixinExport {
  pub name: String,
  pub public: bool,
}

impl Exports {
  pub fn new() -> Exports {
    Exports {
      class_names: BTreeMap::new(),
      mixins: BTreeMap::new(),
      variables: BTreeMap::new(),
      keyframes: BTreeMap::new(),
    }
  }
  pub fn extend(&mut self, exports: &Exports) {
    self.class_names.extend(exports.class_names.clone());
    self.mixins.extend(exports.mixins.clone());
    self.variables.extend(exports.variables.clone());
    self.keyframes.extend(exports.keyframes.clone());
  }
}
