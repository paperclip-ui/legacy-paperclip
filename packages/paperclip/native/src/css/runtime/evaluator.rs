use super::super::ast;
use super::virt;
use crate::base::runtime::RuntimeError;
use std::collections::HashMap;
use crate::pc::runtime::vfs::VirtualFileSystem;
use regex::Regex;

pub struct Context<'a> {
  scope: &'a str,
  vfs: &'a VirtualFileSystem,
  uri: &'a String,
  mixins: HashMap<String, Vec<virt::CSSStyleProperty>>,
  all_rules: Vec<virt::Rule>,
}

pub fn evaluate<'a>(
  expr: &ast::Sheet,
  uri: &'a String,
  scope: &'a str,
  vfs: &'a VirtualFileSystem,
) -> Result<virt::CSSSheet, RuntimeError> {
  let mut context = Context {
    scope,
    uri,
    vfs,
    mixins: HashMap::new(),
    all_rules: vec![],
  };
  for rule in &expr.rules {
    evaluate_rule(&rule, &mut context)?;
  }
  Ok(virt::CSSSheet {
    rules: context.all_rules,
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
      evaluate_mixin_rule(mixin, context);
    }
    ast::Rule::Namespace(namespace) => {
      context
        .all_rules
        .push(virt::Rule::Namespace(namespace.to_string()));
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
      evaluate_style_rule(rule, context)?;
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
  context: &mut Context,
) -> Result<(), RuntimeError> {
  for rule in rules {
    evaluate_style_rule2(&rule, context)?;
  }
  Ok(())
}

pub fn evaluate_child_style_rules<'a>(
  prefix: &String,
  rules: &Vec<ast::ChildStyleRule>,
  context: &mut Context,
) -> Result<(), RuntimeError> {
  for rule in rules {
    evaluate_child_style_rule(&prefix, &rule, context)?;
  }
  Ok(())
}
pub fn evaluate_child_style_rule<'a>(
  prefix: &String,
  expr: &ast::ChildStyleRule,
  context: &mut Context,
) -> Result<(), RuntimeError> {
  let postfix = if let Some(selector) = &expr.selector {
    stringify_element_selector(selector, true, context)
  } else {
    "".to_string()
  };

  let selector_text = format!("{}{}{}", prefix, expr.separator, postfix).to_string();
  let child_prefix = selector_text.clone();
  let style = evaluate_style_declarations(&expr.declarations, context)?;
  let main_rule = virt::StyleRule {
    selector_text,
    style,
  };

  context.all_rules.push(virt::Rule::Style(main_rule));

  evaluate_child_style_rules(&child_prefix, &expr.children, context)?;

  Ok(())
}

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
    mixins: context.mixins.clone()
  };


  evaluate_style_rules(&rule.rules, &mut child_context)?;

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
    name: rule.name.to_string(),
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

fn evaluate_style_declarations(
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
        let name = inc.mixin_path.get(0).unwrap();

        let mixin_decls_option = context.mixins.get(name);

        if let Some(mixin_decls) = mixin_decls_option {
          style.extend(mixin_decls.clone());
        }

        // if None == nmo {
        //   panic!("OK");
        // }
        // if Some(nm) = nmo {

        //   panic!("{:?}", nm);
        // }
      }
    }
  }
  Ok(style)
}

fn evaluate_style_rule(expr: &ast::StyleRule, context: &mut Context) -> Result<(), RuntimeError> {
  evaluate_style_rule2(expr, context)?;
  Ok(())
}

fn evaluate_mixin_rule(expr: &ast::MixinRule, context: &mut Context) -> Result<(), RuntimeError> {
  let style = evaluate_style_declarations(&expr.declarations, context)?;
  context.mixins.insert(expr.name.trim().to_string(), style);
  Ok(())
}

fn evaluate_style_rule2(expr: &ast::StyleRule, context: &mut Context) -> Result<(), RuntimeError> {
  let style = evaluate_style_declarations(&expr.declarations, &context)?;
  let selector_text = stringify_element_selector(&expr.selector, true, &context);

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
      let selector_text2 = stringify_element_selector(&selector, !is_global_selector, &context);

      evaluate_child_style_rules(&selector_text2, &expr.children, context)?;

      println!("{}", selector_text2);
    }
  } else {
    let child_rule_prefix = main_style_rule.selector_text.clone();
    context.all_rules.push(virt::Rule::Style(main_style_rule));
    evaluate_child_style_rules(&child_rule_prefix, &expr.children, context)?;
  }

  Ok(())
}

