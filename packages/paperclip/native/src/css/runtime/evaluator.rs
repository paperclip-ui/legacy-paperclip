use super::super::ast;
use super::export::{Exports, MixinExport};
use super::virt;
use crate::base::runtime::RuntimeError;
use crate::core::vfs::VirtualFileSystem;
use regex::Regex;
use std::collections::HashMap;

pub struct Context<'a> {
  scope: &'a str,
  vfs: &'a VirtualFileSystem,
  uri: &'a String,
  imports: &'a HashMap<String, Exports>,
  exports: Exports,
  all_rules: Vec<virt::Rule>,
}

pub struct EvalInfo {
  pub sheet: virt::CSSSheet,
  pub exports: Exports,
}

pub fn evaluate<'a>(
  expr: &ast::Sheet,
  uri: &'a String,
  scope: &'a str,
  vfs: &'a VirtualFileSystem,
  imports: &'a HashMap<String, Exports>,
) -> Result<EvalInfo, RuntimeError> {
  let mut context = Context {
    scope,
    uri,
    vfs,
    imports,
    exports: Exports::new(),
    all_rules: vec![],
  };
  for rule in &expr.rules {
    evaluate_rule(&rule, &mut context)?;
  }
  Ok(EvalInfo {
    sheet: virt::CSSSheet {
      rules: context.all_rules,
    },
    exports: context.exports,
  })
}

fn evaluate_rule(rule: &ast::Rule, context: &mut Context) -> Result<(), RuntimeError> {
  match rule {
    ast::Rule::Charset(charset) => {
      context
        .all_rules
        .push(virt::Rule::Charset(charset.to_string()));
    }
    ast::Rule::Mixin(mixin) => {
      evaluate_mixin_rule(mixin, context)?;
    }
    ast::Rule::Namespace(namespace) => {
      context
        .all_rules
        .push(virt::Rule::Namespace(namespace.to_string()));
    }
    ast::Rule::Export(export) => {
      evaluate_export_rule(export, context)?;
    }
    ast::Rule::FontFace(rule) => {
      context
        .all_rules
        .push(evaluate_font_family_rule(rule, context)?);
    }
    ast::Rule::Media(rule) => {
      context.all_rules.push(evaluate_media_rule(rule, context)?);
    }
    ast::Rule::Style(rule) => {
      evaluate_style_rule(rule, &"".to_string(), context)?;
    }
    ast::Rule::Keyframes(rule) => {
      context
        .all_rules
        .push(evaluate_keyframes_rule(rule, context)?);
    }
    ast::Rule::Supports(rule) => {
      context
        .all_rules
        .push(evaluate_supports_rule(rule, context)?);
    }
    ast::Rule::Document(rule) => {
      context
        .all_rules
        .push(evaluate_document_rule(rule, context)?);
    }
    ast::Rule::Page(rule) => {
      context.all_rules.push(evaluate_page_rule(rule, context)?);
    }
  };

  Ok(())
}

pub fn evaluate_style_rules<'a>(
  rules: &Vec<ast::StyleRule>,

  parent_selector_text: &String,
  context: &mut Context,
) -> Result<(), RuntimeError> {
  for rule in rules {
    evaluate_style_rule2(&rule, parent_selector_text, context)?;
  }
  Ok(())
}

// pub fn evaluate_child_style_rules<'a>(
//   prefix: &String,
//   rules: &Vec<ast::StyleRule>,
//   context: &mut Context,
// ) -> Result<(), RuntimeError> {
//   for rule in rules {
//     evaluate_child_style_rule(&prefix, &rule, context)?;
//   }
//   Ok(())
// }
// pub fn evaluate_child_style_rule<'a>(
//   parent_selector_text: &String,
//   expr: &ast::StyleRule,
//   context: &mut Context,
// ) -> Result<(), RuntimeError> {

//   for selector in &expr.selectors {
//     let postfix = if let Some(postfix_selector) = &selector.selector {
//       stringify_element_selector(postfix_selector, true, parent_selector_text, context)
//     } else {
//       "".to_string()
//     };
//     let selector_text = format!("{}{}{}", parent_selector_text, selector.connector, postfix).to_string();
//     let child_prefix = selector_text.clone();
//     let style = evaluate_style_declarations(&expr.declarations, context)?;
//     let main_rule = virt::StyleRule {
//       selector_text,
//       style,
//     };

