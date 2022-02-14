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
use super::selector_match::{
  element_matches_selector_text_edge, get_selector_text_matching_sub_selector,
};
use crate::core::eval::DependencyEvalInfo;
use crate::core::graph::DependencyGraph;
use crate::css::ast as css_ast;
use crate::css::declaration_value_ast;
use crate::css::declaration_value_parser;
use crate::css::runtime::media_match::media_matches;
use crate::css::runtime::specificity::get_selector_text_specificity;
use crate::css::runtime::virt::{CSSStyleProperty, Rule, StyleRule};
use crate::engine::engine::__test__evaluate_pc_files;
use crate::pc::runtime::virt as pc_virt;
use crate::script::runtime::virt as script_virt;
use cached::proc_macro::cached;
use cached::SizedCache;
use serde::Serialize;
use std::collections::{BTreeMap, HashSet};
/*

inherited props:

    border-collapse
    border-spacing
    caption-side
    color
    cursor
    direction
    empty-cells
    font-family
    font-size
    font-style
    font-variant
    font-weight
    font-size-adjust
    font-stretch
    font
    letter-spacing
    line-height
    list-style-image
    list-style-position
    list-style-type
    list-style
    orphans
    quotes
    tab-size
    text-align
    text-align-last
    text-decoration-color
    text-indent
    text-justify
    text-shadow
    text-transform
    visibility
    white-space
    widows
    word-break
    word-spacing
    word-wrap


*/

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleDeclarationInfo {
  #[serde(rename = "sourceId")]
  pub source_id: String,

  pub name: String,
  pub value: Option<declaration_value_ast::Root>,

  #[serde(rename = "rawValue")]
  pub raw_value: String,

  // true / false if being used. Needs to be here in case of !important flag
  pub active: bool,
}

