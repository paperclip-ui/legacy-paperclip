use super::evaluator::EvalInfo;
use super::evaluator::{
  evaluate as evaluate_pc, EngineMode, __test__evaluate_source as __test__evaluate_pc_source,
};
use super::selector_match::find_one_matching_element;
use super::virt::Node as VirtNode;
use crate::base::lint::{Notice, NoticeLevel};
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph};
use crate::core::vfs::VirtualFileSystem;
use crate::css::runtime::virt::{CSSSheet, Rule};
use crate::pc::parser::parse;

pub struct LintOptions {
  no_unused_css: Option<bool>,
}

struct Context {}

pub fn lint(eval_info: &EvalInfo, options: LintOptions) -> Vec<Notice> {
  let mut notices: Vec<Notice> = Vec::new();
  lint_css(eval_info, options, &mut notices);
  notices
}

fn lint_css(eval_info: &EvalInfo, options: LintOptions, notices: &mut Vec<Notice>) {
  println!("{:?}", eval_info);

  // TODO - media rules and such
  for rule in &eval_info.sheet.rules {
    if let Rule::Style(style_rule) = rule {
      println!("{}", style_rule.selector_text);
      if find_one_matching_element(&style_rule.selector_text, &eval_info.preview) == None {
        notices.push(Notice::new_warning("Unused style rule", style_rule.source_id.to_string()));
      }
    }
  }
}

#[cfg(test)]
mod tests {
  use super::super::super::parser::*;
  use super::*;

  #[test]
  fn generates_warning_when_simple_style_not_found() {
    let source = "<style>a { color: red; }</style><div></div>";
    let eval_info = __test__evaluate_pc_source(source).unwrap();
    let notices = lint(
      &eval_info,
      LintOptions {
        no_unused_css: Some(true),
      },
    );
    assert_eq!(notices.len(), 1);
  }
}
