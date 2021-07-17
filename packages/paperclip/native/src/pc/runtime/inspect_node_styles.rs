/*

TODO:

- media match
- compute selector scopes
  - global, or from specific doc
- scan styles from other files
*/

use super::evaluator::EvalInfo;
use super::evaluator::{
  evaluate as evaluate_pc, EngineMode, __test__evaluate_source as __test__evaluate_pc_source,
};
use super::selector_match::get_selector_text_matching_sub_selector;
use crate::core::graph::DependencyGraph;
use crate::css::ast::Selector;
use crate::css::runtime::media_match::media_matches;
use crate::css::runtime::specificity::get_selector_text_specificity;
use crate::css::runtime::virt::{CSSStyleProperty, Rule, StyleRule};
use serde::Serialize;
use std::cmp::Ordering;
use std::collections::{BTreeMap, HashSet};

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleDeclarationInfo {
  pub name: String,

  // TODO - should parse this out and provide AST here. For
  // MVP this is fine however.
  pub value: String,

  // true / false if being used. Needs to be here in case of !important flag
  pub active: bool,
}

impl StyleDeclarationInfo {
  pub fn new(source: &CSSStyleProperty) -> StyleDeclarationInfo {
    StyleDeclarationInfo {
      name: source.name.to_string(),
      value: source.value.to_string(),
      active: true,
    }
  }
  pub fn important(&self) -> bool {
    self.value.contains(" !important")
  }
  pub fn overrides(&mut self, other: &mut StyleDeclarationInfo) {
    if other.important() && !self.important() {
      self.active = false;
    } else {
      other.active = false;
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct MediaInfo {
  #[serde(rename = "conditionText")]
  pub condition_text: String,
  pub active: bool,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleRuleInfo {
  #[serde(rename = "selectorText")]
  pub selector_text: String,

  // before, after
  #[serde(rename = "pseudoElementName")]
  pub pseudo_element_name: Option<String>,

  // AST source information
  #[serde(rename = "sourceId")]
  pub source_id: String,
  pub media: Option<MediaInfo>,

  declarations: Vec<StyleDeclarationInfo>,

  // need to do docs for this
  pub specificity: i32,
}

impl StyleRuleInfo {
  pub fn new(
    rule: &StyleRule,
    media: Option<MediaInfo>,
    matching_sub_selector: &Selector,
  ) -> StyleRuleInfo {
    let mut rule_info = StyleRuleInfo {
      selector_text: rule.selector_text.to_string(),
      media: media.clone(),
      source_id: rule.source_id.clone(),
      declarations: vec![],
      pseudo_element_name: matching_sub_selector.get_pseudo_element_name(),
      specificity: get_selector_text_specificity(&matching_sub_selector),
    };

    for declaration in &rule.style {
      rule_info.push_declaration(StyleDeclarationInfo::new(declaration));
    }

    return rule_info;
  }
  pub fn push_declaration(&mut self, mut declaration: StyleDeclarationInfo) {
    if let Some(existing_decl) = self.get_declaration(&declaration.name) {
      declaration.overrides(existing_decl);
    }

    self.declarations.push(declaration);
  }
  pub fn get_declaration(&mut self, name: &String) -> Option<&mut StyleDeclarationInfo> {
    for existing_decl in &mut self.declarations {
      if &existing_decl.name == name {
        return Some(existing_decl);
      }
    }
    return None;
  }
  pub fn overrides(&mut self, other: &mut StyleRuleInfo) {
    if self.pseudo_element_name != other.pseudo_element_name {
      return;
    }

    for other_decl in &mut other.declarations {
      if let Some(self_decl) = self.get_declaration(&other_decl.name) {
        self_decl.overrides(other_decl);
      }
    }
  }
  pub fn media_active(&self) -> bool {
    if let Some(media) = &self.media {
      return media.active;
    }
    return true;
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct NodeInspectionInfo {
  pub style_rules: Vec<StyleRuleInfo>,
}

impl NodeInspectionInfo {
  pub fn new() -> NodeInspectionInfo {
    NodeInspectionInfo {
      style_rules: vec![],
    }
  }
  pub fn insert_style_rule(&mut self, mut rule: StyleRuleInfo) {
    let mut insert_index: usize = 0;

    // first find the right index
    for (i, existing_rule) in &mut self.style_rules.iter().enumerate() {
      // higher priority = lower index
      if rule.specificity >= existing_rule.specificity {
        break;
      }

      // keep climbing until we have a higher specificity or same
      insert_index = i + 1;
    }

    // starting at the insertion index, override all existing declarations
    if rule.media_active() {
      for i in insert_index..self.style_rules.len() {
        let existing_rule = self.style_rules.get_mut(i).unwrap();
        rule.overrides(existing_rule);
      }
    }

    self.style_rules.insert(insert_index, rule);
  }
}

pub struct InspectionOptions {
  screen_width: Option<u32>,
}

pub fn inspect_node_styles(
  element_path: &Vec<usize>,
  eval_info: &EvalInfo,
  graph: &DependencyGraph,
  options: &InspectionOptions,
) -> NodeInspectionInfo {
  let mut matching_selectors: Vec<(&StyleRule, i32, i32, Option<MediaInfo>)> = vec![];

  let style_rules = get_eval_info_selectors(eval_info, graph, options);
  let mut inspection_info = NodeInspectionInfo::new();

  for (style_rule, media_option) in style_rules {
    // TODO - matches should return some result instead of boolean
    if let Some(matching_sub_selector) = get_selector_text_matching_sub_selector(
      &style_rule.selector_text,
      element_path,
      &eval_info.preview,
    ) {
      let rule = StyleRuleInfo::new(style_rule, media_option.clone(), &matching_sub_selector);
      inspection_info.insert_style_rule(rule);
    }
  }

  /*
  TODO:

  - scan all style selectors loaded in eval info
  - include triggers for media queries
  - parse declaration values (AST code should be coming in from CSS)
  - need to sort based on selector priority!

  */

  inspection_info
}

fn get_eval_info_selectors<'a>(
  eval_info: &'a EvalInfo,
  graph: &'a DependencyGraph,
  options: &'a InspectionOptions,
) -> Vec<(&'a StyleRule, Option<MediaInfo>)> {
  let mut style_rules: Vec<(&'a StyleRule, Option<MediaInfo>)> = vec![];

  collect_style_rules(&mut style_rules, &eval_info.sheet.rules, None, options);

  style_rules
}

fn collect_style_rules<'a, 'b>(
  style_rules: &'b mut Vec<(&'a StyleRule, Option<MediaInfo>)>,
  rules: &'a Vec<Rule>,
  media: Option<MediaInfo>,
  options: &InspectionOptions,
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
            condition_text: media.condition_text.trim().to_string(),

            // TODO - need to set this
            active: options
              .screen_width
              .and_then(|screen_width| Some(media_matches(&media.condition_text, screen_width)))
              .unwrap_or(false),
          }),
          options,
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
  fn can_inspect_a_simple_selector() {
    let source = r#"
      <style>
        a > b { color: red; }
      </style>
      <a><b class='b' /></a>
    "#;

    test_source(
      source,
      vec![0, 0],
      InspectionOptions { screen_width: None },
      NodeInspectionInfo {
        style_rules: vec![StyleRuleInfo {
          selector_text: "a._acb5fc82 > b._acb5fc82".to_string(),
          source_id: "0-1-1-1".to_string(),
          pseudo_element_name: None,
          media: None,
          declarations: vec![StyleDeclarationInfo {
            name: "color".to_string(),
            value: "red".to_string(),
            active: true,
          }],
          specificity: 4,
        }],
      },
    )
  }

  #[test]
  fn sets_first_declaration_as_inactive_if_overriden_in_same_rule() {
    let source = r#"
      <style>
        a > b { color: red; color: blue; }
      </style>
      <a><b class='b' /></a>
    "#;

    test_source(
      source,
      vec![0, 0],
      InspectionOptions { screen_width: None },
      NodeInspectionInfo {
        style_rules: vec![StyleRuleInfo {
          selector_text: "a._acb5fc82 > b._acb5fc82".to_string(),
          source_id: "0-1-1-1".to_string(),
          media: None,
          pseudo_element_name: None,
          declarations: vec![
            StyleDeclarationInfo {
              name: "color".to_string(),
              value: "red".to_string(),
              active: false,
            },
            StyleDeclarationInfo {
              name: "color".to_string(),
              value: "blue".to_string(),
              active: true,
            },
          ],
          specificity: 4,
        }],
      },
    )
  }

  #[test]
  fn sorts_style_rule_info_based_on_specificity() {
    let source = r#"
      <style>
        a b { color: red; }
        b.b.b { color: blue; }
      </style>
      <a><b class='b' /></a>
    "#;

    test_source(
      source,
      vec![0, 0],
      InspectionOptions { screen_width: None },
      NodeInspectionInfo {
        style_rules: vec![
          StyleRuleInfo {
            selector_text: "b[class].b[class].b._acb5fc82".to_string(),
            source_id: "0-1-1-2".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              name: "color".to_string(),
              value: "blue".to_string(),
              active: true,
            }],
            specificity: 6,
          },
          StyleRuleInfo {
            selector_text: "a._acb5fc82 b._acb5fc82".to_string(),
            source_id: "0-1-1-1".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              name: "color".to_string(),
              value: "red".to_string(),
              active: false,
            }],
            specificity: 4,
          },
        ],
      },
    )
  }

  #[test]
  fn important_props_get_prioity_in_other_style_rules() {
    let source = r#"
      <style>
        a b { color: red !important; }
        b.b.b { color: blue; }
      </style>
      <a><b class='b' /></a>
    "#;

    test_source(
      source,
      vec![0, 0],
      InspectionOptions { screen_width: None },
      NodeInspectionInfo {
        style_rules: vec![
          StyleRuleInfo {
            selector_text: "b[class].b[class].b._acb5fc82".to_string(),
            source_id: "0-1-1-2".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              name: "color".to_string(),
              value: "blue".to_string(),
              active: false,
            }],
            specificity: 6,
          },
          StyleRuleInfo {
            selector_text: "a._acb5fc82 b._acb5fc82".to_string(),
            source_id: "0-1-1-1".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              name: "color".to_string(),
              value: "red !important".to_string(),
              active: true,
            }],
            specificity: 4,
          },
        ],
      },
    )
  }

  #[test]
  fn if_two_importants_then_lower_index_wins() {
    let source = r#"
      <style>
        b.b.b { color: red !important; }
        b.b.b { color: blue !important; }
      </style>
      <a><b class='b' /></a>
    "#;

    test_source(
      source,
      vec![0, 0],
      InspectionOptions { screen_width: None },
      NodeInspectionInfo {
        style_rules: vec![
          StyleRuleInfo {
            selector_text: "b[class].b[class].b._acb5fc82".to_string(),
            source_id: "0-1-1-2".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              name: "color".to_string(),
              value: "blue !important".to_string(),
              active: true,
            }],
            specificity: 6,
          },
          StyleRuleInfo {
            selector_text: "b[class].b[class].b._acb5fc82".to_string(),
            source_id: "0-1-1-1".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              name: "color".to_string(),
              value: "red !important".to_string(),
              active: false,
            }],
            specificity: 6,
          },
        ],
      },
    )
  }

  #[test]
  fn pseudo_element_declarations_arent_touched() {
    let source = r#"
      <style>
        a { color: red; }
        a:before { color: blue; }
      </style>
      <a />
    "#;

    test_source(
      source,
      vec![0],
      InspectionOptions { screen_width: None },
      NodeInspectionInfo {
        style_rules: vec![
          StyleRuleInfo {
            selector_text: "a._acb5fc82:before".to_string(),
            source_id: "0-1-1-2".to_string(),
            media: None,
            pseudo_element_name: Some("before".to_string()),
            declarations: vec![StyleDeclarationInfo {
              name: "color".to_string(),
              value: "blue".to_string(),
              active: true,
            }],
            specificity: 3,
          },
          StyleRuleInfo {
            selector_text: "a._acb5fc82".to_string(),
            source_id: "0-1-1-1".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              name: "color".to_string(),
              value: "red".to_string(),
              active: true,
            }],
            specificity: 2,
          },
        ],
      },
    )
  }

  #[test]
  fn decl_is_overridden_if_shared_with_same_pseudo_element() {
    let source = r#"
      <style>
        a:before { color: red; }
        a:before { color: blue; }
      </style>
      <a />
    "#;

    test_source(
      source,
      vec![0],
      InspectionOptions { screen_width: None },
      NodeInspectionInfo {
        style_rules: vec![
          StyleRuleInfo {
            selector_text: "a._acb5fc82:before".to_string(),
            source_id: "0-1-1-2".to_string(),
            media: None,
            pseudo_element_name: Some("before".to_string()),
            declarations: vec![StyleDeclarationInfo {
              name: "color".to_string(),
              value: "blue".to_string(),
              active: true,
            }],
            specificity: 3,
          },
          StyleRuleInfo {
            selector_text: "a._acb5fc82:before".to_string(),
            source_id: "0-1-1-1".to_string(),
            media: None,
            pseudo_element_name: Some("before".to_string()),
            declarations: vec![StyleDeclarationInfo {
              name: "color".to_string(),
              value: "red".to_string(),
              active: false,
            }],
            specificity: 3,
          },
        ],
      },
    )
  }

  // #[test]
  fn activates_style_rule_if_media_matches() {
    let source = r#"
      <style>
        @media screen and (max-width: 400px) {
          a {
            color: red;
          }
        }
      </style>
      <a />
    "#;

    test_source(
      source,
      vec![0],
      InspectionOptions {
        screen_width: Some(100),
      },
      NodeInspectionInfo {
        style_rules: vec![StyleRuleInfo {
          selector_text: "a._acb5fc82".to_string(),
          source_id: "0-1-1-1".to_string(),
          media: Some(MediaInfo {
            condition_text: "screen and (max-width: 400px)".to_string(),
            active: true,
          }),
          pseudo_element_name: None,
          declarations: vec![StyleDeclarationInfo {
            name: "color".to_string(),
            value: "red".to_string(),
            active: true,
          }],
          specificity: 2,
        }],
      },
    )
  }

  fn test_source<'a>(
    source: &'a str,
    node_path: Vec<usize>,
    options: InspectionOptions,
    expected_info: NodeInspectionInfo,
  ) {
    let (eval_info, graph) = __test__evaluate_pc_source(source);
    let info = inspect_node_styles(
      &node_path,
      &eval_info.unwrap(),
      &graph,
      &InspectionOptions { screen_width: None },
    );
    assert_eq!(info, expected_info);
  }
}
