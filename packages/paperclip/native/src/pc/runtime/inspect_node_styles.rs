use super::evaluator::EvalInfo;
use super::evaluator::{
  evaluate as evaluate_pc, EngineMode, __test__evaluate_source as __test__evaluate_pc_source,
};
use super::selector_match::get_selector_text_matching_sub_selector;
use crate::core::graph::DependencyGraph;
use crate::css::ast::Selector;
use crate::css::runtime::specificity::get_selector_text_specificity;
use crate::css::runtime::virt::{Rule, StyleRule};
use serde::Serialize;
use std::cmp::Ordering;
use std::collections::BTreeMap;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleDeclarationInfo {
  pub name: String,

  // TODO - should parse this out and provide AST here. For
  // MVP this is fine however.
  pub value: String,

  // true / false if being used. Needs to be here in case of !important flag
  pub active: bool,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct MediaInfo {
  pub condition_text: String,
  pub active: bool,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleRuleInfo {
  // computed style info. TODO: include scopes for this?
  pub selector_text: String,

  // AST source information
  pub source_id: String,
  pub media: Option<MediaInfo>,

  declarations: Vec<StyleDeclarationInfo>,

  // need to do docs for this
  pub specificity: i32,

  // index in the document
  pub index: i32,
}

impl StyleRuleInfo {
  pub fn new(
    rule: &StyleRule,
    media: Option<MediaInfo>,
    specificity: i32,
    index: i32,
  ) -> StyleRuleInfo {
    StyleRuleInfo {
      selector_text: rule.selector_text.to_string(),
      media: media.clone(),
      source_id: rule.source_id.clone(),
      declarations: vec![],
      specificity: specificity,
      index,
    }
  }
}

pub struct InspectionOptions {
  screen_width: Option<i32>,
}

pub fn inspect_node_styles(
  element_path: &Vec<usize>,
  eval_info: &EvalInfo,
  graph: &DependencyGraph,
  options: &InspectionOptions,
) -> Vec<StyleRuleInfo> {
  let mut matching_selectors: Vec<(&StyleRule, i32, i32, Option<MediaInfo>)> = vec![];

  let style_rules = get_eval_info_selectors(eval_info, graph, options);

  let mut index = 0;

  for (style_rule, media_option) in style_rules {
    // TODO - matches should return some result instead of boolean
    if let Some(matching_sub_selector) = get_selector_text_matching_sub_selector(
      &style_rule.selector_text,
      element_path,
      &eval_info.preview,
    ) {
      matching_selectors.push((
        style_rule,
        get_selector_text_specificity(&matching_sub_selector),
        index,
        media_option.clone(),
      ));

      // items.push(StyleRuleInfo::new(
      //   style_rule,
      //   &matching_sub_selector,
      //   &media_option,
      //   index
      // ))
    }
    index += 1;
  }

  // sort by specificity & index
  matching_selectors.sort_by(|(_, a_s, a_i, _), (_, b_s, b_i, _)| {
    if a_s > b_s {
      return Ordering::Less;
    } else if a_i > b_i {
      return Ordering::Less;
    }
    return Ordering::Equal;
  });

  let mut declared: BTreeMap<String, bool> = BTreeMap::new();
  let mut importants: BTreeMap<String, bool> = BTreeMap::new();
  let mut items: Vec<StyleRuleInfo> = vec![];

  // next adding the style rule info + declarations and whether they're
  // active.
  for (rule, specificity, index, media) in matching_selectors {
    let mut style_info = StyleRuleInfo::new(&rule, media, specificity, index);

    for decl in &rule.style {
      let active = declared.get(&decl.name) == None;
      declared.insert(decl.name.to_string(), true);

      if decl.value.contains("!important") {
        importants.insert(decl.name.to_string(), true);
      }

      style_info.declarations.push(StyleDeclarationInfo {
        name: decl.name.to_string(),
        value: decl.value.to_string(),
        active,
      });
    }

    items.push(style_info);
  }

  /*
  TODO:

  - scan all style selectors loaded in eval info
  - include triggers for media queries
  - parse declaration values (AST code should be coming in from CSS)
  - need to sort based on selector priority!

  */

  items
}

fn get_eval_info_selectors<'a>(
  eval_info: &'a EvalInfo,
  graph: &'a DependencyGraph,
  options: &'a InspectionOptions,
) -> Vec<(&'a StyleRule, Option<MediaInfo>)> {
  let mut style_rules: Vec<(&'a StyleRule, Option<MediaInfo>)> = vec![];

  collect_style_rules(&mut style_rules, &eval_info.sheet.rules, None);

  style_rules
}

fn collect_style_rules<'a, 'b>(
  style_rules: &'b mut Vec<(&'a StyleRule, Option<MediaInfo>)>,
  rules: &'a Vec<Rule>,
  media: Option<MediaInfo>,
) {
  for rule in rules {
    match rule {
      Rule::Style(style) => {
        style_rules.push((&style, media.clone()));
      }
      Rule::Media(media) => {
        collect_style_rules(
          style_rules,
          &media.rules,
          Some(MediaInfo {
            condition_text: media.condition_text.to_string(),

            // TODO - need to set this
            active: false,
          }),
        );
      }
      _ => {}
    }
  }
}

#[cfg(test)]
mod tests {
  use super::super::super::parser::*;
  use super::*;

  #[test]
  fn can_inspect_various_selectors() {
    let source = "<style>a > b { color: red; } b.b { color: blue !important; } b:active { color: red; } </style><a><b class='b' /></a>";
    let (eval_info, graph) = __test__evaluate_pc_source(source);
    let info = inspect_node_styles(
      &vec![0, 0],
      &eval_info.unwrap(),
      &graph,
      &InspectionOptions { screen_width: None },
    );
    println!("{:?}", info);
    assert_eq!(info.len(), 2);
  }
}
