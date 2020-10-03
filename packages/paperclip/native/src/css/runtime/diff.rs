use super::mutation;
use super::virt;
use std::collections::HashMap;

pub struct Context {
  mutations: Vec<mutation::Mutation>,
}

pub fn diff(a: &virt::CSSSheet, b: &virt::CSSSheet) -> Vec<mutation::Mutation> {
  let mut mutations: Vec<mutation::Mutation> = vec![];
  let mut context = Context { mutations };

  diff_rules(&a.rules, &b.rules, &mut context);

  context.mutations
}

pub fn diff_rules(old_rules: &Vec<virt::Rule>, new_rules: &Vec<virt::Rule>, context: &mut Context) {
  for new_rule in new_rules {}
}

fn diff_rule(
  old_rule: &virt::Rule,
  new_rule: &virt::Rule,
  index: usize,
  path: &Vec<usize>,
  context: &mut Context,
) {
  if let virt::Rule::Style(old_style_rule) = old_rule {
    if let virt::Rule::Style(new_style_rule) = new_rule {
      return diff_style_rule(old_style_rule, new_style_rule, context);
    }
  }

  context.mutations.push(mutation::Mutation {
    path: vec![],
    action: mutation::Action::ReplaceRule(mutation::ReplaceRule {
      index,
      rule: new_rule.clone(),
    }),
  })
}

fn diff_style_rule(old_rule: &virt::StyleRule, new_rule: &virt::StyleRule, context: &mut Context) {}

fn get_rule_indices(rules: &Vec<virt::Rule>) -> HashMap<String, Vec<usize>> {
  let mut indices: HashMap<String, Vec<usize>> = HashMap::new();

  for (i, rule) in rules.iter().enumerate() {
    let id = get_rule_id(rule);
    let existing = indices.get_mut(&id);
    if let Some(idx) = existing {
      idx.push(i);
    } else {
      indices.insert(id, vec![i]);
    }
  }

  indices
}

fn get_rule_id(rule: &virt::Rule) -> String {
  match rule {
    virt::Rule::Style(style) => style.selector_text.to_string(),
    virt::Rule::Media(media) => format!("@media{}", media.condition_text),
    virt::Rule::Keyframes(keyframes) => format!("@keyframes{}", keyframes.name),
    virt::Rule::FontFace(_) => format!("@fontface"),
    virt::Rule::Charset(_) => format!("@charset"),
    virt::Rule::Page(_) => format!("@page"),
    virt::Rule::Supports(_) => format!("@supports"),
    virt::Rule::Namespace(_) => format!("@namespace"),
    virt::Rule::Document(_) => format!("@document"),
  }
}
