use super::super::super::pc::ast as pc_ast;
use super::super::super::pc::runtime::evaluator as pc_runtime;
use super::super::super::pc::runtime::export as pc_export;
use super::super::ast;
use super::export::{ClassNameExport, Exports, KeyframesExport, MixinExport, VarExport};
use super::virt;
use crate::base::ast::ExprSource;
use crate::base::runtime::RuntimeError;
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph};
use crate::core::vfs::VirtualFileSystem;
use regex::Regex;
use std::collections::{BTreeMap, HashMap};

pub struct Context<'a> {
  document_scope: &'a str,
  element_scope: Option<(String, bool)>,
  content: Option<&'a ast::Include>,
  vfs: &'a VirtualFileSystem,
  graph: &'a DependencyGraph,
  uri: &'a String,
  import_scopes: BTreeMap<String, String>,
  import_graph: &'a HashMap<String, BTreeMap<String, pc_export::Exports>>,
  exports: Exports,
  in_public_scope: bool,
  all_rules: Vec<virt::Rule>,
  inc_declarations: Vec<virt::CSSStyleProperty>,
}

pub struct EvalInfo {
  pub sheet: virt::CSSSheet,
  pub exports: Exports,
}

pub fn evaluate<'a>(
  expr: &ast::Sheet,
  uri: &'a String,
  document_scope: &'a str,
  element_scope: Option<(String, bool)>,
  import_scopes: BTreeMap<String, String>,
  vfs: &'a VirtualFileSystem,
  graph: &'a DependencyGraph,
  import_graph: &'a HashMap<String, BTreeMap<String, pc_export::Exports>>,
  existing_exports: Option<&Exports>,
) -> Result<EvalInfo, RuntimeError> {
  let mut context = Context {
    document_scope,
    element_scope,
    uri,
    vfs,
    graph,
    content: None,
    import_graph,
    import_scopes,
    in_public_scope: false,
    exports: Exports::new(),
    all_rules: vec![],
    inc_declarations: vec![],
  };

  if let Some(existing_exports) = existing_exports {
    context.exports.extend(existing_exports);
  }

  for rule in &expr.rules {
    evaluate_rule(&rule, &mut context)?;
  }

  if expr.declarations.len() > 0 || context.inc_declarations.len() > 0 {
    if let Some(_) = &context.element_scope {
      let (scope, is_instance) = context.element_scope.clone().unwrap();

      let mut style =
        evaluate_style_declarations(&expr.declarations, &"".to_string(), &mut context)?;

      // @include used
      style.extend(context.inc_declarations.clone());

      context.all_rules.push(virt::Rule::Style(virt::StyleRule {
        selector_text: get_element_scope_selector(&scope, &is_instance, true),
        style,
      }));
    }
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
    ast::Rule::Include(mixin) => {
      evaluate_include_rule(mixin, &"".to_string(), context)?;
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
      let rule = evaluate_font_family_rule(rule, context)?;
      context.all_rules.push(rule);
    }
    ast::Rule::Media(rule) => {
      let rule = evaluate_media_rule(rule, context)?;
      context.all_rules.push(rule);
    }
    ast::Rule::Style(rule) => {
      evaluate_style_rule(rule, &"".to_string(), context)?;
    }
    ast::Rule::Keyframes(rule) => {
      let rule = evaluate_keyframes_rule(rule, context)?;
      context.all_rules.push(rule);
    }
    ast::Rule::Supports(rule) => {
      let rule = evaluate_supports_rule(rule, context)?;
      context.all_rules.push(rule);
    }
    ast::Rule::Document(rule) => {
      let rule = evaluate_document_rule(rule, context)?;
      context.all_rules.push(rule);
    }
    ast::Rule::Page(rule) => {
      let rule = evaluate_page_rule(rule, context)?;
      context.all_rules.push(rule);
    }
  };

  Ok(())
}

pub fn evaluate_style_rules<'a>(
  rules: &Vec<ast::StyleRule>,
  parent_selector_text: &String,
  include_parent_rule: bool,
  context: &mut Context,
) -> Result<(), RuntimeError> {
  for rule in rules {
    evaluate_style_rule2(&rule, parent_selector_text, include_parent_rule, context)?;
  }
  Ok(())
}

