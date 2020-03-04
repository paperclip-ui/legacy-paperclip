use super::super::ast;
use super::virt;
use crate::base::runtime::{RuntimeError};
use crate::pc::runtime::vfs::{VirtualFileSystem};
use regex::Regex;

pub struct Context<'a> {
  scope: &'a str,
  vfs: &'a VirtualFileSystem,
  uri: &'a String,
}

pub fn evaluate<'a>(expr: &ast::Sheet, uri: &'a String, scope: &'a str, vfs: &'a VirtualFileSystem) -> Result<virt::CSSSheet, RuntimeError> {
  let context = Context { scope, uri, vfs };
  let mut rules = vec![];
  for rule in &expr.rules {
    rules.push(evaluate_rule(&rule, &context)?);
  }
  Ok(virt::CSSSheet {
    rules,
  })
}

fn evaluate_rule(rule: &ast::Rule, context: &Context) -> Result<virt::Rule, RuntimeError> {
  match rule {
    ast::Rule::Charset(charset) => Ok(virt::Rule::Charset(charset.to_string())),
    ast::Rule::Namespace(namespace) => Ok(virt::Rule::Namespace(namespace.to_string())),
    ast::Rule::FontFace(rule) => evaluate_font_family_rule(rule, context),
    ast::Rule::Media(rule) => evaluate_media_rule(rule, context),
    ast::Rule::Style(rule) => evaluate_style_rule(rule, context),
    ast::Rule::Keyframes(rule) => evaluate_keyframes_rule(rule, context),
    ast::Rule::Supports(rule) => evaluate_supports_rule(rule, context),
    ast::Rule::Document(rule) => evaluate_document_rule(rule, context),
    ast::Rule::Page(rule) => evaluate_page_rule(rule, context),
  }
}

pub fn evaluate_style_rules<'a>(rules: &Vec<ast::StyleRule>, context: &Context) -> Result<Vec<virt::StyleRule>, RuntimeError> {
  let mut css_rules = vec![];
  for rule in rules {
    css_rules.push(evaluate_style_rule2(&rule, &context)?);
  }
  Ok(css_rules)
}

fn evaluate_font_family_rule(font_family: &ast::FontFaceRule, context: &Context) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::FontFace(virt::FontFaceRule {
    style: evaluate_style_declarations(&font_family.declarations, context)?
  }))
}

fn evaluate_media_rule(rule: &ast::ConditionRule, context: &Context) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Media(evaluate_condition_rule(rule, context)?))
}

fn evaluate_supports_rule(rule: &ast::ConditionRule, context: &Context) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Supports(evaluate_condition_rule(rule, context)?))

}
fn evaluate_page_rule(rule: &ast::ConditionRule, context: &Context) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Page(evaluate_condition_rule(rule, context)?))
}

fn evaluate_document_rule(rule: &ast::ConditionRule, context: &Context) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Document(evaluate_condition_rule(rule, context)?))
}

fn evaluate_condition_rule(rule: &ast::ConditionRule, context: &Context) -> Result<virt::ConditionRule, RuntimeError> {
  Ok(virt::ConditionRule {
    name: rule.name.to_string(),
    condition_text: rule.condition_text.to_string(),
    rules: evaluate_style_rules(&rule.rules, context)?
  })
}

fn evaluate_keyframes_rule(rule: &ast::KeyframesRule, context: &Context) -> Result<virt::Rule, RuntimeError> {

  let mut rules = vec![];

  for rule in &rule.rules {
    rules.push(evaluate_keyframe_rule(rule, context)?);
  }
  
  Ok(virt::Rule::Keyframes(virt::KeyframesRule {
    name: rule.name.to_string(),
    rules,
  }))
}

fn evaluate_keyframe_rule(rule: &ast::KeyframeRule, _context: &Context) -> Result<virt::KeyframeRule, RuntimeError> {

  let mut style = vec![];
  for decl in &rule.declarations {
    style.push(virt::CSSStyleProperty {
      name: decl.name.to_string(),
      value: decl.value.to_string()
    });
  }

  Ok(virt::KeyframeRule {
    key: rule.key.to_string(),
    style
  })
}

