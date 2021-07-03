use super::virt::{Node as VirtNode};
use super::evaluator::{evaluate as evaluate_pc, __test__evaluate_source as __test__evaluate_pc_source, EngineMode};
use crate::pc::parser::parse;
use crate::core::graph::{Dependency, DependencyGraph, DependencyContent};
use crate::core::vfs::VirtualFileSystem;

pub struct LintOptions {
  no_unused_css: Option<bool>
}

pub fn lint(document: &VirtNode, options: LintOptions) {

}

#[cfg(test)]
mod tests {
  use super::super::super::parser::*;
  use super::*;

  #[test]
  fn can_evaluate_a_style() {
    let source = "<style>div { color: red; } a, b { & c { color: blue }}</style><div></div>";    
    let evalu_info = __test__evaluate_pc_source(source).unwrap();
    lint(&evalu_info.preview, LintOptions {
      no_unused_css: Some(true)
    })
  }
}