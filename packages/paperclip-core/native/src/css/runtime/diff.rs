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
  for (i, old_rule) in old_rules.iter().enumerate() {
    if let Some(new_rule) = new_rules.get(i) {
      diff_rule(old_rule, new_rule, i, &vec![], context)
    } else {
      context.mutations.push(mutation::Mutation {
        path: vec![],
        action: mutation::Action::DeleteRule(mutation::DeleteRule {
          index: new_rules.len(),
        }),
      });
    }
  }

  if new_rules.len() > old_rules.len() {
    for i in old_rules.len()..new_rules.len() {
      context.mutations.push(mutation::Mutation {
        path: vec![],
        action: mutation::Action::InsertRule(mutation::InsertRule {
          rule: new_rules.get(i).unwrap().clone(),
          index: i,
        }),
      })
    }
  }
}

fn diff_rule(
  old_rule: &virt::Rule,
  new_rule: &virt::Rule,
  index: usize,
  path: &Vec<usize>,
  context: &mut Context,
) {
  if old_rule == new_rule {
    return;
  }

  context.mutations.push(mutation::Mutation {
    path: vec![],
    action: mutation::Action::ReplaceRule(mutation::ReplaceRule {
      index,
      rule: new_rule.clone(),
    }),
  })
}

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
