use super::virt as pc_virt;
use crate::css::runtime::virt as css_virt;
use std::collections::HashMap;

pub struct Cache {
  pub style_entries: HashMap<String, css_virt::CSSSheet>,
  pub node_entries: HashMap<String, pc_virt::Node>,
}

impl Cache {
  pub fn new() -> Cache {
    Cache {
      style_entries: HashMap::new(),
      node_entries: HashMap::new(),
    }
  }
  pub fn remove(&mut self, uri: &String) {
    self.style_entries.remove(uri);
    self.node_entries.remove(uri);
  }
}