//     context.all_rules.push(virt::Rule::Style(main_rule));

//     evaluate_child_style_rules(&child_prefix, &expr.children, context)?;
//   }

//   Ok(())
// }

fn evaluate_font_family_rule(
  font_family: &ast::FontFaceRule,
  context: &Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::FontFace(virt::FontFaceRule {
    style: evaluate_style_declarations(&font_family.declarations, context)?,
  }))
}

fn evaluate_media_rule(
  rule: &ast::ConditionRule,

  context: &Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Media(evaluate_condition_rule(rule, context)?))
}

fn evaluate_supports_rule(
  rule: &ast::ConditionRule,

  context: &Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Supports(evaluate_condition_rule(
    rule, context,
  )?))
}
fn evaluate_page_rule(
  rule: &ast::ConditionRule,

  context: &Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Page(evaluate_condition_rule(rule, context)?))
}

fn evaluate_document_rule(
  rule: &ast::ConditionRule,

  context: &Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Document(evaluate_condition_rule(
    rule, context,
  )?))
}

fn evaluate_condition_rule(
  rule: &ast::ConditionRule,

  context: &Context,
) -> Result<virt::ConditionRule, RuntimeError> {
  let mut child_context = Context {
    scope: context.scope,
    uri: context.uri,
    vfs: context.vfs,
    all_rules: vec![],
    imports: context.imports,
    exports: context.exports.clone(),
  };

  evaluate_style_rules(&rule.rules, &"".to_string(), &mut child_context)?;

  Ok(virt::ConditionRule {
    name: rule.name.to_string(),
    condition_text: rule.condition_text.to_string(),
    rules: child_context.all_rules,
  })
}

fn evaluate_keyframes_rule(
  rule: &ast::KeyframesRule,
  context: &Context,
) -> Result<virt::Rule, RuntimeError> {
  let mut rules = vec![];

  for rule in &rule.rules {
    rules.push(evaluate_keyframe_rule(rule, context)?);
  }

  Ok(virt::Rule::Keyframes(virt::KeyframesRule {
    name: format!("_{}_{}", context.scope, rule.name.to_string()),
    rules,
  }))
}

fn evaluate_keyframe_rule(
  rule: &ast::KeyframeRule,
  context: &Context,
) -> Result<virt::KeyframeRule, RuntimeError> {
  let mut style = evaluate_style_declarations(&rule.declarations, context)?;
  Ok(virt::KeyframeRule {
    key: rule.key.to_string(),
    style,
  })
}

fn evaluate_style_declarations<'a>(
  declarations: &Vec<ast::Declaration>,
  context: &Context,
) -> Result<Vec<virt::CSSStyleProperty>, RuntimeError> {
  let mut style = vec![];
  for property in declarations {
    match property {
      ast::Declaration::KeyValue(kv) => {
        style.push(evaluate_style_key_value_declaration(kv, context)?);
      }
      ast::Declaration::Include(inc) => {
        let mut imp_mixins: HashMap<String, MixinExport> = HashMap::new();

        for mixin_path in &inc.mixins {
          let mixin_context_option: Option<&HashMap<String, MixinExport>> =
            if mixin_path.parts.len() == 2 {
              if let Some(imp) = context.imports.get(&mixin_path.parts.first().unwrap().name) {
                for (key, imp_mixin) in &imp.mixins {
                  if key == &mixin_path.parts.last().unwrap().name {
                    if imp_mixin.public {
                      imp_mixins.insert(key.to_string(), imp_mixin.clone());
                    } else {
                      return Err(RuntimeError::new(
                        "This mixin is private.".to_string(),
                        context.uri,
                        &mixin_path.parts.last().unwrap().location,
                      ));
                    }
                  }
                }
                Some(&imp_mixins)
              } else {
                None
              }
            } else if mixin_path.parts.len() == 1 {
              Some(&context.exports.mixins)
            } else {
              None
            };

          if let Some(mixin_context) = mixin_context_option {
            let mixin_decls_option = mixin_context.get(&mixin_path.parts.last().unwrap().name);
            if let Some(mixin_decls) = mixin_decls_option {
              style.extend(mixin_decls.declarations.clone());
            } else {
              return Err(RuntimeError::new(
                "Reference not found.".to_string(),
                context.uri,
                &mixin_path.parts.last().unwrap().location,
              ));
            }
          } else {
            return Err(RuntimeError::new(
              "Reference not found.".to_string(),
              context.uri,
              &mixin_path.parts.first().unwrap().location,
            ));
          }
        }
      }
    }
  }
  Ok(style)
}

