use super::virt as css_virt;
use crate::css::runtime::virt as css_virt;
use std::collections::HashMap;

pub struct CacheKey {
  pub fn new(imports: &HashMap<String, HashMap<String, virt::Exportable>>) -> {

  }
}

pub struct Cache {
  pub entries: HashMap<CacheKey>
}

impl Cache {
  pub fn new() -> Cache {
    Cache {
      entries: HashMap::new()
    }
  }
  pub fn remove(&mut self, entry: CacheKey) {
    self.style_entries.remove(uri);
    self.node_entries.remove(uri);
  }
}