fn evaluate_font_family_rule(
  font_family: &ast::FontFaceRule,
  context: &mut Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::FontFace(virt::FontFaceRule {
    style: evaluate_style_declarations(&font_family.declarations, &"".to_string(), context)?,
  }))
}

fn evaluate_media_rule(
  rule: &ast::ConditionRule,

  context: &mut Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Media(evaluate_condition_rule(
    rule,
    &"".to_string(),
    context,
  )?))
}

fn evaluate_supports_rule(
  rule: &ast::ConditionRule,

  context: &mut Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Supports(evaluate_condition_rule(
    rule,
    &"".to_string(),
    context,
  )?))
}
fn evaluate_page_rule(
  rule: &ast::ConditionRule,

  context: &mut Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Page(evaluate_condition_rule(
    rule,
    &"".to_string(),
    context,
  )?))
}

fn evaluate_document_rule(
  rule: &ast::ConditionRule,

  context: &mut Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Document(evaluate_condition_rule(
    rule,
    &"".to_string(),
    context,
  )?))
}

fn evaluate_condition_rule(
  rule: &ast::ConditionRule,
  parent_selector_text: &String,
  context: &mut Context,
) -> Result<virt::ConditionRule, RuntimeError> {
  let mut child_context = create_child_context(context);
  evaluate_style_rules(&rule.rules, parent_selector_text, true, &mut child_context)?;

  if rule.declarations.len() > 0 {
    let mut selector_text = parent_selector_text.to_string();

    if parent_selector_text == "" {
      if let Some((element_scope, is_instance)) = &context.element_scope {
        selector_text = format!("[data-pc-{}]", element_scope);
      }
    }

    let style =
      evaluate_style_declarations(&rule.declarations, &selector_text, &mut child_context)?;
    child_context
      .all_rules
      .push(virt::Rule::Style(virt::StyleRule {
        selector_text,
        style,
      }))
  }

  context.exports.extend(&child_context.exports);

  Ok(virt::ConditionRule {
    name: rule.name.to_string(),
    condition_text: rule.condition_text.to_string(),
    rules: child_context.all_rules,
  })
}

fn evaluate_keyframes_rule(
  rule: &ast::KeyframesRule,
  context: &mut Context,
) -> Result<virt::Rule, RuntimeError> {
  let mut rules = vec![];

  for rule in &rule.rules {
    rules.push(evaluate_keyframe_rule(rule, context)?);
  }

  let public = if let Some(var) = context.exports.keyframes.get(&rule.name) {
    var.public || context.in_public_scope
  } else {
    context.in_public_scope
  };

  context.exports.keyframes.insert(
    rule.name.to_string(),
    KeyframesExport {
      name: rule.name.to_string(),
      public,
      source: ExprSource::new(context.uri.to_string(), rule.location.clone()),
    },
  );

  Ok(virt::Rule::Keyframes(virt::KeyframesRule {
    name: format!("_{}_{}", context.document_scope, rule.name.to_string()),
    rules,
  }))
}

fn evaluate_keyframe_rule(
  rule: &ast::KeyframeRule,
  context: &mut Context,
) -> Result<virt::KeyframeRule, RuntimeError> {
  let mut style = evaluate_style_declarations(&rule.declarations, &"".to_string(), context)?;
  Ok(virt::KeyframeRule {
    key: rule.key.to_string(),
    style,
  })
}

fn get_mixin<'a>(
  iref: &ast::IncludeReference,
  context: &mut Context<'a>,
) -> Result<(Option<&'a ast::MixinRule>, &'a String), RuntimeError> {
  let self_dep = context.graph.dependencies.get(context.uri).unwrap();

  let dep = if iref.parts.len() == 1 {
    self_dep
  } else {
    let inc_part = iref.parts.first().unwrap();
    let dep_uri_option = self_dep.dependencies.get(&inc_part.name);

    if let Some(dep_uri) = dep_uri_option {
      context.graph.dependencies.get(dep_uri).unwrap()
    } else {
      return Err(RuntimeError::new(
        "Reference not found.".to_string(),
        &context.uri,
        &inc_part.location,
      ));
    }
  };

  Ok((
    get_mixin_from_dep(dep, &iref.parts.last().unwrap().name, context),
    &dep.uri,
  ))
}

