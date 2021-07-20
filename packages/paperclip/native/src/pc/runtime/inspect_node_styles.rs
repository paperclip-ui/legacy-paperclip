/*

TODO:

- media match
- compute selector scopes
  - global, or from specific doc
- scan styles from other files
*/

use super::evaluator::EvalInfo as PCEvalInfo;
use super::evaluator::{evaluate as evaluate_pc, EngineMode, __test__evaluate_pc_code};
use super::inspect_selector_info as iso;
use super::selector_match::get_selector_text_matching_sub_selector;
use crate::core::eval::DependencyEvalInfo;
use crate::core::graph::DependencyGraph;
use crate::css::ast as css_ast;
use crate::css::runtime::evaluator::EvalInfo as CSSEvalInfo;
use crate::css::runtime::media_match::media_matches;
use crate::css::runtime::specificity::get_selector_text_specificity;
use crate::css::runtime::virt::{CSSStyleProperty, Rule, StyleRule};
use crate::engine::engine::__test__evaluate_pc_files;
use serde::Serialize;
use std::cmp::Ordering;
use std::collections::{BTreeMap, HashSet};

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleDeclarationInfo {
  #[serde(rename = "sourceId")]
  pub source_id: String,

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
      source_id: source.source_id.to_string(),
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

  // info about the selector including scope stuff
  #[serde(rename = "selectorInfo")]
  pub selector_info: iso::Selector,

  // before, after
  #[serde(rename = "pseudoElementName")]
  pub pseudo_element_name: Option<String>,

  // AST source information
  #[serde(rename = "sourceId")]
  pub source_id: String,

  // keep this here because it'll likely be displayed to the user.
  #[serde(rename = "sourceUri")]
  pub source_uri: String,
  pub media: Option<MediaInfo>,

  declarations: Vec<StyleDeclarationInfo>,

  // need to do docs for this
  pub specificity: i32,
}