fn evaluate_style_rule(
  expr: &ast::StyleRule,

  parent_selector_text: &String,
  context: &mut Context,
) -> Result<(), RuntimeError> {
  evaluate_style_rule2(expr, parent_selector_text, context)?;
  Ok(())
}

fn evaluate_export_rule(expr: &ast::ExportRule, context: &mut Context) -> Result<(), RuntimeError> {
  let mut exports = Exports::new();

  for rule in &expr.rules {
    evaluate_rule(rule, context);

    match rule {
      ast::Rule::Mixin(mixin) => {
        let mut export = context.exports.mixins.remove(&mixin.name.value).unwrap();
        export.public = true;
        context
          .exports
          .mixins
          .insert(mixin.name.value.to_string(), export);
      }
      _ => {}
    }
  }

  context.exports.extend(&exports);

  Ok(())
}
fn evaluate_mixin_rule(expr: &ast::MixinRule, context: &mut Context) -> Result<(), RuntimeError> {
  let declarations = evaluate_style_declarations(&expr.declarations, context)?;

  if None == context.exports.mixins.get(&expr.name.value) {
    context.exports.mixins.insert(
      expr.name.value.to_string(),
      MixinExport {
        declarations,
        public: false,
      },
    );
  } else {
    return Err(RuntimeError::new(
      "This mixin is already declared in the upper scope.".to_string(),
      context.uri,
      &expr.name.location,
    ));
  }

  Ok(())
}

fn evaluate_style_rule2(
  expr: &ast::StyleRule,

  parent_selector_text: &String,
  context: &mut Context,
) -> Result<(), RuntimeError> {
  let style = evaluate_style_declarations(&expr.declarations, &context)?;
  let selector_text =
    stringify_element_selector(&expr.selector, true, parent_selector_text, true, &context);

  let main_style_rule = virt::StyleRule {
    selector_text: selector_text,
    style,
  };

  let mut is_global_selector = false;

  let target_selector = if let ast::Selector::Global(selector) = &expr.selector {
    is_global_selector = true;
    &selector.selector
  } else {
    &expr.selector
  };

  if let ast::Selector::Group(group) = &target_selector {
    context.all_rules.push(virt::Rule::Style(main_style_rule));
    for selector in &group.selectors {
      let selector_text2 = stringify_element_selector(
        &selector,
        !is_global_selector,
        parent_selector_text,
        true,
        &context,
      );

      evaluate_style_rules(&expr.children, &selector_text2, context)?;
      // evaluate_child_style_rules(&selector_text2, &expr.children, context)?;
    }
  } else {
    let child_rule_prefix = main_style_rule.selector_text.clone();
    context.all_rules.push(virt::Rule::Style(main_style_rule));
    // evaluate_child_style_rules(&child_rule_prefix, &expr.children, context)?;

    evaluate_style_rules(&expr.children, &child_rule_prefix, context)?;
  }

  Ok(())
}

fn stringify_optional_selector(
  selector: &Option<Box<ast::Selector>>,

  include_prefix: bool,
  parent_selector_text: &String,
  alt: &String,
  context: &Context,
) -> String {
  if let Some(target) = &selector {
    stringify_element_selector(target, true, parent_selector_text, true, context)
  } else {
    alt.to_string()
  }
}

fn stringify_nestable_selector(
  selector: &ast::Selector,

  include_scope: bool,
  parent_selector_text: &String,
  context: &Context,
) -> String {
  stringify_element_selector(selector, include_scope, parent_selector_text, true, context)
  // if parent_selector_text.len() > 0 {
  //   format!("{} {}", parent_selector_text, stringify_element_selector(selector, include_scope, parent_selector_text, context))
  // } else {
  // }
}

