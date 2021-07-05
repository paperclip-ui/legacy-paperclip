/*

TODO:

caniuse
a11y
/*lint-disable-next-line*/
enforce previews*
*/

use super::evaluator::EvalInfo;
use super::evaluator::{
  evaluate as evaluate_pc, EngineMode, __test__evaluate_source as __test__evaluate_pc_source,
};
use super::selector_match::find_one_matching_element;
use super::virt::Node as VirtNode;
use crate::base::ast::ExprSource;
use crate::core::diagnostics::{Diagnostic, DiagnosticInfo, DiagnosticLevel, DiagnosticSourceInfo};
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph};
use crate::core::vfs::VirtualFileSystem;
use crate::css::ast::{CSSObject, Rule};
use crate::css::runtime::virt::{CSSSheet, Rule as VirtRule};
use crate::pc::ast::PCObject;
use crate::pc::parser::parse;

pub struct LintOptions {
  no_unused_css: Option<bool>,

  // TODO: ["background-color", "padding", "background"]. Need to be contextually aware for cases like (background: #ab repeat)
  enforce_refs: Option<Vec<String>>,

  enforce_previews: Option<bool>,
}

struct Context {}

pub fn lint(
  eval_info: &EvalInfo,
  graph: &DependencyGraph,
  options: LintOptions,
) -> Vec<Diagnostic> {
  let mut notices: Vec<Diagnostic> = Vec::new();
  lint_css(eval_info, graph, &options, &mut notices);
  notices
}

fn lint_css(
  eval_info: &EvalInfo,
  graph: &DependencyGraph,
  options: &LintOptions,
  diagnostics: &mut Vec<Diagnostic>,
) {
  // TODO - media rules and such
  lint_css_rules(
    &eval_info.sheet.rules,
    &eval_info.preview,
    graph,
    options,
    diagnostics,
  )
}

fn lint_css_rules(
  rules: &Vec<VirtRule>,
  document: &VirtNode,
  graph: &DependencyGraph,
  options: &LintOptions,
  diagnostics: &mut Vec<Diagnostic>,
) {
  // TODO - media rules and such
  for rule in rules {
    match rule {
      VirtRule::Style(style_rule) => {
        if options.no_unused_css == Some(true)
          && !style_rule.exported
          && find_one_matching_element(&style_rule.selector_text, document) == None
        {
          let expr_option = graph.get_expression_by_id(&style_rule.source_id);

          if let Some((uri, expr)) = expr_option {
            // check for :global
            if let PCObject::CSSObject(cssobject) = &expr {
              if let CSSObject::Rule(rule) = cssobject {
                if let Rule::Style(style) = rule {
                  if style.selector.is_global() {
                    continue;
                  }
                }
              }
            }

            diagnostics.push(Diagnostic::new_warning(
              "Unused style rule",
              DiagnosticInfo::UnusedStyleRule(DiagnosticSourceInfo::new(
                style_rule.source_id.as_str(),
                Some(&ExprSource::new(uri, expr.get_location().clone())),
              )),
            ));
          }
        }
      }
      VirtRule::Media(media) => lint_css_rules(&media.rules, document, graph, options, diagnostics),
      // TODO - look for keyframes
      _ => {}
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
    let (eval_info, graph) = __test__evaluate_pc_source(source);
    let notices = lint(
      &eval_info.unwrap(),
      &graph,
      LintOptions {
        no_unused_css: Some(true),
        enforce_refs: None,
        enforce_previews: None,
      },
    );
    assert_eq!(notices.len(), 1);
  }

  #[test]
  fn generates_warnings_for_various_cases() {
    let cases = [
      (
        "<style>@media screen and (max-width: 100px) { div { color: red; }}</style><a />",
        0,
      ),
      // ignore exports
      ("<style>@export { div { color: orange; }}</style><a />", 0),
      // ignore globals
      (
        "<style>:global(div) { color: orange; } a { color: red; }</style><a />",
        0,
      ),
    ];

    for (source, warning_count) in cases.iter() {
      let (eval_info, graph) = __test__evaluate_pc_source(source);
      let notices = lint(
        &eval_info.unwrap(),
        &graph,
        LintOptions {
          no_unused_css: Some(true),
          enforce_refs: None,
          enforce_previews: None,
        },
      );
      assert_eq!(notices.len(), *warning_count);
    }
  }
}