fn get_mixin_from_dep<'a>(
  dep: &'a Dependency,
  name: &String,
  context: &Context,
) -> Option<&'a ast::MixinRule> {
  match &dep.content {
    DependencyContent::Node(content) => {
      return get_mixin_from_pc_doc(content, name);
    }
    DependencyContent::StyleSheet(content) => {
      return get_mixin_from_rules(&content.rules, name);
    }
  }
}

fn get_mixin_from_pc_doc<'a>(
  content: &'a pc_ast::Node,
  name: &String,
) -> Option<&'a ast::MixinRule> {
  if let Some(children) = pc_ast::get_children(content) {
    for child in children {
      match &child {
        pc_ast::Node::StyleElement(element) => {
          let option = get_mixin_from_rules(&element.sheet.rules, name);
          if option != None {
            return option;
          }
        }
        _ => {}
      }
    }
  }

  None
}

fn get_mixin_from_rules<'a>(
  rules: &'a Vec<ast::Rule>,
  name: &String,
) -> Option<&'a ast::MixinRule> {
  for rule in rules {
    if let ast::Rule::Export(export) = rule {
      if let Some(found) = get_mixin_from_rules(&export.rules, name) {
        return Some(found);
      }
    }

    if let ast::Rule::Mixin(mixin) = rule {
      if &mixin.name.value == name {
        return Some(mixin);
      }
    }
  }
  None
}

fn get_imports<'a>(context: &'a Context) -> &'a BTreeMap<String, pc_export::Exports> {
  context.import_graph.get(context.uri).unwrap()
}

fn create_child_context<'a>(context: &mut Context<'a>) -> Context<'a> {
  Context {
    document_scope: context.document_scope,
    element_scope: context.element_scope.clone(),
    uri: context.uri,
    content: context.content.clone(),
    vfs: context.vfs,
    all_rules: vec![],
    graph: context.graph,
    import_scopes: context.import_scopes.clone(),
    import_graph: context.import_graph,
    in_public_scope: context.in_public_scope,
    exports: context.exports.clone(),
    inc_declarations: vec![],
  }
}

fn fork_context<'a>(dependency_uri: &'a String, context: &mut Context<'a>) -> Context<'a> {
  let mut child = create_child_context(context);
  child.uri = &dependency_uri;
  child.in_public_scope = false;
  child.import_scopes =
    pc_runtime::get_import_scopes(context.graph.dependencies.get(dependency_uri).unwrap());

  return child;
}

fn assert_get_mixin<'a>(
  iref: &ast::IncludeReference,
  context: &mut Context<'a>,
) -> Result<(&'a ast::MixinRule, &'a String), RuntimeError> {
  let (mixin_option, dependency_uri) = get_mixin(&iref, context)?;
  if let Some(mixin) = mixin_option {
    // make sure it's public
    if dependency_uri != context.uri {
      let export = context
        .import_graph
        .get(context.uri)
        .unwrap()
        .get(&iref.parts.first().unwrap().name)
        .unwrap()
        .style
        .mixins
        .get(&iref.parts.last().unwrap().name)
        .unwrap();
      if !export.public {
        return Err(RuntimeError::new(
          "This mixin is private.".to_string(),
          context.uri,
          &iref.parts.last().unwrap().location,
        ));
      }
    }

    return Ok((mixin, dependency_uri));
  } else {
    return Err(RuntimeError::new(
      "Reference not found.".to_string(),
      context.uri,
      &iref.parts.last().unwrap().location,
    ));
  }
}