fn stringify_element_selector(
  selector: &ast::Selector,

  include_scope: bool,
  parent_selector_text: &String,
  include_prefix: bool,
  context: &Context,
) -> String {
  let scope_selector = if include_scope {
    format!("[data-pc-{}]", context.scope)
  } else {
    "".to_string()
  };

  let prefix = if include_prefix && parent_selector_text.len() > 0 {
    format!("{} ", parent_selector_text)
  } else {
    "".to_string()
  };

  let scoped_selector_text = match selector {
    ast::Selector::AllSelector => format!("{}", scope_selector),
    ast::Selector::None => "".to_string(),
    ast::Selector::Class(selector) => {
      if include_scope {
        format!("{}._{}_{}", prefix, context.scope, selector.class_name)
      } else {
        format!("{}.{}", prefix, selector.class_name)
      }
    }
    ast::Selector::Id(selector) => format!("{}#{}{}", prefix, selector.id, scope_selector),
    ast::Selector::Element(selector) => {
      format!("{}{}{}", prefix, selector.tag_name, scope_selector)
    }
    ast::Selector::PseudoElement(selector) => {
      if selector.name == "root" {
        format!("{}{}", selector.separator, selector.name)
      } else {
        format!(
          "{}{}{}{}",
          prefix,
          stringify_optional_selector(
            &selector.target,
            false,
            parent_selector_text,
            &scope_selector,
            context
          ),
          selector.separator,
          selector.name
        )
      }
    }
    ast::Selector::PseudoParamElement(selector) => format!(
      "{}:{}({})",
      stringify_optional_selector(
        &selector.target,
        include_prefix,
        parent_selector_text,
        &scope_selector,
        context
      ),
      selector.name,
      selector.param
    ),
    ast::Selector::Attribute(selector) => {
      format!("{}{}{}", prefix, selector.to_string(), scope_selector)
    }
    ast::Selector::Not(selector) => format!(
      "{}{}:not({})",
      prefix,
      scope_selector,
      stringify_element_selector(
        &selector.selector,
        include_scope,
        parent_selector_text,
        false,
        context
      )
    ),
    ast::Selector::Global(selector) => format!(
      "{}",
      stringify_element_selector(
        &selector.selector,
        false,
        parent_selector_text,
        include_prefix,
        context
      )
    ),

    // need to trim in case parent is None
    ast::Selector::Descendent(selector) => format!(
      "{} {}",
      stringify_element_selector(
        &selector.parent,
        include_scope,
        parent_selector_text,
        include_prefix,
        context
      ),
      stringify_element_selector(
        &selector.descendent,
        include_scope,
        parent_selector_text,
        false,
        context
      )
    )
    .trim()
    .to_string(),
    ast::Selector::Child(selector) => format!(
      "{} > {}",
      stringify_element_selector(
        &selector.parent,
        include_scope,
        parent_selector_text,
        include_prefix,
        context
      ),
      stringify_element_selector(
        &selector.child,
        include_scope,
        parent_selector_text,
        false,
        context
      )
    ),
    ast::Selector::Adjacent(selector) => format!(
      "{} + {}",
      stringify_element_selector(
        &selector.selector,
        include_scope,
        parent_selector_text,
        include_prefix,
        context
      ),
      stringify_element_selector(
        &selector.next_sibling_selector,
        include_scope,
        parent_selector_text,
        false,
        context
      )
    ),
    ast::Selector::Sibling(selector) => format!(
      "{} ~ {}",
      stringify_element_selector(
        &selector.selector,
        include_scope,
        parent_selector_text,
        include_prefix,
        context
      ),
      stringify_element_selector(
        &selector.sibling_selector,
        include_scope,
        parent_selector_text,
        false,
        context
      )
    ),
    ast::Selector::Group(selector) => {
      let text: Vec<String> = (&selector.selectors)
        .into_iter()
        .map(|child| {
          stringify_nestable_selector(child, include_scope, parent_selector_text, context)
        })
        .collect();
      text.join(", ")
    }
    ast::Selector::Combo(selector) => {
      let mut contains_classname = false;

      let text: Vec<String> = (&selector.selectors)
        .into_iter()
        .map(|child| {
          if let &ast::Selector::Class(_class_name) = &child {
            contains_classname = true;
            stringify_element_selector(child, include_scope, parent_selector_text, false, context)
          } else {
            stringify_element_selector(child, false, parent_selector_text, false, context)
          }
        })
        .collect();

      // if classname, then already scoped, to skip
      if contains_classname {
        text.join("")
      } else {
        format!("{}{}", text.join(""), scope_selector)
      }
    }

    ast::Selector::Prefixed(selector) => {
      if let Some(postfix_selector) = &selector.postfix_selector {
        format!(
          "{}{}{}",
          parent_selector_text,
          selector.connector,
          stringify_element_selector(
            postfix_selector,
            selector.connector == " ",
            parent_selector_text,
            false,
            context
          )
        )
      } else {
        format!("{}{}", parent_selector_text, selector.connector)
      }
    }
  };

  scoped_selector_text.to_string()
}

