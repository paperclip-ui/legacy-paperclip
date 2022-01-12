use super::mutation;
use super::virt;
use std::collections::HashMap;

pub struct Context {
  mutations: Vec<mutation::Mutation>,
}

pub fn diff(a: &virt::CSSSheet, b: &virt::CSSSheet) -> Vec<mutation::Mutation> {
  let mutations: Vec<mutation::Mutation> = vec![];
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
