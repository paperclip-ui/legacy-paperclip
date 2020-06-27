use super::virt;
use serde::Serialize;
use std::collections::HashMap;
use std::collections::HashSet;


#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub struct Exports {
  #[serde(rename = "classNames")]
  pub class_names: HashSet<String>,
  pub mixins: HashMap<String, Vec<virt::CSSStyleProperty>>,
}

impl Exports {
  pub fn new() -> Exports {
    Exports {
      class_names: HashSet::new(),
      mixins: HashMap::new()
    }
  }
  pub fn extend(&mut self, exports: &Exports) {
    self.class_names.extend(exports.class_names.clone());
    self.mixins.extend(exports.mixins.clone());
  }
}