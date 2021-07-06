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
use crate::base::ast::{ExprSource, ExprTextSource, Location};
use serde::Serialize;
// use crate::core::diagnostics::{Diagnostic, DiagnosticInfo, DiagnosticLevel, DiagnosticSourceInfo};
use crate::core::eval::DependencyEvalInfo;
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph};
use crate::core::vfs::VirtualFileSystem;
use crate::css::ast::{CSSObject, Rule};
use crate::css::runtime::virt::{CSSSheet, Rule as VirtRule};
use crate::pc::ast::PCObject;
use crate::pc::parser::parse;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct LintWarningInfo {
  message: String,
  source: ExprSource,
}

impl LintWarningInfo {
  pub fn new<'a>(message: &'a str, source: &ExprSource) -> LintWarningInfo {
    LintWarningInfo {
      message: message.to_string(),
      source: source.clone(),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "warningKind")]
pub enum LintWarning {
  UnusedStyleRule(LintWarningInfo),
}

pub struct LintOptions {
  pub no_unused_css: Option<bool>,

  // TODO: ["background-color", "padding", "background"]. Need to be contextually aware for cases like (background: #ab repeat)
  pub enforce_refs: Option<Vec<String>>,

  pub enforce_previews: Option<bool>,
}

pub fn lint(
  eval_info: &EvalInfo,
  graph: &DependencyGraph,
  options: LintOptions,
) -> Vec<LintWarning> {
  let mut notices: Vec<LintWarning> = Vec::new();
  lint_css(eval_info, graph, &options, &mut notices);
  notices
}

fn lint_css(
  eval_info: &EvalInfo,
  graph: &DependencyGraph,
  options: &LintOptions,
  diagnostics: &mut Vec<LintWarning>,
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
  diagnostics: &mut Vec<LintWarning>,
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
            let mut expr_location: &Location = expr.get_location();

            // check for :global
            if let PCObject::CSSObject(cssobject) = &expr {
              if let CSSObject::StyleRule(style) = cssobject {
                expr_location = style.selector.get_location();
                if style.selector.is_global() {
                  continue;
                }
              }

              if let CSSObject::Rule(rule) = cssobject {
                if let Rule::Style(style) = rule {
                  expr_location = style.selector.get_location();
                  if style.selector.is_global() {
                    continue;
                  }
                }
              }
            }

            diagnostics.push(LintWarning::UnusedStyleRule(LintWarningInfo::new(
              "Unused style rule in preview",
              &ExprSource::new(
                style_rule.source_id.as_str(),
                Some(&ExprTextSource::new(uri, expr_location.clone())),
              ),
            )));
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
