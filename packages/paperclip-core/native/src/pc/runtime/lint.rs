/*

TODO:

- caniuse
- a11y
- /*lint-disable-next-line*/
- enforce previews*
- declaration linting
  - noImportant
*/

use super::evaluator::EvalInfo;
use super::evaluator::{evaluate as evaluate_pc, EngineMode, __test__evaluate_pc_code};
use super::selector_match::find_one_matching_element;
use super::virt::Node as VirtNode;
use crate::base::ast::{ExprSource, ExprTextSource, Range};
use serde::{Deserialize, Serialize};
// use crate::core::diagnostics::{Diagnostic, DiagnosticInfo, DiagnosticLevel, DiagnosticSourceInfo};
use crate::core::graph::DependencyGraph;
use crate::css::ast as css_ast;
use crate::css::runtime::virt::{
  CSSStyleProperty as VirtCSSStyleProperty, Rule as VirtRule, StyleRule as VirtStyleRule,
};
use crate::pc::ast as pc_ast;

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

#[derive(Debug, PartialEq, Serialize, Deserialize, Clone)]
pub struct LintOptions {
  #[serde(rename = "noUnusedStyles")]
  pub no_unused_styles: Option<bool>,

  // TODO: ["background-color", "padding", "background"]. Need to be contextually aware for cases like (background: #ab repeat)
  #[serde(rename = "enforceVars")]
  pub enforce_vars: Option<Vec<String>>,

  pub enforce_previews: Option<bool>,
}

impl LintOptions {
  pub fn nil() -> LintOptions {
    LintOptions {
      no_unused_styles: None,
      enforce_vars: None,
      enforce_previews: None,
    }
  }
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
        lint_style_rule(style_rule, document, graph, options, diagnostics);
      }
      VirtRule::Media(media) => lint_css_rules(&media.rules, document, graph, options, diagnostics),
      // TODO - look for keyframes
      _ => {}
    }
  }
}

fn lint_style_rule(
  style_rule: &VirtStyleRule,
  document: &VirtNode,
  graph: &DependencyGraph,
  options: &LintOptions,
  diagnostics: &mut Vec<LintWarning>,
) {
  if options.no_unused_styles == Some(true) {
    lint_unused_style(style_rule, document, graph, options, diagnostics);
  }

  if let Some(enforce_vars) = &options.enforce_vars {
    for decl in &style_rule.style {
      lint_style_declaration(decl, graph, enforce_vars, diagnostics);
    }
  }
}

fn lint_style_declaration(
  decl: &VirtCSSStyleProperty,
  graph: &DependencyGraph,
  enforce_vars: &Vec<String>,
  diagnostics: &mut Vec<LintWarning>,
) {
  if !enforce_vars.contains(&decl.name) {
    return;
  }

  // dirty check to ensure that vars are used. This
  // covers most of our bases. Will need to make this more precise at
  // some point.
  if decl.value.contains("var(")
    || decl.value == "0"
    || decl.value == "0px"
    || decl.value.contains("transparent")
    || decl.value.contains("inherit")
    || decl.value.contains("initial")
  {
    return;
  }

  let expr_option = graph.get_expression_by_id(&decl.source_id);

  if let Some((uri, expr)) = expr_option {
    let expr_range: &Range = expr.get_range();

    diagnostics.push(LintWarning::UnusedStyleRule(LintWarningInfo::new(
      "Variable needs to be used here",
      &ExprSource::new(
        decl.source_id.as_str(),
        Some(&ExprTextSource::new(uri, expr_range.clone())),
      ),
    )));
  }
}

fn lint_unused_style(
  style_rule: &VirtStyleRule,
  document: &VirtNode,
  graph: &DependencyGraph,
  options: &LintOptions,
  diagnostics: &mut Vec<LintWarning>,
) {
  if !style_rule.exported && find_one_matching_element(&style_rule.selector_text, document) == None
  {
    let expr_option = graph.get_expression_by_id(&style_rule.source_id);

    if let Some((uri, expr)) = expr_option {
      let mut expr_range: &Range = expr.get_range();

      // check for :global
      if let pc_ast::Expression::CSS(cssobject) = &expr {
        if let css_ast::Expression::StyleRule(style) = cssobject {
          expr_range = style.selector.get_range();
          if style.selector.is_global() {
            return;
          }
        }

        if let css_ast::Expression::Rule(rule) = cssobject {
          if let css_ast::Rule::Style(style) = rule {
            expr_range = style.selector.get_range();
            if style.selector.is_global() {
              return;
            }
          }
        }
      }

      diagnostics.push(LintWarning::UnusedStyleRule(LintWarningInfo::new(
        "Unused style rule in preview",
        &ExprSource::new(
          style_rule.source_id.as_str(),
          Some(&ExprTextSource::new(uri, expr_range.clone())),
        ),
      )));
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
    let (eval_info, graph) = __test__evaluate_pc_code(source);
    let notices = lint(
      &eval_info.unwrap(),
      &graph,
      LintOptions {
        no_unused_styles: Some(true),
        enforce_vars: None,
        enforce_previews: None,
      },
    );
    assert_eq!(notices.len(), 1);
  }

  #[test]
  fn generates_warnings_for_various_cases() {
    let cases = [
      (
        "<style>@media screen and (max-width: 100px) { div { width: 100px; }}</style><a />",
        1,
      ),
      // ignore exports
      ("<style>@export { div { width: 100px; }}</style><a />", 0),
      // ignore globals
      (
        "<style>:global(div) { width: 100px; } a { width: 100px; }</style><a />",
        0,
      ),
      // warning for magic colors
      (
        "<style>:global(div) { color: orange; } a { color: red; }</style><a />",
        2,
      ),
      (
        "<style>:global(div) { color: var(--some-color); }</style><a />",
        0,
      ),
      ("<style>:global(div) { padding: initial; }</style><a />", 0),
      ("<style>:global(div) { padding: inherit; }</style><a />", 0),
      ("<style>:global(div) { padding: 0; }</style><a />", 0),
      ("<style>:global(div) { padding: 0px; }</style><a />", 0),
    ];

    for (source, warning_count) in cases.iter() {
      let (eval_info, graph) = __test__evaluate_pc_code(source);
      let notices = lint(
        &eval_info.unwrap(),
        &graph,
        LintOptions {
          no_unused_styles: Some(true),
          enforce_vars: Some(vec![
            "padding".to_string(),
            "font-family".to_string(),
            "color".to_string(),
            "background".to_string(),
          ]),
          enforce_previews: None,
        },
      );
      assert_eq!(notices.len(), *warning_count);
    }
  }
}