fn evaluate_style_declarations(declarations: &Vec<ast::Declaration>, context: &Context) -> Result<Vec<virt::CSSStyleProperty>, RuntimeError> {
  let mut style = vec![];
  for property in declarations {
    style.push(evaluate_style_declaration(&property, context)?);
  }
  Ok(style)
}

fn evaluate_style_rule(expr: &ast::StyleRule, context: &Context) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Style(evaluate_style_rule2(expr, context)?))
}

fn evaluate_style_rule2(expr: &ast::StyleRule, context: &Context) -> Result<virt::StyleRule, RuntimeError> {
  let style = evaluate_style_declarations(&expr.declarations, context)?;
  let selector_text = stringify_element_selector(&expr.selector, context);
  Ok(virt::StyleRule {
    selector_text,
    style
  })
}

fn stringify_optional_selector(selector: &Option<Box<ast::Selector>>, context: &Context) -> String {
  if let Some(target) = &selector {
    stringify_element_selector(target, context)
  } else {
    "".to_string()
  }
}

fn stringify_element_selector(selector: &ast::Selector, context: &Context) -> String {

  let scope_selector = format!("[data-pc-{}]", context.scope);

  let scoped_selector_text = match selector {
    ast::Selector::AllSelector => format!("{}", scope_selector),
    ast::Selector::Class(selector) => format!(".{}{}", selector.class_name, scope_selector),
    ast::Selector::Id(selector) => format!("#{}{}", selector.id, scope_selector),
    ast::Selector::Element(selector) => format!("{}{}", selector.tag_name, scope_selector),
    ast::Selector::PseudoElement(selector) => {
      if selector.name == "root" {
        format!("{}{}", selector.separator, selector.name)
      } else {
        format!("{}{}{}", stringify_optional_selector(&selector.target, context), selector.separator, selector.name)
      }
    },
    ast::Selector::PseudoParamElement(selector) => {
      format!("{}:{}({})", stringify_optional_selector(&selector.target, context), selector.name, selector.param)
    },
    ast::Selector::Attribute(selector) => format!("{}{}", selector.to_string(), scope_selector),
    ast::Selector::Not(selector) => format!("{}:not({})", scope_selector, stringify_element_selector(&selector.selector, context)),
    ast::Selector::Descendent(selector) => format!("{} {}", stringify_element_selector(&selector.parent, context), stringify_element_selector(&selector.descendent, context)),
    ast::Selector::Child(selector) => format!("{} > {}", stringify_element_selector(&selector.parent, context), stringify_element_selector(&selector.child, context)),
    ast::Selector::Adjacent(selector) => format!("{} + {}", stringify_element_selector(&selector.selector, context), stringify_element_selector(&selector.next_sibling_selector, context)),
    ast::Selector::Sibling(selector) => format!("{} ~ {}", stringify_element_selector(&selector.selector, context), stringify_element_selector(&selector.sibling_selector, context)),
    ast::Selector::Group(selector) => {
      let text: Vec<String> = (&selector.selectors).into_iter().map(|child| {
        stringify_element_selector(child, context)
      }).collect();
      text.join(", ")
    },
    ast::Selector::Combo(selector) => {
      let text: Vec<String> = (&selector.selectors).into_iter().map(|child| {
        child.to_string()
      }).collect();
      format!("{}{}", text.join(""), scope_selector)
    }
  };
  
  scoped_selector_text.to_string()
}

fn evaluate_style_declaration<'a>(expr: &'a ast::Declaration, context: &Context) -> Result<virt::CSSStyleProperty, RuntimeError> {

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

      value = url_re.replace(url_fn, format!("url({})", full_path).as_str()).to_string();
    }
  }

  Ok(virt::CSSStyleProperty {
    name: expr.name.to_string(),
    value,
  })
}