fn is_reserved_keyframe_word<'a>(word: &'a str) -> bool {
  let reserved_timing_re = Regex::new(r"\b(-|\d+s?)\b").unwrap();
  let reserved_timing_fn_re = Regex::new(r"\b(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|steps|cubic-bezier|initial|inherit)\b").unwrap();

  // https://www.w3schools.com/cssref/css3_pr_animation-direction.asp
  let reserved_direction_re =
    Regex::new(r"\b(normal|reverse|alternate|alternate-reverse|initial|inherit)\b").unwrap();

  let iter_count_re = Regex::new(r"\b(infinite)\b").unwrap();

  // https://www.w3schools.com/cssref/css3_pr_animation-fill-mode.asp
  let reserved_fill_mode_re =
    Regex::new(r"\b(none|forwards|backwards|both|initial|inherit)\b").unwrap();

  // https://www.w3schools.com/cssref/css3_pr_animation-play-state.asp
  let reserved_play_state_re = Regex::new(r"\b(paused|running|initial|inherit)\b").unwrap();

  reserved_timing_re.is_match(word)
    || reserved_timing_fn_re.is_match(word)
    || reserved_direction_re.is_match(word)
    || reserved_fill_mode_re.is_match(word)
    || reserved_play_state_re.is_match(word)
    || iter_count_re.is_match(word)
}

fn evaluate_style_key_value_declaration<'a>(
  expr: &'a ast::KeyValueDeclaration,
  context: &Context,
) -> Result<virt::CSSStyleProperty, RuntimeError> {
  let mut value = expr.value.to_string();

  let url_re = Regex::new(r#"url\((?:['"]?)(.*?)(?:['"]?)\)"#).unwrap();

  if expr.name == "animation-name" {
    value = format!("_{}_{}", context.scope, value);

  // https://www.w3schools.com/cssref/css3_pr_animation.asp
  } else if expr.name == "animation" {
    value = value
      .split(" ")
      .collect::<Vec<&str>>()
      .iter()
      .map(|part| -> String {
        if is_reserved_keyframe_word(part) {
          part.to_string()
        } else {
          format!("_{}_{}", context.scope, part)
        }
      })
      .collect::<Vec<String>>()
      .join(" ");
  }

  // a bit crude, but works for now. Need to eventually consider HTTP paths
  if url_re.is_match(value.clone().as_str()) {
    let protocol_re = Regex::new(r"^\w+:").unwrap();
    for caps in url_re.captures_iter(value.to_string().as_str()) {
      let url_fn = caps.get(0).unwrap().as_str();

      let relative_path = caps.get(1).unwrap().as_str();

      // skip values with protocol
      if protocol_re.is_match(relative_path) {
        continue;
      }
      let full_path_option = context.vfs.resolve(context.uri, &relative_path.to_string());

      if let Some(full_path) = full_path_option {
        value = url_re
          .replace(url_fn, format!("url({})", full_path).as_str())
          .to_string();
      } else {
        return Err(RuntimeError::new(
          "Unable to resolve file.".to_string(),
          context.uri,
          &expr.value_location,
        ));
      }
    }
  }

  Ok(virt::CSSStyleProperty {
    name: expr.name.to_string(),
    value,
  })
}