fn include_mixin<'a>(
  inc: &ast::Include,
  style: &mut Vec<virt::CSSStyleProperty>,
  parent_selector_text: &String,
  context: &mut Context,
) -> Result<(), RuntimeError> {
  let (mixin, dependency_uri) = assert_get_mixin(&inc.mixin_name, context)?;
  let (declarations, child_rules) = evaluate_mixin(
    mixin,
    dependency_uri,
    parent_selector_text,
    Some(inc),
    context,
  )?;
  style.extend(declarations);
  context.all_rules.extend(child_rules);

  Ok(())
}

fn include_content<'a>(
  all_styles: &mut Vec<virt::CSSStyleProperty>,
  parent_selector_text: &String,
  context: &mut Context<'a>,
) -> Result<(), RuntimeError> {
  if let Some(inc) = &context.content {
    let inc2 = inc.clone();

    evaluate_style_rules(&inc2.rules, parent_selector_text, true, context)?;
    all_styles.extend(evaluate_style_declarations(
      &inc2.declarations,
      parent_selector_text,
      context,
    )?);
  }

  Ok(())
}

fn evaluate_style_declarations<'a>(
  declarations: &Vec<ast::Declaration>,
  parent_selector_text: &String,
  context: &mut Context<'a>,
) -> Result<Vec<virt::CSSStyleProperty>, RuntimeError> {
  let mut style = vec![];
  for property in declarations {
    match property {
      ast::Declaration::KeyValue(kv) => {
        evaluate_style_key_value_declaration(kv, &mut style, context)?;
      }
      ast::Declaration::Include(inc) => {
        include_mixin(inc, &mut style, parent_selector_text, context)?;
      }
      ast::Declaration::Content => {
        include_content(&mut style, parent_selector_text, context)?;
      }
      ast::Declaration::Media(media) => {
        let rule = evaluate_condition_rule(media, parent_selector_text, context)?;
        if rule.rules.len() > 0 {
          context.all_rules.push(virt::Rule::Media(rule));
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
  evaluate_style_rule2(expr, parent_selector_text, true, context)?;
  Ok(())
}

fn evaluate_export_rule(expr: &ast::ExportRule, context: &mut Context) -> Result<(), RuntimeError> {
  let mut exports = Exports::new();
  let in_public_scope = context.in_public_scope;
  context.in_public_scope = true;

  for rule in &expr.rules {
    evaluate_rule(rule, context)?;

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

  context.in_public_scope = in_public_scope;

  context.exports.extend(&exports);

  Ok(())
}
fn evaluate_mixin_rule(expr: &ast::MixinRule, context: &mut Context) -> Result<(), RuntimeError> {
  if None == context.exports.mixins.get(&expr.name.value) {
    context.exports.mixins.insert(
      expr.name.value.to_string(),
      MixinExport {
        name: expr.name.value.to_string(),
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

fn evaluate_mixin<'a, 'b>(
  expr: &ast::MixinRule,
  owner_uri: &'a String,
  parent_selector_text: &String,
  content: Option<&'b ast::Include>,
  context: &mut Context<'a>,
) -> Result<(Vec<virt::CSSStyleProperty>, Vec<virt::Rule>), RuntimeError> {
  let mut child_context = fork_context(owner_uri, context);
  child_context.content = content;
  let declarations =
    evaluate_style_declarations(&expr.declarations, parent_selector_text, &mut child_context)?;

  evaluate_style_rules(&expr.rules, parent_selector_text, true, &mut child_context)?;

  Ok((declarations, child_context.all_rules))
}

fn evaluate_include_rule<'a>(
  expr: &ast::Include,
  parent_selector_text: &String,
  context: &mut Context<'a>,
) -> Result<(), RuntimeError> {
  let (mixin, dep_uri) = assert_get_mixin(&expr.mixin_name, context)?;
  // let style = evaluate_style_declarations(&expr.declarations, parent_selector_text, context)?;
  // let mut child_context = create_child_context(context);
  // evaluate_style_rules(&expr.rules, parent_selector_text, false, &mut child_context)?;

  let (declarations, rules) =
    evaluate_mixin(mixin, dep_uri, parent_selector_text, Some(expr), context)?;
  context.all_rules.extend(rules);
  context.inc_declarations.extend(declarations);

  Ok(())
}

fn evaluate_style_rule2(
  expr: &ast::StyleRule,
  parent_selector_text: &String,
  include_parent_rule: bool,
  context: &mut Context,
) -> Result<(), RuntimeError> {
  let mut selector_text = stringify_element_selector(
    &expr.selector,
    true,
    parent_selector_text,
    include_parent_rule,
    parent_selector_text == ""
      && match expr.selector {
        ast::Selector::This(_) => false,
        _ => true,
      },
    context,
  );

  lazy_static! {
    static ref class_name_re: Regex = Regex::new(r"\.([\w\-_]+)").unwrap();
    static ref scope_re: Regex = Regex::new(r"^_[^_]+_").unwrap();
  }

  if class_name_re.is_match(selector_text.to_string().as_ref()) {
    // url check
    for caps in class_name_re.captures_iter(selector_text.to_string().as_str()) {
      let scoped_class_name = caps.get(1).unwrap().as_str();
      let class_name = scope_re.replace(scoped_class_name, "").to_string();

      let existing_option = context.exports.class_names.get(&class_name);

      if existing_option == None {
        context.exports.class_names.insert(
          class_name.to_string(),
          ClassNameExport {
            name: class_name.to_string(),
            scoped_name: scoped_class_name.to_string(),
            public: context.in_public_scope,
          },
        );
      }
    }
  }

  let mut is_global_selector = false;

  let target_selector = if let ast::Selector::Global(selector) = &expr.selector {
    is_global_selector = true;
    &selector.selector
  } else {
    &expr.selector
  };

  if let ast::Selector::Group(group) = &target_selector {
    // context.all_rules.push(virt::Rule::Style(main_style_rule));
    for selector in &group.selectors {
      let selector_text2 = stringify_element_selector(
        &selector,
        !is_global_selector,
        parent_selector_text,
        true,
        match selector {
          ast::Selector::This(_) => false,
          _ => parent_selector_text == "",
        },
        context,
      );

      let style = evaluate_style_declarations(&expr.declarations, &selector_text2, context)?;

      if style.len() > 0 {
        context.all_rules.push(virt::Rule::Style(virt::StyleRule {
          selector_text: selector_text2.clone(),
          style,
        }));
      }

      evaluate_style_rules(&expr.children, &selector_text2, true, context)?;
    }
  } else {
    let child_rule_prefix = selector_text.clone();
    let rule_len = context.all_rules.len();

    evaluate_style_rules(&expr.children, &child_rule_prefix, true, context)?;

    let style = evaluate_style_declarations(&expr.declarations, &selector_text, context)?;

    if style.len() > 0 {
      let main_style_rule = virt::StyleRule {
        selector_text,
        style,
      };

      // it's possible
      context
        .all_rules
        .insert(rule_len, virt::Rule::Style(main_style_rule));
    }
  }

  Ok(())
}

fn stringify_nestable_selector(
  selector: &ast::Selector,

  include_scope: bool,
  parent_selector_text: &String,
  context: &mut Context,
) -> String {
  stringify_element_selector(
    selector,
    include_scope,
    parent_selector_text,
    true,
    false,
    context,
  )
}

fn get_element_scope_selector(
  scope: &String,
  is_instance: &bool,
  extra_specificity: bool,
) -> String {
  if *is_instance {
    format!("[class]._{}", scope)
  } else {
    let selector = format!("[data-pc-{}]", scope);
    if extra_specificity {
      format!("{}{}", selector, selector)
    } else {
      selector
    }
  }
}

fn stringify_element_selector(
  selector: &ast::Selector,
  include_scope: bool,
  parent_selector_text: &String,
  include_prefix: bool,
  include_element_scope: bool,
  context: &mut Context,
) -> String {
  let scope_selector = if include_scope {
    format!("[data-pc-{}]", context.document_scope)
  } else {
    "".to_string()
  };

  let prefix = if include_prefix && parent_selector_text.len() > 0 {
    format!("{} ", parent_selector_text)
  } else {
    "".to_string()
  };

  let mut scoped_selector_text = match selector {
    ast::Selector::AllSelector => format!(
      "{}",
      if scope_selector == "" {
        "*".to_string()
      } else {
        scope_selector
      }
    ),
    ast::Selector::None => "".to_string(),
    ast::Selector::Class(selector) => {
      // Don't hate me for adding [class] -- it's the browsers fault, I promise. Each
      // selector other than class has a [data-pc-*] attribute, and that gives priority over
      // any class. So to counter-balance that, we need to add [class] so that classes take priority, again.
      if include_scope {
        format!(
          "{}[class]._{}_{}",
          prefix, context.document_scope, selector.class_name
        )
      } else {
        format!("{}[class].{}", prefix, selector.class_name)
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
        if include_scope {
          format!(
            "{}{}{}{}",
            prefix, scope_selector, selector.separator, selector.name
          )
        } else {
          format!("{}{}{}", prefix, selector.separator, selector.name)
        }
      }
    }
    ast::Selector::PseudoParamElement(selector) => {
      if include_scope {
        format!(
          "{}{}:{}({})",
          prefix, scope_selector, selector.name, selector.param
        )
      } else {
        format!("{}:{}({})", prefix, selector.name, selector.param)
      }
    }
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
        false,
        context
      )
    ),
    ast::Selector::This(selector) => {
      let self_selector = if let Some((scope, is_instance)) = &context.element_scope {
        get_element_scope_selector(scope, is_instance, true)
      } else {
        scope_selector
      };

      if let Some(selector) = &selector.selector {
        if let ast::Selector::Group(group) = selector.as_ref() {
          return group
            .selectors
            .iter()
            .map(|child_selector| {
              format!(
                "{}{}",
                self_selector,
                stringify_element_selector(
                  &child_selector,
                  false,
                  parent_selector_text,
                  include_prefix,
                  false,
                  context
                )
              )
            })
            .collect::<Vec<String>>()
            .join(", ");
        } else {
          return format!(
            "{}{}",
            self_selector,
            stringify_element_selector(
              &selector,
              false,
              parent_selector_text,
              include_prefix,
              false,
              context
            )
          );
        }
      } else {
        return format!("{}", self_selector);
      }
    }

    // need to trim in case parent is None
    ast::Selector::Descendent(selector) => format!(
      "{} {}",
      stringify_element_selector(
        &selector.parent,
        include_scope,
        parent_selector_text,
        include_prefix,
        false,
        context
      ),
      stringify_element_selector(
        &selector.descendent,
        include_scope,
        &"".to_string(),
        false,
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
        false,
        context
      ),
      stringify_element_selector(
        &selector.child,
        include_scope,
        parent_selector_text,
        false,
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
        false,
        context
      ),
      stringify_element_selector(
        &selector.next_sibling_selector,
        include_scope,
        parent_selector_text,
        false,
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
        false,
        context
      ),
      stringify_element_selector(
        &selector.sibling_selector,
        include_scope,
        parent_selector_text,
        false,
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
        .enumerate()
        .map(|(i, child)| {
          let include_prefix2 = include_prefix && i == 0;

          if let &ast::Selector::Class(_class_name) = &child {
            contains_classname = true;
            stringify_element_selector(
              &child,
              include_scope,
              parent_selector_text,
              include_prefix2,
              false,
              context,
            )
          } else {
            stringify_element_selector(
              &child,
              false,
              parent_selector_text,
              include_prefix2,
              false,
              context,
            )
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
            false,
            parent_selector_text,
            false,
            false,
            context
          )
        )
      } else {
        format!("{}{}", parent_selector_text, selector.connector)
      }
    }
  };

  if include_element_scope {
    if let Some((scope, is_instance)) = &context.element_scope {
      scoped_selector_text = format!(
        "{} {}",
        get_element_scope_selector(scope, is_instance, false),
        scoped_selector_text
      );
    }
  }

  scoped_selector_text.to_string()
}

fn is_reserved_keyframe_word<'a>(word: &'a str) -> bool {
  lazy_static! {
    static ref reserved_timing_re: Regex = Regex::new(r"\b(\d+s?)\b").unwrap();
    static ref reserved_timing_fn_re: Regex = Regex::new(r"\b(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|steps|cubic-bezier|initial|inherit)\b").unwrap();

    // https://www.w3schools.com/cssref/css3_pr_animation-direction.asp
    static ref reserved_direction_re: Regex = Regex::new(r"\b(normal|reverse|alternate|alternate-reverse|initial|inherit)\b").unwrap();
    static ref iter_count_re: Regex = Regex::new(r"\b(infinite)\b").unwrap();

    // https://www.w3schools.com/cssref/css3_pr_animation-fill-mode.asp
    static ref reserved_fill_mode_re: Regex = Regex::new(r"\b(none|forwards|backwards|both|initial|inherit)\b").unwrap();

    // https://www.w3schools.com/cssref/css3_pr_animation-play-state.asp
    static ref reserved_play_state_re: Regex = Regex::new(r"\b(paused|running|initial|inherit)\b").unwrap();
  }

  reserved_timing_re.is_match(word)
    || reserved_timing_fn_re.is_match(word)
    || reserved_direction_re.is_match(word)
    || reserved_fill_mode_re.is_match(word)
    || reserved_play_state_re.is_match(word)
    || iter_count_re.is_match(word)
}

fn format_scoped_reference(value: &str, context: &Context) -> String {
  if !value.contains(".") {
    format!("_{}_{}", context.document_scope, value)
  } else {
    let parts: Vec<&str> = value.split(".").collect();
    let scope_option = context
      .import_scopes
      .get(&parts.get(0).unwrap().to_string());
    if let Some(scope) = scope_option {
      format!("_{}_{}", scope, parts.get(1).unwrap())
    } else {
      value.to_string()
    }
  }
}

fn evaluate_style_key_value_declaration<'a>(
  expr: &'a ast::KeyValueDeclaration,
  declarations: &mut Vec<virt::CSSStyleProperty>,
  context: &mut Context,
) -> Result<(), RuntimeError> {
  let mut value = expr.value.to_string();

  lazy_static! {
    static ref url_re: Regex = Regex::new(r#"url\((?:['"]?)(.*?)(?:['"]?)\)"#).unwrap();
    static ref protocol_re: Regex = Regex::new(r"^\w+:").unwrap();

    // Only want to cover CSS that can affect the preview. All other CSS prefixing can happen via
    // CSS autoprefixer. This is primarily for performance reasons. _Maybe_ at some point we can have an option that
    // allows for autoprefixing everything.
    static ref css3_name_starts: Vec<&'static str> = vec![
      "mask"
    ];
    static ref css3_prefixes: Vec<&'static str> = vec![
      "-webkit-"
    ];
  }

  if expr.name == "animation-name" {
    value = format_scoped_reference(value.as_str(), context);

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
          format_scoped_reference(part, context)
        }
      })
      .collect::<Vec<String>>()
      .join(" ");
  }

  // a bit crude, but works for now. Need to eventually consider HTTP paths
  if url_re.is_match(value.clone().as_str()) {
    // url check
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
          format!(
            "Unable to resolve file: {} from {}",
            relative_path, context.uri
          ),
          context.uri,
          &expr.value_location,
        ));
      }
    }
  }

  if expr.name.starts_with("--") {
    context.exports.variables.insert(
      expr.name.to_string(),
      VarExport {
        name: expr.name.to_string(),
        value: value.to_string(),
        source: ExprSource::new(context.uri.to_string(), expr.location.clone()),
      },
    );
  }

  declarations.push(virt::CSSStyleProperty {
    name: expr.name.to_string(),
    value: value.to_string(),
  });

  for start in css3_name_starts.iter() {
    if expr.name.starts_with(start) {
      for prefix in css3_prefixes.iter() {
        declarations.push(virt::CSSStyleProperty {
          name: format!("{}{}", prefix, expr.name.to_string()),
          value: value.to_string(),
        });
      }
    }
  }

  Ok(())
}