impl StyleDeclarationInfo {
  pub fn new(source: &CSSStyleProperty) -> StyleDeclarationInfo {
    StyleDeclarationInfo {
      source_id: source.source_id.to_string(),
      name: source.name.to_string(),
      raw_value: source.value.to_string(),
      value: declaration_value_parser::parse(source.value.as_str(), "").map(|value| {
        Some(value)
      }).unwrap_or(None),
      active: true,
    }
  }
  pub fn important(&self) -> bool {
    if let Some(value) = &self.value {
      value.important
    } else {
      false
    }
  }
  pub fn overrides(&mut self, other: &mut StyleDeclarationInfo) {
    if self.inherits() {
      return;
    }

    if other.important() && !self.important() {
      self.active = false;
    } else {
      other.active = false;
    }
  }
  pub fn cascades(&self) -> bool {
    let inherited_prop_names = [
      "border-collapse",
      "border-spacing",
      "caption-side",
      "color",
      "cursor",
      "direction",
      "empty-cells",
      "font-family",
      "font-size",
      "font-style",
      "font-variant",
      "font-weight",
      "font-size-adjust",
      "font-stretch",
      "font",
      "letter-spacing",
      "line-height",
      "list-style-image",
      "list-style-position",
      "list-style-type",
      "list-style",
      "orphans",
      "quotes",
      "tab-size",
      "text-align",
      "text-align-last",
      "text-decoration-color",
      "text-indent",
      "text-justify",
      "text-shadow",
      "text-transform",
      "visibility",
      "white-space",
      "widows",
      "word-break",
      "word-spacing",
      "word-wrap",
    ];
    inherited_prop_names.contains(&self.name.as_str()) || self.name.starts_with("--")
  }
  pub fn inherits(&self) -> bool {
    self.raw_value == "inherit"
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
  pub inherited: bool,

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
      inherited: rule.selector_text == ":root",
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

  pub fn as_inherited(&self) -> StyleRuleInfo {
    let mut clone = self.clone();
    clone.inherited = true;
    for decl in &mut clone.declarations {
      if !decl.cascades() {
        decl.active = false;
      }
    }
    clone
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
  pub fn contains_cascading_declarations(&self) -> bool {
    for decl in &self.declarations {
      if decl.cascades() {
        return true;
      }
    }
    return false;
  }
  pub fn contains_declaration(&self, name: &String) -> bool {
    self.declarations.iter().any(|decl| &decl.name == name)
  }
  pub fn can_inherit_from_style_rule(&self, other: &StyleRuleInfo) -> bool {
    for declaration in &self.declarations {
      if declaration.inherits() && other.contains_declaration(&declaration.name) {
        return true;
      }
    }

    return false;
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
    for existing_rule in &mut self.style_rules {
      if existing_rule.source_id == rule.source_id {
        return;
      }
    }

    let mut insert_index: usize = 0;

    // first find the right index
    for (i, existing_rule) in &mut self.style_rules.iter().enumerate() {
      // always higher priority for styles applied to element
      if !rule.inherited && existing_rule.inherited {
        break;
      }

      // higher priority = lower index
      if rule.specificity >= existing_rule.specificity && rule.inherited == existing_rule.inherited
      {
        break;
      }

      // keep climbing until we have a higher specificity or same
      insert_index = i + 1;
    }

    // starting at the insertion index, override all existing declarations
    if rule.media_active() {
      for i in 0..insert_index {
        let existing_rule = self.style_rules.get_mut(i).unwrap();
        existing_rule.overrides(&mut rule);
      }

      for i in insert_index..self.style_rules.len() {
        let existing_rule = self.style_rules.get_mut(i).unwrap();
        rule.overrides(existing_rule);
      }
    }

    self.style_rules.insert(insert_index, rule);
  }

  // pub fn insert_inherited_style_rule(&mut self, rule: &StyleRuleInfo) {
  //   // skip dupes
  //   for style_rule in &mut self.style_rules {
  //     if style_rule.source_id == rule.source_id {
  //       return;
  //     }
  //   }

  //   let mut new_rule = rule.as_inherited();

  //   for style_rule in &mut self.style_rules {
  //     style_rule.overrides(&mut new_rule);
  //   }

  //   self.style_rules.push(new_rule);
  // }

  pub fn can_inherit_from_style_rule(&self, other_rule: &StyleRuleInfo) -> bool {
    if other_rule.contains_cascading_declarations() {
      return true;
    }

    for rule in &self.style_rules {
      if rule.can_inherit_from_style_rule(other_rule) {
        return true;
      }
    }
    return false;
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct InspectionOptions {
  pub screen_width: Option<u32>,
  pub include_inherited: bool,
}

pub fn inspect_node_styles(
  element_path: &Vec<usize>,
  document_uri: &String,
  all_eval_info: &BTreeMap<String, DependencyEvalInfo>,
  graph: &DependencyGraph,
  options: &InspectionOptions,
) -> NodeInspectionInfo {
  let mut options = options.clone();
  options.screen_width =
    get_node_frame_width(element_path, document_uri, all_eval_info).or(options.screen_width);

  let mut inspection_info =
    inspect_local_node_styles(element_path, document_uri, all_eval_info, graph, &options);

  if options.include_inherited {
    add_inherited_properties(
      &mut inspection_info,
      element_path,
      document_uri,
      all_eval_info,
      graph,
      &options,
    );
  }

  inspection_info
}

pub fn inspect_local_node_styles(
  element_path: &Vec<usize>,
  document_uri: &String,
  all_eval_info: &BTreeMap<String, DependencyEvalInfo>,
  graph: &DependencyGraph,
  options: &InspectionOptions,
) -> NodeInspectionInfo {
  let mut inspection_info = NodeInspectionInfo::new();

  if let Some(main_eval_info) = get_pc_info(document_uri, all_eval_info) {
    // need to start with imported CSS because document styles will override these
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

    add_inspection_info(
      &mut inspection_info,
      element_path,
      main_eval_info,
      document_uri,
      all_eval_info,
      graph,
      options,
    );
  }

  inspection_info
}

fn get_node_frame_width(
  element_path: &Vec<usize>,
  document_uri: &String,
  all_eval_info: &BTreeMap<String, DependencyEvalInfo>,
) -> Option<u32> {
  if let Some(main_eval_info) = get_pc_info(document_uri, all_eval_info) {
    if let Some(frame_index) = element_path.get(0) {
      get_frame_width(*frame_index, main_eval_info)
    } else {
      None
    }
  } else {
    None
  }
}

fn get_frame_width(index: usize, eval_info: &PCEvalInfo) -> Option<u32> {
  eval_info
    .preview
    .get_children()
    .and_then(|children| children.get(index))
    .and_then(|node| {
      if let pc_virt::Node::Element(element) = node {
        element.get_annotation_property_value("frame", "width")
      } else {
        None
      }
    })
    .and_then(|width| {
      if let script_virt::Value::Number(number) = width {
        Some(number.value as u32)
      } else {
        None
      }
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
  if let Some(pc_virt::Node::Element(element)) =
    &main_eval_info.preview.get_descendent(element_path)
  {
    if let Some(info) = all_eval_info.get(uri) {
      let style_rules = get_eval_info_selectors(info, graph, options);

      for (style_rule, media_option) in style_rules {
        // if !element_matches_selector_text_edge(&style_rule.selector_text, element) || true {
        //   continue;
        // }

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
}

fn add_inherited_properties(
  inspection_info: &mut NodeInspectionInfo,
  element_path: &Vec<usize>,
  document_uri: &String,
  all_eval_info: &BTreeMap<String, DependencyEvalInfo>,
  graph: &DependencyGraph,
  options: &InspectionOptions,
) {
  let mut cpath = element_path.clone();

  for _i in 0..(element_path.len() - 1) {
    // easier than slice, just as effective
    cpath.pop();
    let ancestor_inspecto_info =
      inspect_local_node_styles(&cpath, document_uri, all_eval_info, graph, options);

    for style_rule in &ancestor_inspecto_info.style_rules {
      if inspection_info.can_inherit_from_style_rule(style_rule) {
        inspection_info.insert_style_rule(style_rule.as_inherited());
      }
    }
  }
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

#[cfg(test)]
mod tests {
  use super::super::super::parser::*;
  use super::*;

  // #[test]
  fn adds_inherited_props() {
    let source = r#"
    
    <style>
    :global(:root) {
      --color: red;
    }
    :global(.theme) {
      --color: blue;
    }
  </style>
  <div class="theme">
    <div>
      <style>
        color: var(--color);
      </style>
    </div>
  </div>
    "#;

    test_pc_code(
      source,
      vec![0, 0],
      InspectionOptions {
        screen_width: None,
        include_inherited: true,
      },
      NodeInspectionInfo {
        style_rules: vec![],
      },
    );
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
