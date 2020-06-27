use super::ast;

pub struct PCASTInfo {
  component_paths: Vec<String, Vec<i32>>
}

pub fn get_info(node: Node) -> PCASTInfo {
  PCASTInfo {
    component_paths: collect_component_pat
  }
}