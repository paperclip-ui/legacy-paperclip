use super::evaluator::EvalInfo;
use crate::core::graph::{DependencyGraph};
use crate::css::runtime::specificity::{get_selector_text_specificity};
use super::selector_match::{selector_text_matches_element};
use super::evaluator::{
  evaluate as evaluate_pc, EngineMode, __test__evaluate_source as __test__evaluate_pc_source,
};
use serde::Serialize;
use crate::css::runtime::virt::{Rule, StyleRule};

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleDeclarationInfo {
  pub name: String,

  // TODO - should parse this out and provide AST here. For 
  // MVP this is fine however.
  pub value: String,

  // true / false if being used. Needs to be here in case of !important flag
  pub active: bool
}


#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct MediaInfo {
  pub condition_text: String,
  pub active: bool
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
  pub specificity: i32
}

impl StyleRuleInfo {
  pub fn new(rule: &StyleRule, media: &Option<MediaInfo>) -> StyleRuleInfo {
    StyleRuleInfo {
      selector_text: rule.selector_text.to_string(),
      media: media.clone(),
      source_id: rule.source_id.clone(),
      declarations: vec![],
      specificity: get_selector_text_specificity(&rule.selector_text)
    }
  }
}

pub struct InspectionOptions {
  screen_width: Option<i32>
}

pub fn inspect_node_styles(
  element_path: &Vec<usize>,
  eval_info: &EvalInfo,
  graph: &DependencyGraph,
  options: &InspectionOptions
) -> Vec<StyleRuleInfo> {

  let mut items: Vec<StyleRuleInfo> = vec![];

  let style_rules = get_eval_info_selectors(eval_info, graph, options);

  println!("{:?}", style_rules);

  for (style_rule, media_option) in style_rules {
    if selector_text_matches_element(&style_rule.selector_text, element_path, &eval_info.preview) {
      items.push(StyleRuleInfo::new(style_rule, &media_option))
    }
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
  options: &'a InspectionOptions
) -> Vec<(&'a StyleRule, Option<MediaInfo>)> {
  let mut style_rules: Vec<(&'a StyleRule, Option<MediaInfo>)> = vec![];

  collect_style_rules(&mut style_rules, &eval_info.sheet.rules, None);

  style_rules
}

fn collect_style_rules<'a, 'b>(style_rules: &'b mut Vec<(&'a StyleRule, Option<MediaInfo>)>, rules: &'a Vec<Rule>, media: Option<MediaInfo>) {
  for rule in rules {
    match rule {
      Rule::Style(style) => {
        style_rules.push((&style, media.clone()));
      },
      Rule::Media(media) => {
        collect_style_rules(style_rules, &media.rules, Some(MediaInfo {
          condition_text: media.condition_text.to_string(),

          // TODO - need to set this
          active: false
        }));
      },
      _ => {}
    }
  }
}


#[cfg(test)]
mod tests {
  use super::super::super::parser::*;
  use super::*;

  #[test]
  fn can_return_inspection_info_on_a_simple_element() {
    let source = "<style>a { color: red; }</style><a></a>";
    let (eval_info, graph) = __test__evaluate_pc_source(source);
    let info = inspect_node_styles(
      &vec![0],
      &eval_info.unwrap(),
      &graph,
      &InspectionOptions {
        screen_width: None
      },
    );
    assert_eq!(info.len(), 1);
  }
}