fn stringify_optional_selector(selector: &Option<Box<ast::Selector>>, context: &Context) -> String {
  if let Some(target) = &selector {
    stringify_element_selector(target, true, context)
  } else {
    "".to_string()
  }
}

fn stringify_element_selector(
  selector: &ast::Selector,
  include_scope: bool,
  context: &Context,
) -> String {
  let scope_selector = if include_scope {
    format!("[data-pc-{}]", context.scope)
  } else {
    "".to_string()
  };

  let scoped_selector_text = match selector {
    ast::Selector::AllSelector => format!("{}", scope_selector),
    ast::Selector::None => "".to_string(),
    ast::Selector::Class(selector) => {
      if include_scope {
        format!("._{}_{}", context.scope, selector.class_name)
      } else {
        format!(".{}", selector.class_name)
      }
    }
    ast::Selector::Id(selector) => format!("#{}{}", selector.id, scope_selector),
    ast::Selector::Element(selector) => format!("{}{}", selector.tag_name, scope_selector),
    ast::Selector::PseudoElement(selector) => {
      if selector.name == "root" {
        format!("{}{}", selector.separator, selector.name)
      } else {
        format!(
          "{}{}{}",
          stringify_optional_selector(&selector.target, context),
          selector.separator,
          selector.name
        )
      }
    }
    ast::Selector::PseudoParamElement(selector) => format!(
      "{}:{}({})",
      stringify_optional_selector(&selector.target, context),
      selector.name,
      selector.param
    ),
    ast::Selector::Attribute(selector) => format!("{}{}", selector.to_string(), scope_selector),
    ast::Selector::Not(selector) => format!(
      "{}:not({})",
      scope_selector,
      stringify_element_selector(&selector.selector, include_scope, context)
    ),
    ast::Selector::Global(selector) => format!(
      "{}",
      stringify_element_selector(&selector.selector, false, context)
    ),

    // need to trim in case parent is None
    ast::Selector::Descendent(selector) => format!(
      "{} {}",
      stringify_element_selector(&selector.parent, include_scope, context),
      stringify_element_selector(&selector.descendent, include_scope, context)
    )
    .trim()
    .to_string(),
    ast::Selector::Child(selector) => format!(
      "{} > {}",
      stringify_element_selector(&selector.parent, include_scope, context),
      stringify_element_selector(&selector.child, include_scope, context)
    ),
    ast::Selector::Adjacent(selector) => format!(
      "{} + {}",
      stringify_element_selector(&selector.selector, include_scope, context),
      stringify_element_selector(&selector.next_sibling_selector, include_scope, context)
    ),
    ast::Selector::Sibling(selector) => format!(
      "{} ~ {}",
      stringify_element_selector(&selector.selector, include_scope, context),
      stringify_element_selector(&selector.sibling_selector, include_scope, context)
    ),
    ast::Selector::Group(selector) => {
      let text: Vec<String> = (&selector.selectors)
        .into_iter()
        .map(|child| stringify_element_selector(child, include_scope, context))
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
            stringify_element_selector(child, include_scope, context)
          } else {
            child.to_string()
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
  };

  scoped_selector_text.to_string()
}

fn evaluate_style_key_value_declaration<'a>(
  expr: &'a ast::KeyValueDeclaration,
  context: &Context,
) -> Result<virt::CSSStyleProperty, RuntimeError> {
  
  let mut value = expr.value.to_string();

  let url_re = Regex::new(r#"url\((?:['"]?)(.*?)(?:['"]?)\)"#).unwrap();

  // a bit crude, but works for now. Need to eventually consider HTTP paths
  if url_re.is_match(value.clone().as_str()) {
    let protocol_re = Regex::new(r"^\w+:").unwrap();
    for caps in url_re.captures_iter(value.to_string().as_str()) {
      let url_fn = caps.get(0).unwrap().as_str();

      let relative_path = caps.get(1).unwrap().as_str();

      // skil values with protocol
      if protocol_re.is_match(relative_path) {
        continue;
      }
      let full_path = context.vfs.resolve(context.uri, &relative_path.to_string());

      value = url_re
        .replace(url_fn, format!("url({})", full_path).as_str())
        .to_string();
    }
  }

  Ok(virt::CSSStyleProperty {
    name: expr.name.to_string(),
    value,
  })
}