impl StyleRuleInfo {
  pub fn new(
    rule: &StyleRule,
    source_uri: &String,
    media: Option<MediaInfo>,
    matching_sub_selector: &css_ast::Selector,
    selector_info: iso::Selector,
  ) -> StyleRuleInfo {
    let mut rule_info = StyleRuleInfo {
      selector_text: rule.selector_text.to_string(),
      selector_info,
      source_uri: source_uri.to_string(),
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
  #[serde(rename = "styleRules")]
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

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct InspectionOptions {
  pub screen_width: Option<u32>,
}

pub fn inspect_node_styles(
  element_path: &Vec<usize>,
  document_uri: &String,
  all_eval_info: &BTreeMap<String, DependencyEvalInfo>,
  graph: &DependencyGraph,
  options: &InspectionOptions,
) -> NodeInspectionInfo {
  let mut inspection_info = NodeInspectionInfo::new();

  if let Some(main_eval_info) = get_pc_info(document_uri, all_eval_info) {
    add_inspection_info(
      &mut inspection_info,
      element_path,
      main_eval_info,
      document_uri,
      all_eval_info,
      graph,
      options,
    );

    for dep_uri in &main_eval_info.all_imported_sheet_uris {
      add_inspection_info(
        &mut inspection_info,
        element_path,
        main_eval_info,
        dep_uri,
        all_eval_info,
        graph,
        options,
      );
    }
  }

  inspection_info
}

fn get_pc_info<'a>(
  uri: &String,
  all_eval_info: &'a BTreeMap<String, DependencyEvalInfo>,
) -> Option<&'a PCEvalInfo> {
  all_eval_info.get(uri).and_then(|info| match info {
    DependencyEvalInfo::PC(pc) => Some(pc),
    _ => None,
  })
}

fn add_inspection_info(
  inspection_info: &mut NodeInspectionInfo,
  element_path: &Vec<usize>,
  main_eval_info: &PCEvalInfo,
  uri: &String,
  all_eval_info: &BTreeMap<String, DependencyEvalInfo>,
  graph: &DependencyGraph,
  options: &InspectionOptions,
) {
  if let Some(info) = all_eval_info.get(uri) {
    let style_rules = get_eval_info_selectors(info, graph, options);

    for (style_rule, media_option) in style_rules {
      // TODO - matches should return some result instead of boolean

      if let Some((matching_sub_selector, entire_selector)) =
        get_selector_text_matching_sub_selector(
          &style_rule.selector_text,
          element_path,
          &main_eval_info.preview,
        )
      {
        if let Ok(selector_info) = iso::Selector::from_ast(&entire_selector, graph) {
          let rule = StyleRuleInfo::new(
            style_rule,
            uri,
            media_option.clone(),
            &matching_sub_selector,
            selector_info,
          );
          inspection_info.insert_style_rule(rule);
        }
      }
    }
  }
}

fn get_eval_info_selectors<'a>(
  eval_info: &'a DependencyEvalInfo,
  graph: &'a DependencyGraph,
  options: &'a InspectionOptions,
) -> Vec<(&'a StyleRule, Option<MediaInfo>)> {
  let mut style_rules: Vec<(&'a StyleRule, Option<MediaInfo>)> = vec![];

  match eval_info {
    DependencyEvalInfo::PC(pc) => {
      collect_style_rules(&mut style_rules, &pc.sheet.rules, None, options);
    }
    DependencyEvalInfo::CSS(css) => {
      collect_style_rules(&mut style_rules, &css.sheet.rules, None, options);
    }
  }

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

// #[cfg(test)]
mod tests {
  use super::super::super::parser::*;
  use super::*;

  // #[test]
  fn can_inspect_a_simple_selector() {
    let source = r#"
      <style>
        a > b { color: red; }
      </style>
      <a><b class='b' /></a>
    "#;

    test_pc_code(
      source,
      vec![0, 0],
      InspectionOptions { screen_width: None },
      NodeInspectionInfo {
        style_rules: vec![StyleRuleInfo {
          selector_text: "a._acb5fc82 > b._acb5fc82".to_string(),
          selector_info: iso::Selector::Child(iso::BinarySelector {
            left: Box::new(iso::Selector::Combo(iso::GroupSelector {
              selectors: vec![
                iso::Selector::Element(iso::TargetSelector {
                  value: "a".to_string(),
                }),
                iso::Selector::Class(iso::ClassSelector {
                  value: "._acb5fc82".to_string(),
                  name: None,
                  scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                    id: "acb5fc82".to_string(),
                  })),
                }),
              ],
            })),
            right: Box::new(iso::Selector::Combo(iso::GroupSelector {
              selectors: vec![
                iso::Selector::Element(iso::TargetSelector {
                  value: "b".to_string(),
                }),
                iso::Selector::Class(iso::ClassSelector {
                  value: "._acb5fc82".to_string(),
                  name: None,
                  scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                    id: "acb5fc82".to_string(),
                  })),
                }),
              ],
            })),
          }),
          source_id: "0-1-1-1".to_string(),
          source_uri: "entry.pc".to_string(),
          pseudo_element_name: None,
          media: None,
          declarations: vec![StyleDeclarationInfo {
            source_id: "a".to_string(),
            name: "color".to_string(),
            value: "red".to_string(),
            active: true,
          }],
          specificity: 4,
        }],
      },
    )
  }

  // #[test]
  fn sets_first_declaration_as_inactive_if_overriden_in_same_rule() {
    let source = r#"
      <style>
        a > b { color: red; color: blue; }
      </style>
      <a><b class='b' /></a>
    "#;

    test_pc_code(
      source,
      vec![0, 0],
      InspectionOptions { screen_width: None },
      NodeInspectionInfo {
        style_rules: vec![StyleRuleInfo {
          selector_info: iso::Selector::Child(iso::BinarySelector {
            left: Box::new(iso::Selector::Combo(iso::GroupSelector {
              selectors: vec![
                iso::Selector::Element(iso::TargetSelector {
                  value: "a".to_string(),
                }),
                iso::Selector::Class(iso::ClassSelector {
                  value: "._acb5fc82".to_string(),
                  name: None,
                  scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                    id: "acb5fc82".to_string(),
                  })),
                }),
              ],
            })),
            right: Box::new(iso::Selector::Combo(iso::GroupSelector {
              selectors: vec![
                iso::Selector::Element(iso::TargetSelector {
                  value: "b".to_string(),
                }),
                iso::Selector::Class(iso::ClassSelector {
                  value: "._acb5fc82".to_string(),
                  name: None,
                  scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                    id: "acb5fc82".to_string(),
                  })),
                }),
              ],
            })),
          }),
          selector_text: "a._acb5fc82 > b._acb5fc82".to_string(),
          source_id: "0-1-1-1".to_string(),
          source_uri: "entry.pc".to_string(),
          media: None,
          pseudo_element_name: None,
          declarations: vec![
            StyleDeclarationInfo {
              source_id: "a".to_string(),
              name: "color".to_string(),
              value: "red".to_string(),
              active: false,
            },
            StyleDeclarationInfo {
              source_id: "a".to_string(),
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

  // #[test]
  fn sorts_style_rule_info_based_on_specificity() {
    let source = r#"
      <style>
        a b { color: red; }
        b.b.b { color: blue; }
      </style>
      <a><b class='b' /></a>
    "#;

    test_pc_code(
      source,
      vec![0, 0],
      InspectionOptions { screen_width: None },
      NodeInspectionInfo {
        style_rules: vec![
          StyleRuleInfo {
            selector_text: "b[class].b[class].b._acb5fc82".to_string(),
            selector_info: iso::Selector::Combo(iso::GroupSelector {
              selectors: vec![
                iso::Selector::Element(iso::TargetSelector {
                  value: "b".to_string(),
                }),
                iso::Selector::Class(iso::ClassSelector {
                  name: Some("b".to_string()),
                  value: "._acb5fc82_b".to_string(),
                  scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                    id: "acb5fc82".to_string(),
                  })),
                }),
                iso::Selector::Class(iso::ClassSelector {
                  name: Some("b".to_string()),
                  value: "._acb5fc82_b".to_string(),
                  scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                    id: "acb5fc82".to_string(),
                  })),
                }),
                iso::Selector::Class(iso::ClassSelector {
                  name: None,
                  value: "._acb5fc82".to_string(),
                  scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                    id: "acb5fc82".to_string(),
                  })),
                }),
              ],
            }),
            source_id: "0-1-1-2".to_string(),
            source_uri: "entry.pc".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              source_id: "a".to_string(),
              name: "color".to_string(),
              value: "blue".to_string(),
              active: true,
            }],
            specificity: 6,
          },
          StyleRuleInfo {
            selector_text: "a._acb5fc82 b._acb5fc82".to_string(),
            selector_info: iso::Selector::Descendent(iso::BinarySelector {
              left: Box::new(iso::Selector::Combo(iso::GroupSelector {
                selectors: vec![
                  iso::Selector::Element(iso::TargetSelector {
                    value: "a".to_string(),
                  }),
                  iso::Selector::Class(iso::ClassSelector {
                    name: None,
                    value: "._acb5fc82".to_string(),
                    scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                      id: "acb5fc82".to_string(),
                    })),
                  }),
                ],
              })),
              right: Box::new(iso::Selector::Combo(iso::GroupSelector {
                selectors: vec![
                  iso::Selector::Element(iso::TargetSelector {
                    value: "b".to_string(),
                  }),
                  iso::Selector::Class(iso::ClassSelector {
                    name: None,
                    value: "._acb5fc82".to_string(),
                    scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                      id: "acb5fc82".to_string(),
                    })),
                  }),
                ],
              })),
            }),
            source_id: "0-1-1-1".to_string(),
            source_uri: "entry.pc".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              source_id: "a".to_string(),
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

  // #[test]
  fn important_props_get_prioity_in_other_style_rules() {
    let source = r#"
      <style>
        a b { color: red !important; }
        b.b.b { color: blue; }
      </style>
      <a><b class='b' /></a>
    "#;

    test_pc_code(
      source,
      vec![0, 0],
      InspectionOptions { screen_width: None },
      NodeInspectionInfo {
        style_rules: vec![
          StyleRuleInfo {
            selector_text: "b[class].b[class].b._acb5fc82".to_string(),
            selector_info: iso::Selector::Element(iso::TargetSelector {
              value: "a".to_string(),
            }),
            source_id: "0-1-1-2".to_string(),
            source_uri: "entry.pc".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              source_id: "a".to_string(),
              name: "color".to_string(),
              value: "blue".to_string(),
              active: false,
            }],
            specificity: 6,
          },
          StyleRuleInfo {
            selector_text: "a._acb5fc82 b._acb5fc82".to_string(),
            selector_info: iso::Selector::Element(iso::TargetSelector {
              value: "a".to_string(),
            }),
            source_id: "0-1-1-1".to_string(),
            source_uri: "entry.pc".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              source_id: "a".to_string(),
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

  // #[test]
  fn if_two_importants_then_lower_index_wins() {
    let source = r#"
      <style>
        b.b.b { color: red !important; }
        b.b.b { color: blue !important; }
      </style>
      <a><b class='b' /></a>
    "#;

    test_pc_code(
      source,
      vec![0, 0],
      InspectionOptions { screen_width: None },
      NodeInspectionInfo {
        style_rules: vec![
          StyleRuleInfo {
            selector_text: "b._acb5fc82_b._acb5fc82_b._acb5fc82".to_string(),
            selector_info: iso::Selector::Combo(iso::GroupSelector {
              selectors: vec![
                iso::Selector::Element(iso::TargetSelector {
                  value: "b".to_string(),
                }),
                iso::Selector::Class(iso::ClassSelector {
                  name: Some("b".to_string()),
                  value: "._acb5fc82_b".to_string(),
                  scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                    id: "acb5fc82".to_string(),
                  })),
                }),
                iso::Selector::Class(iso::ClassSelector {
                  name: Some("b".to_string()),
                  value: "._acb5fc82_b".to_string(),
                  scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                    id: "acb5fc82".to_string(),
                  })),
                }),
                iso::Selector::Class(iso::ClassSelector {
                  name: Some("b".to_string()),
                  value: "._acb5fc82_b".to_string(),
                  scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                    id: "acb5fc82".to_string(),
                  })),
                }),
              ],
            }),
            source_id: "0-1-1-2".to_string(),
            source_uri: "entry.pc".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              source_id: "a".to_string(),
              name: "color".to_string(),
              value: "blue !important".to_string(),
              active: true,
            }],
            specificity: 6,
          },
          StyleRuleInfo {
            selector_text: "b[class].b[class].b._acb5fc82".to_string(),
            selector_info: iso::Selector::Element(iso::TargetSelector {
              value: "a".to_string(),
            }),
            source_id: "0-1-1-1".to_string(),
            source_uri: "entry.pc".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              source_id: "a".to_string(),
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

  // #[test]
  fn pseudo_element_declarations_arent_touched() {
    let source = r#"
      <style>
        a { color: red; }
        a:before { color: blue; }
      </style>
      <a />
    "#;

    test_pc_code(
      source,
      vec![0],
      InspectionOptions { screen_width: None },
      NodeInspectionInfo {
        style_rules: vec![
          StyleRuleInfo {
            selector_text: "a._acb5fc82:before".to_string(),
            selector_info: iso::Selector::Combo(iso::GroupSelector {
              selectors: vec![
                iso::Selector::Element(iso::TargetSelector {
                  value: "a".to_string(),
                }),
                iso::Selector::Class(iso::ClassSelector {
                  name: None,
                  value: "._acb5fc82".to_string(),
                  scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                    id: "acb5fc82".to_string(),
                  })),
                }),
                iso::Selector::PseudoElement(iso::TargetSelector {
                  value: ":before".to_string(),
                }),
              ],
            }),
            source_id: "0-1-1-2".to_string(),
            source_uri: "entry.pc".to_string(),
            media: None,
            pseudo_element_name: Some("before".to_string()),
            declarations: vec![StyleDeclarationInfo {
              source_id: "a".to_string(),
              name: "color".to_string(),
              value: "blue".to_string(),
              active: true,
            }],
            specificity: 3,
          },
          StyleRuleInfo {
            selector_text: "a._acb5fc82".to_string(),
            selector_info: iso::Selector::Combo(iso::GroupSelector {
              selectors: vec![
                iso::Selector::Element(iso::TargetSelector {
                  value: "a".to_string(),
                }),
                iso::Selector::Class(iso::ClassSelector {
                  name: None,
                  value: "._acb5fc82".to_string(),
                  scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                    id: "acb5fc82".to_string(),
                  })),
                }),
              ],
            }),
            source_id: "0-1-1-1".to_string(),
            source_uri: "entry.pc".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              source_id: "a".to_string(),
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

  // #[test]
  fn decl_is_overridden_if_shared_with_same_pseudo_element() {
    let source = r#"
      <style>
        a:before { color: red; }
        a:before { color: blue; }
      </style>
      <a />
    "#;

    test_pc_code(
      source,
      vec![0],
      InspectionOptions { screen_width: None },
      NodeInspectionInfo {
        style_rules: vec![
          StyleRuleInfo {
            selector_text: "a._acb5fc82:before".to_string(),
            selector_info: iso::Selector::Combo(iso::GroupSelector {
              selectors: vec![
                iso::Selector::Element(iso::TargetSelector {
                  value: "a".to_string(),
                }),
                iso::Selector::Class(iso::ClassSelector {
                  name: None,
                  value: "._acb5fc82".to_string(),
                  scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                    id: "acb5fc82".to_string(),
                  })),
                }),
                iso::Selector::PseudoElement(iso::TargetSelector {
                  value: ":before".to_string(),
                }),
              ],
            }),
            source_id: "0-1-1-2".to_string(),
            source_uri: "entry.pc".to_string(),
            media: None,
            pseudo_element_name: Some("before".to_string()),
            declarations: vec![StyleDeclarationInfo {
              source_id: "a".to_string(),
              name: "color".to_string(),
              value: "blue".to_string(),
              active: true,
            }],
            specificity: 3,
          },
          StyleRuleInfo {
            selector_text: "a._acb5fc82:before".to_string(),
            selector_info: iso::Selector::Combo(iso::GroupSelector {
              selectors: vec![
                iso::Selector::Element(iso::TargetSelector {
                  value: "a".to_string(),
                }),
                iso::Selector::Class(iso::ClassSelector {
                  name: None,
                  value: "._acb5fc82".to_string(),
                  scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                    id: "acb5fc82".to_string(),
                  })),
                }),
                iso::Selector::PseudoElement(iso::TargetSelector {
                  value: ":before".to_string(),
                }),
              ],
            }),
            source_id: "0-1-1-1".to_string(),
            source_uri: "entry.pc".to_string(),
            media: None,
            pseudo_element_name: Some("before".to_string()),
            declarations: vec![StyleDeclarationInfo {
              source_id: "a".to_string(),
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
  fn ignores_media_rule_if_media_doesnt_match() {
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

    test_pc_code(
      source,
      vec![0],
      InspectionOptions {
        screen_width: Some(600),
      },
      NodeInspectionInfo {
        style_rules: vec![StyleRuleInfo {
          selector_text: "a._acb5fc82".to_string(),
          selector_info: iso::Selector::Combo(iso::GroupSelector {
            selectors: vec![
              iso::Selector::Element(iso::TargetSelector {
                value: "a".to_string(),
              }),
              iso::Selector::Class(iso::ClassSelector {
                name: None,
                value: "._acb5fc82".to_string(),
                scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                  id: "acb5fc82".to_string(),
                })),
              }),
            ],
          }),
          source_id: "0-1-1-1".to_string(),
          source_uri: "entry.pc".to_string(),
          media: Some(MediaInfo {
            condition_text: "screen and (max-width: 400px)".to_string(),
            active: false,
          }),
          pseudo_element_name: None,
          declarations: vec![StyleDeclarationInfo {
            source_id: "a".to_string(),
            name: "color".to_string(),
            value: "red".to_string(),
            active: true,
          }],
          specificity: 2,
        }],
      },
    )
  }

  // #[test]
  fn activates_media_if_screen_matches() {
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

    test_pc_code(
      source,
      vec![0],
      InspectionOptions {
        screen_width: Some(100),
      },
      NodeInspectionInfo {
        style_rules: vec![StyleRuleInfo {
          selector_text: "a._acb5fc82".to_string(),
          selector_info: iso::Selector::Combo(iso::GroupSelector {
            selectors: vec![
              iso::Selector::Element(iso::TargetSelector {
                value: "a".to_string(),
              }),
              iso::Selector::Class(iso::ClassSelector {
                name: None,
                value: "._acb5fc82".to_string(),
                scope: Some(iso::SelectorScope::Document(iso::SelectorScopeInfo {
                  id: "acb5fc82".to_string(),
                })),
              }),
            ],
          }),
          source_id: "0-1-1-1".to_string(),
          source_uri: "entry.pc".to_string(),
          media: Some(MediaInfo {
            condition_text: "screen and (max-width: 400px)".to_string(),
            active: true,
          }),
          pseudo_element_name: None,
          declarations: vec![StyleDeclarationInfo {
            source_id: "a".to_string(),
            name: "color".to_string(),
            value: "red".to_string(),
            active: true,
          }],
          specificity: 2,
        }],
      },
    )
  }

  // #[test]
  fn gathers_inspected_styles_from_other_files() {
    let mut files: BTreeMap<String, String> = BTreeMap::new();
    files.insert(
      "entry.pc".to_string(),
      r"
      <import src='dep.pc' inject-styles />
      <style>
        .item {
          background: red;
        }
      </style>
      <div className='item'>
        <style>
          color: blue;
        </style>
        Hello world
      </div>
    "
      .to_string(),
    );

    files.insert(
      "dep.pc".to_string(),
      r"
      <style>
        @export {
          .item {
            && {
              color: red;
            }
          }
          :global(div) {
            color: red;
          }
        }
      </style>
    "
      .to_string(),
    );

    test_files(
      files,
      vec![0],
      InspectionOptions {
        screen_width: Some(100),
      },
      NodeInspectionInfo {
        style_rules: vec![
          StyleRuleInfo {
            selector_text: "[class]._pub-bbfa9a83_item[class]._pub-bbfa9a83_item".to_string(),
            selector_info: iso::Selector::Element(iso::TargetSelector {
              value: "a".to_string(),
            }),
            source_id: "0-2-1-1".to_string(),
            source_uri: "dep.pc".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              source_id: "a".to_string(),
              name: "color".to_string(),
              value: "red".to_string(),
              active: true,
            }],
            specificity: 4,
          },
          StyleRuleInfo {
            selector_text: "._c782daaa._c782daaa".to_string(),
            selector_info: iso::Selector::Element(iso::TargetSelector {
              value: "a".to_string(),
            }),
            source_id: "c782daaa".to_string(),
            source_uri: "entry.pc".to_string(),
            media: None,
            pseudo_element_name: None,
            declarations: vec![StyleDeclarationInfo {
              source_id: "a".to_string(),
              name: "color".to_string(),
              value: "blue".to_string(),
              active: false,
            }],
            specificity: 2,
          },
        ],
      },
    )
  }

  fn test_pc_code<'a>(
    source: &'a str,
    node_path: Vec<usize>,
    options: InspectionOptions,
    expected_info: NodeInspectionInfo,
  ) {
    let (eval_info, graph) = __test__evaluate_pc_code(source);
    let mut eval_info_map: BTreeMap<String, DependencyEvalInfo> = BTreeMap::new();
    eval_info_map.insert(
      "entry.pc".to_string(),
      DependencyEvalInfo::PC(eval_info.unwrap()),
    );
    let info = inspect_node_styles(
      &node_path,
      &"entry.pc".to_string(),
      &eval_info_map,
      &graph,
      &options,
    );
    assert_eq!(info, expected_info);
  }

  fn test_files<'a>(
    files: BTreeMap<String, String>,
    node_path: Vec<usize>,
    options: InspectionOptions,
    expected_info: NodeInspectionInfo,
  ) {
    let (eval_info, graph) = __test__evaluate_pc_files(files, "entry.pc");
    let info = inspect_node_styles(
      &node_path,
      &"entry.pc".to_string(),
      &eval_info,
      &graph,
      &options,
    );
    assert_eq!(info, expected_info);
  }
}
