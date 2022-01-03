/*

Oh boy what a mess. To be refactored after features shake out.

:global(.style) {

}

<el>


</el>


global -> document -> scoped -> element

<div>
  :global(div) {
    @media screen {
      color: red;
    }
  }
</div>


*/

use super::super::super::pc::ast as pc_ast;
use super::super::super::pc::runtime::evaluator as pc_runtime;
use super::super::ast;
use super::export::{ClassNameExport, Exports, KeyframesExport, MixinExport, VarExport};
use super::virt;
use crate::base::utils::get_document_style_public_scope;

use crate::base::ast::{ExprTextSource, Range};
use crate::base::runtime::RuntimeError;
use crate::core::eval::DependencyEvalInfo;
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph};
use crate::core::vfs::VirtualFileSystem;
use regex::Regex;
use serde::Serialize;
use std::collections::BTreeMap;
use std::fmt;

pub struct Context<'a> {
  private_scope: &'a str,
  public_scope: &'a str,

  // deprecated
  element_scope: Option<(String, bool)>,
  content: Option<(String, &'a ast::Include)>,
  vfs: &'a VirtualFileSystem,
  graph: &'a DependencyGraph,
  uri: &'a String,
  import_scopes: BTreeMap<String, String>,
  evaluated_graph: &'a BTreeMap<String, DependencyEvalInfo>,
  exports: Exports,
  in_public_scope: bool,
  all_rules: Vec<virt::Rule>,
  inc_declarations: Vec<virt::CSSStyleProperty>,
}

#[derive(Clone, PartialEq)]
pub enum BufferScope {
  Within,
  Target,
}

#[derive(Clone, PartialEq)]
pub struct SelectorContext {
  within_scope: Option<String>,

  element_scope: Option<String>,

  scope_is_target: bool,

  // & is included
  parent_is_target: bool,
  parent_is_within: bool,
  defined_within: bool,

  // parent - { div { child { } }}
  parent: Option<String>,

  // target element selector
  target: Option<String>,

  buffer: Option<String>,

  buffer_scope: BufferScope,
}

impl SelectorContext {
  pub fn child(&self) -> SelectorContext {
    SelectorContext {
      buffer: None,
      within_scope: self.within_scope.clone(),
      parent_is_target: false,
      scope_is_target: false,
      parent_is_within: self.defined_within,
      defined_within: false,
      buffer_scope: BufferScope::Target,
      element_scope: if self.has_usable_scope() {
        self.element_scope.clone()
      } else {
        None
      },
      parent: if let Some(parent) = &self.parent {
        if let Some(target) = &self.target {
          if self.parent_is_target {
            Some(target.clone())
          } else {
            Some(format!("{} {}", parent, target))
          }
        } else {
          Some(parent.clone())
        }
      } else if let Some(target) = &self.target {
        Some(target.clone())
      } else {
        None
      },
      target: None,
    }
  }
  pub fn has_usable_scope(&self) -> bool {
    return self.element_scope != None && !self.scope_is_target;
  }
  pub fn push_buffer(&mut self, buffer: String) {
    self.buffer = Some(if let Some(existing) = &self.buffer {
      format!("{}{}", existing, buffer)
    } else {
      buffer
    });
  }

  pub fn persist_buffer(&mut self) {
    if let Some(buffer) = &self.buffer {
      // match self.buffer_scope {
      //   BufferScope::Target =>
      // }
      if self.buffer_scope == BufferScope::Target {
        self.append_target(buffer.clone());
      } else if self.buffer_scope == BufferScope::Within {
        self.prepend_within(buffer.clone());
      }
    }
    self.buffer = None;
  }
  pub fn empty(&self) -> bool {
    self.target == None
  }
  pub fn push_target<'a>(&mut self, target: String) {
    if let Some(buffer) = &self.buffer {
      self.buffer = Some(format!("{}{}", buffer, target));
    } else {
      self.append_target(target);
    }
  }
  fn append_target<'a>(&mut self, target: String) {
    if let Some(existing_target) = &self.target {
      self.buffer_scope = BufferScope::Target;
      self.target = Some(format!("{}{}", existing_target, target));
    } else {
      self.target = Some(target);
    }
  }
  pub fn push_within<'a>(&mut self, scope: String) {
    if let Some(buffer) = &self.buffer {
      self.buffer_scope = BufferScope::Within;
      self.buffer = Some(format!("{}{}", buffer, scope));
    } else {
      self.prepend_within(scope);
    }
  }

  fn prepend_within<'a>(&mut self, scope: String) {
    if let Some(existing_scope) = &self.within_scope {
      // :within(.a):within(.b) OR &:within(.a) { &:within(.b) { color: red }}
      if self.defined_within {
        self.within_scope = Some(format!("{}{}", existing_scope, scope));

      // :within(.a) { :within(.c) { color: red; }}
      } else {
        self.within_scope = Some(format!("{} {}", existing_scope, scope));
      }
    } else {
      self.within_scope = Some(scope);
      self.defined_within = true;
    }
  }
  pub fn nil() -> SelectorContext {
    SelectorContext {
      buffer: None,
      within_scope: None,
      parent_is_target: false,
      scope_is_target: false,
      parent_is_within: false,
      defined_within: false,
      element_scope: None,
      parent: None,
      target: None,
      buffer_scope: BufferScope::Target,
    }
  }
  pub fn append_element_scope_to_target(&mut self, force: bool) {
    if !self.scope_is_target || force {
      if let Some(scope) = &self.element_scope {
        self.push_target(format!("{}{}", scope, scope));
      }
    }

    self.scope_is_target = true;
  }
  pub fn append_parent_to_target(&mut self) {
    if let Some(parent) = &self.parent {
      self.push_target(parent.clone());
    }
    self.parent_is_target = true;
    self.defined_within = self.parent_is_within;
  }
  pub fn with_element_scope(scope: String) -> SelectorContext {
    SelectorContext {
      buffer: None,
      within_scope: None,
      parent_is_target: false,
      scope_is_target: false,
      parent_is_within: false,
      defined_within: false,
      element_scope: Some(scope),
      parent: None,
      target: None,
      buffer_scope: BufferScope::Target,
    }
  }
  pub fn from_context(context: &Context) -> SelectorContext {
    SelectorContext {
      within_scope: None,
      element_scope: if let Some((id, _)) = &context.element_scope {
        Some(get_element_scope_selector(context, false))
      } else {
        None
      },
      parent_is_target: false,
      scope_is_target: false,
      parent_is_within: false,
      defined_within: false,
      parent: None,
      target: None,
      buffer: None,
      buffer_scope: BufferScope::Target,
    }
  }
}

impl fmt::Display for SelectorContext {
  fn fmt(&self, fmt: &mut fmt::Formatter) -> fmt::Result {
    let mut buffer = String::new();
    if let Some(scope) = &self.within_scope {
      buffer.push_str(scope);
    }
    if !self.scope_is_target {
      if let Some(scope) = &self.element_scope {
        buffer.push_str(" ");
        buffer.push_str(scope);
      }
    }
    if !self.parent_is_target {
      if let Some(parent) = &self.parent {
        buffer.push_str(" ");
        buffer.push_str(parent);
      }
    }

    if let Some(target) = &self.target {
      buffer.push_str(" ");
      buffer.push_str(target);
    }

    fmt.write_str(buffer.trim());

    Ok(())
  }
}

#[derive(Debug, PartialEq, Clone, Serialize)]
pub struct EvalInfo {
  pub sheet: virt::CSSSheet,
  pub exports: Exports,
}

pub fn evaluate<'a>(
  uri: &String,
  graph: &'a DependencyGraph,
  vfs: &'a VirtualFileSystem,
  evaluated_graph: &'a BTreeMap<String, DependencyEvalInfo>,
) -> Result<EvalInfo, RuntimeError> {
  let dep = graph.dependencies.get(uri).unwrap();
  match &dep.content {
    DependencyContent::StyleSheet(sheet) => evaluate_expr(
      sheet,
      uri,
      dep.get_id().as_str(),
      &get_document_style_public_scope(uri),
      None,
      BTreeMap::new(),
      vfs,
      graph,
      evaluated_graph,
      None,
      true,
    ),
    _ => Err(RuntimeError::new(
      "Incorrect file type".to_string(),
      uri,
      &Range::nil(),
    )),
  }
}

pub fn evaluate_expr<'a>(
  expr: &ast::Sheet,
  uri: &'a String,
  private_scope: &'a str,
  public_scope: &'a str,
  element_scope: Option<(String, bool)>,
  import_scopes: BTreeMap<String, String>,
  vfs: &'a VirtualFileSystem,
  graph: &'a DependencyGraph,
  evaluated_graph: &'a BTreeMap<String, DependencyEvalInfo>,
  existing_exports: Option<&Exports>,
  public: bool,
) -> Result<EvalInfo, RuntimeError> {
  let mut context = Context {
    private_scope,
    public_scope,
    element_scope,
    uri,
    vfs,
    graph,
    content: None,
    evaluated_graph,
    import_scopes,
    in_public_scope: public,
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
    // if element scope is provided, then the style block is inline, so we need to
    // insert a rule
    if context.element_scope != None {
      let selector_context = SelectorContext::from_context(&context);
      let mut style =
        evaluate_style_declarations(&expr.declarations, &mut context, &selector_context)?;

      // @include used
      style.extend(context.inc_declarations.clone());

      // insert rule with element scope at the beginning - declarations have lower priority than
      // explicit style rules.
      context.all_rules.insert(
        0,
        virt::Rule::Style(virt::StyleRule {
          exported: context.in_public_scope,
          source_id: get_context_id(&context).to_string(),
          selector_text: get_element_scope_selector(&context, true),
          style,
        }),
      );
    }
  }

  Ok(EvalInfo {
    sheet: virt::CSSSheet {
      rules: context.all_rules,
    },
    exports: context.exports,
  })
}

fn get_context_id(context: &Context) -> String {
  if let Some((id, _)) = &context.element_scope {
    id.to_string()
  } else {
    "".to_string()
  }
}

fn evaluate_rule(rule: &ast::Rule, context: &mut Context) -> Result<(), RuntimeError> {
  match rule {
    ast::Rule::Comment(charset) => {
      // skip it
    }
    ast::Rule::Charset(charset) => {
      context
        .all_rules
        .push(virt::Rule::Charset(virt::CharsetRule {
          value: charset.value.clone(),
        }));
    }
    ast::Rule::Mixin(mixin) => {
      evaluate_mixin_rule(mixin, context)?;
    }
    ast::Rule::Include(mixin) => {
      evaluate_include_rule(mixin, context, &SelectorContext::from_context(context))?;
    }
    // ast::Rule::Namespace(namespace) => {
    //   context
    //     .all_rules
    //     .push(virt::Rule::Namespace(namespace.to_string()));
    // }
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
      evaluate_style_rule(rule, context, &SelectorContext::from_context(context))?;
    }
    ast::Rule::Keyframes(rule) => {
      let rule = evaluate_keyframes_rule(rule, context)?;
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
  rules: &Vec<ast::Rule>,
  context: &mut Context,
  parent_selector_context: &SelectorContext,
) -> Result<(), RuntimeError> {
  for rule in rules {
    if let ast::Rule::Style(style) = rule {
      evaluate_style_rule2(&style, context, parent_selector_context)?;
    }
  }
  Ok(())
}

fn evaluate_font_family_rule(
  font_family: &ast::FontFaceRule,
  context: &mut Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::FontFace(virt::FontFaceRule {
    style: evaluate_style_declarations(
      &font_family.declarations,
      context,
      &SelectorContext::nil(),
    )?,
  }))
}

fn evaluate_media_rule(
  rule: &ast::ConditionRule,
  context: &mut Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Media(evaluate_condition_rule(
    rule,
    context,
    &SelectorContext::from_context(context),
  )?))
}

fn evaluate_supports_rule(
  rule: &ast::ConditionRule,
  context: &mut Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Supports(evaluate_condition_rule(
    rule,
    context,
    &SelectorContext::nil(),
  )?))
}
fn evaluate_page_rule(
  rule: &ast::ConditionRule,

  context: &mut Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Page(evaluate_condition_rule(
    rule,
    context,
    &SelectorContext::nil(),
  )?))
}

fn evaluate_document_rule(
  rule: &ast::ConditionRule,

  context: &mut Context,
) -> Result<virt::Rule, RuntimeError> {
  Ok(virt::Rule::Document(evaluate_condition_rule(
    rule,
    context,
    &SelectorContext::nil(),
  )?))
}

fn evaluate_condition_rule(
  rule: &ast::ConditionRule,
  context: &mut Context,
  parent_selector_context: &SelectorContext,
) -> Result<virt::ConditionRule, RuntimeError> {
  let mut child_context = create_child_context(context);

  evaluate_style_rules(&rule.rules, &mut child_context, &parent_selector_context)?;

  if rule.declarations.len() > 0 {
    // Note that condition rule may not parent parent rule. In that
    // case selector_text will be ""
    let mut child_selector_context = parent_selector_context.child();

    if child_selector_context.parent != None {
      child_selector_context.append_parent_to_target();
    } else {
      child_selector_context.append_element_scope_to_target(false);
    }

    let selector_text = child_selector_context.to_string();

    let style = evaluate_style_declarations(
      &rule.declarations,
      &mut child_context,
      parent_selector_context,
    )?;

    let source_id = if let Some((_, inc)) = &context.content {
      inc.id.to_string()
    } else {
      rule.id.to_string()
    };

    // cover case with @media print { @media screen { .a { color: red; }}} - selector_text
    // will be undefined
    if selector_text.len() > 0 {
      child_context
        .all_rules
        .push(virt::Rule::Style(virt::StyleRule {
          exported: context.in_public_scope,
          source_id,
          selector_text,
          style,
        }))
    }
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
) -> Result<(), RuntimeError> {
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
      source: ExprTextSource::new(context.uri.to_string(), rule.range.clone()),
    },
  );

  context
    .all_rules
    .push(virt::Rule::Keyframes(virt::KeyframesRule {
      name: format!("_{}_{}", get_document_scope(context), rule.name.to_string()),
      rules: rules.clone(),
    }));

  if context.in_public_scope {
    context
      .all_rules
      .push(virt::Rule::Keyframes(virt::KeyframesRule {
        name: format!("_{}_{}", context.private_scope, rule.name.to_string()),
        rules: rules.clone(),
      }));
  }
  Ok(())
}

fn get_document_scope<'a>(context: &'a Context) -> &'a str {
  if context.in_public_scope {
    context.public_scope
  } else {
    &context.private_scope
  }
}

fn evaluate_keyframe_rule(
  rule: &ast::KeyframeRule,
  context: &mut Context,
) -> Result<virt::KeyframeRule, RuntimeError> {
  let style = evaluate_style_declarations(&rule.declarations, context, &SelectorContext::nil())?;
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
        &inc_part.range,
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
  if let Some(children) = content.get_children() {
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

fn create_child_context<'a>(context: &Context<'a>) -> Context<'a> {
  Context {
    private_scope: context.private_scope,
    public_scope: context.public_scope,
    element_scope: context.element_scope.clone(),
    uri: context.uri,
    content: context.content.clone(),
    vfs: context.vfs,
    all_rules: vec![],
    graph: context.graph,
    import_scopes: context.import_scopes.clone(),
    evaluated_graph: context.evaluated_graph,
    in_public_scope: context.in_public_scope,
    exports: context.exports.clone(),
    inc_declarations: vec![],
  }
}

fn fork_context<'a>(dependency_uri: &'a String, context: &Context<'a>) -> Context<'a> {
  let mut child = create_child_context(context);
  child.uri = &dependency_uri;
  child.in_public_scope = false;
  child.import_scopes =
    pc_runtime::get_import_scopes(context.graph.dependencies.get(dependency_uri).unwrap());

  return child;
}

fn get_style_import<'a, 'b>(
  uri: &'a String,
  id: &'a String,
  context: &mut Context<'b>,
) -> Option<&'b Exports> {
  context
    .graph
    .dependencies
    .get(uri)
    .and_then(|source| source.dependencies.get(id))
    .and_then(|dep_uri| context.evaluated_graph.get(dep_uri))
    .and_then(|import| match &import {
      DependencyEvalInfo::CSS(css) => Some(&css.exports),
      DependencyEvalInfo::PC(pc) => Some(&pc.exports.style),
    })
}

fn assert_get_mixin<'a>(
  iref: &ast::IncludeReference,
  context: &mut Context<'a>,
) -> Result<(&'a ast::MixinRule, &'a String), RuntimeError> {
  let (mixin_option, dependency_uri) = get_mixin(&iref, context)?;
  if let Some(mixin) = mixin_option {
    // make sure it's public
    if dependency_uri != context.uri {
      let style_import_option =
        get_style_import(context.uri, &iref.parts.first().unwrap().name, context);

      if let Some(import) = style_import_option {
        let export = import.mixins.get(&iref.parts.last().unwrap().name).unwrap();
        if !export.public {
          return Err(RuntimeError::new(
            "This mixin is private.".to_string(),
            context.uri,
            &iref.parts.last().unwrap().range,
          ));
        }
      }
    }

    return Ok((mixin, dependency_uri));
  } else {
    return Err(RuntimeError::new(
      "Reference not found.".to_string(),
      context.uri,
      &iref.parts.last().unwrap().range,
    ));
  }
}

fn include_mixin<'a>(
  inc: &ast::Include,
  style: &mut Vec<virt::CSSStyleProperty>,
  context: &mut Context,
  parent_selector_context: &SelectorContext,
) -> Result<(), RuntimeError> {
  let (mixin, dependency_uri) = assert_get_mixin(&inc.mixin_name, context)?;
  let (declarations, child_rules) = evaluate_mixin(
    mixin,
    dependency_uri,
    Some((context.uri.to_string(), inc)),
    context,
    parent_selector_context,
  )?;
  style.extend(declarations);
  context.all_rules.extend(child_rules);

  Ok(())
}

fn include_content<'a>(
  all_styles: &mut Vec<virt::CSSStyleProperty>,
  context: &mut Context<'a>,
  parent_selector_context: &SelectorContext,
) -> Result<(), RuntimeError> {
  if let Some(inc) = &context.content {
    let (uri, inc2) = inc.clone();
    let mut child_context = fork_context(&uri, context);
    evaluate_style_rules(&inc2.rules, context, &parent_selector_context)?;
    all_styles.extend(evaluate_style_declarations(
      &inc2.declarations,
      &mut child_context,
      parent_selector_context,
    )?);
  }

  Ok(())
}

fn evaluate_style_declarations<'a>(
  declarations: &Vec<ast::Declaration>,
  context: &mut Context<'a>,
  selector_context: &SelectorContext,
) -> Result<Vec<virt::CSSStyleProperty>, RuntimeError> {
  let mut style = vec![];
  for property in declarations {
    match property {
      ast::Declaration::KeyValue(kv) => {
        evaluate_style_key_value_declaration(kv, &mut style, context)?;
      }
      ast::Declaration::Include(inc) => {
        include_mixin(inc, &mut style, context, selector_context)?;
      }
      ast::Declaration::Content(_) => {
        include_content(&mut style, context, selector_context)?;
      }
      ast::Declaration::Media(media) => {
        let rule = evaluate_condition_rule(media, context, selector_context)?;
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
  context: &mut Context,
  selector_context: &SelectorContext,
) -> Result<(), RuntimeError> {
  evaluate_style_rule2(expr, context, selector_context)?;
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
      &expr.name.range,
    ));
  }

  Ok(())
}

fn evaluate_mixin<'a, 'b>(
  expr: &ast::MixinRule,
  owner_uri: &'a String,
  content: Option<(String, &'b ast::Include)>,
  context: &mut Context<'a>,
  parent_selector_context: &SelectorContext,
) -> Result<(Vec<virt::CSSStyleProperty>, Vec<virt::Rule>), RuntimeError> {
  let mut child_context = fork_context(owner_uri, context);
  child_context.content = content;
  let declarations = evaluate_style_declarations(
    &expr.declarations,
    &mut child_context,
    parent_selector_context,
  )?;

  evaluate_style_rules(&expr.rules, &mut child_context, parent_selector_context)?;

  Ok((declarations, child_context.all_rules))
}

fn evaluate_include_rule<'a>(
  expr: &ast::Include,
  context: &mut Context<'a>,
  selector_context: &SelectorContext,
) -> Result<(), RuntimeError> {
  let (mixin, dep_uri) = assert_get_mixin(&expr.mixin_name, context)?;
  let (declarations, rules) = evaluate_mixin(
    mixin,
    dep_uri,
    Some((context.uri.to_string(), expr)),
    context,
    selector_context,
  )?;
  context.all_rules.extend(rules);
  context.inc_declarations.extend(declarations);

  Ok(())
}

fn evaluate_style_rule2(
  expr: &ast::StyleRule,
  context: &mut Context,
  parent_selector_context: &SelectorContext,
) -> Result<(), RuntimeError> {
  lazy_static! {
    static ref class_name_re: Regex = Regex::new(r"\.(((\\.)?[\w\-_]+)+)").unwrap();
    static ref private_class_name_re: Regex = Regex::new(r"^_[^_]+$").unwrap();
    static ref scope_re: Regex = Regex::new(r"^_[^_]+_").unwrap();
    static ref escape_re: Regex = Regex::new(r"\\").unwrap();
  }

  let mut is_global_selector = false;

  let target_selector = if let ast::Selector::Global(selector) = &expr.selector {
    is_global_selector = true;
    &selector.selector
  } else {
    &expr.selector
  };

  let mut emitter: SelectorEmitter = SelectorEmitter::new(parent_selector_context.child());
  write_element_selector(&expr.selector, true, false, context, &mut emitter);

  for selector_context in emitter.into_iter() {
    let selector_text = selector_context.to_string();

    // Note that this is necessary for this case: .a { &--b { color: red; }}
    if class_name_re.is_match(selector_text.as_ref()) {
      // url check
      for caps in class_name_re.captures_iter(selector_text.as_str()) {
        let scoped_class_name = caps.get(1).unwrap().as_str();

        // skip ._93aa0a { } selectors. A bit hacky since this also captures selector names
        // with ._ prefix (._header or smth). Will want to fix this later
        if private_class_name_re.is_match(scoped_class_name) {
          continue;
        }
        let mut class_name = scope_re.replace(scoped_class_name, "").to_string();
        class_name = escape_re.replace_all(class_name.as_str(), "").to_string();

        let existing_option = context.exports.class_names.get(&class_name);

        if existing_option == None {
          context.exports.class_names.insert(
            class_name.to_string(),
            ClassNameExport {
              name: class_name.to_string(),
              scoped_name: escape_re.replace_all(scoped_class_name, "").to_string(),
              public: context.in_public_scope,
            },
          );
        }
      }
    }

    let rule_len = context.all_rules.len();

    evaluate_style_rules(&expr.children, context, selector_context)?;

    let style = evaluate_style_declarations(&expr.declarations, context, &selector_context)?;

    // covers nested @include
    if style.len() > 0 {
      context.all_rules.insert(
        rule_len,
        virt::Rule::Style(virt::StyleRule {
          exported: context.in_public_scope,
          source_id: expr.id.to_string(),
          selector_text: selector_context.to_string(),
          style,
        }),
      );
    }
  }

  Ok(())
}

fn get_element_scope_selector(context: &Context, extra_specificity: bool) -> String {
  if let Some((scope, is_instance)) = &context.element_scope {
    if *is_instance {
      format!("[class]._{}", scope)
    } else {
      let selector = format!("._{}", scope);
      if extra_specificity {
        format!("{}{}", selector, selector)
      } else {
        format!("{}", selector)
      }
    }
  } else {
    "".to_string()
  }
}

#[derive(PartialEq)]
struct SelectorEmitter {
  pub forked: bool,
  pub initial: SelectorContext,
  pub context: SelectorContext,
  pub next: Option<Box<SelectorEmitter>>,
}

impl SelectorEmitter {
  pub fn new(context: SelectorContext) -> SelectorEmitter {
    SelectorEmitter {
      forked: false,
      initial: context.clone(),
      context: context.clone(),
      next: None,
    }
  }
  pub fn append_element_scope_to_target(&mut self, force: bool) {
    self.context.append_element_scope_to_target(force);

    if let Some(next) = self.next.as_mut() {
      next.append_element_scope_to_target(force);
    }
  }
  pub fn push_target(&mut self, buffer: String) {
    if self.can_write() {
      self.context.push_target(buffer.clone());
    }

    if let Some(next) = self.next.as_mut() {
      next.push_target(buffer);
    }
  }
  pub fn append_parent_to_target(&mut self) {
    self.context.append_parent_to_target();

    if let Some(next) = self.next.as_mut() {
      next.append_parent_to_target();
    }
  }
  pub fn push_buffer(&mut self, buffer: String) {
    if self.can_write() {
      self.context.push_buffer(buffer.clone());
    }

    if let Some(next) = self.next.as_mut() {
      next.push_buffer(buffer);
    }
  }
  pub fn persist_buffer(&mut self) {
    if self.can_write() {
      self.context.persist_buffer();
    }

    if let Some(next) = self.next.as_mut() {
      next.persist_buffer();
    }
  }
  pub fn push_within(&mut self, buffer: String) {
    if self.can_write() {
      self.context.push_within(buffer.clone());
    }

    if let Some(next) = self.next.as_mut() {
      next.push_within(buffer);
    }
  }
  pub fn can_write(&self) -> bool {
    !self.context.empty() || self.next == None
  }
  pub fn split(&mut self) -> &mut SelectorEmitter {
    let mut end = self.end();
    let next = SelectorEmitter::new(end.initial.clone());
    end.next = Some(Box::new(next));
    end.next.as_mut().unwrap()
  }

  pub fn end(&mut self) -> &mut SelectorEmitter {
    if self.next == None {
      return self;
    } else {
      return self.next.as_mut().unwrap().end();
    }
  }

  pub fn fork(&mut self) {
    // Need to reset now -- covers `.a :global(.b, .c)`
    self.initial = self.context.clone();
    self.forked = true;
  }
  pub fn into_iter<'a>(&'a self) -> SelectorEmitterIterator<'a> {
    SelectorEmitterIterator {
      current: Some(self),
    }
  }
}

struct SelectorEmitterIterator<'a> {
  pub current: Option<&'a SelectorEmitter>,
}

impl<'a> Iterator for SelectorEmitterIterator<'a> {
  type Item = &'a SelectorContext;
  fn next(&mut self) -> Option<Self::Item> {
    if let Some(current) = self.current {
      self.current = if let Some(next) = current.next.as_ref() {
        Some(next)
      } else {
        None
      };

      if !current.context.empty() && !current.forked {
        Some(&current.context)
      } else {
        self.next()
      }
    } else {
      None
    }
  }
}

fn get_document_scope_selector(context: &Context) -> String {
  format!("._{}", get_document_scope(context))
}

fn get_scope_selector(context: &Context, is_global: bool) -> String {
  if is_global {
    "[class]".to_string()
  } else {
    format!("._{}", get_document_scope(context))
  }
}

fn write_element_selector(
  selector: &ast::Selector,
  is_target: bool,
  is_global: bool,
  context: &mut Context,
  emitter: &mut SelectorEmitter,
) {
  match selector {
    ast::Selector::Group(group) => {
      emitter.fork();
      let mut curr = emitter;
      for selector in &group.selectors {
        curr = curr.split();
        write_element_selector(selector, is_target, is_global, context, curr);
      }
    }
    ast::Selector::Global(selector) => {
      // note that we don't want to include extra specificity for global
      // selectors since they're outside of PC context -- extra specificty demands at _minimum_ [class]
      // and not every element will have that outside of PC.
      write_element_selector(&selector.selector, false, true, context, emitter);
    }
    ast::Selector::Within(selector) => {
      let mut scope = SelectorEmitter::new(SelectorContext::nil());
      write_element_selector(&selector.selector, true, false, context, &mut scope);

      emitter.fork();

      let mut curr = emitter;
      for scope_context in scope.into_iter() {
        curr = curr.split();

        // :within defined within root style block
        if curr.context.empty() {
          curr.push_target(get_document_scope_selector(context));
        }

        curr.push_within(scope_context.to_string().trim().to_string());
      }
    }
    ast::Selector::This(this) => {
      emitter.append_element_scope_to_target(false);

      // cover :self(.selector)
      if let Some(selector) = &this.selector {
        write_element_selector(selector, false, false, context, emitter);
      }

      // if is_target {
      //   emitter.push_target(get_scope_selector(context, is_global));
      // }
    }
    ast::Selector::Prefixed(prefixed) => {
      let connector = prefixed.connector.trim().to_string();

      if emitter.context.parent != None {
        emitter.append_parent_to_target();
      } else {
        // cover `<style>&.a { }</style>`
        emitter.append_element_scope_to_target(true);
      }

      // trimming needs to happen in this case `&& {}`. Still works with `& & {}` since that's a descendent selector
      emitter.push_target(connector);
      if let Some(postfix) = &prefixed.postfix_selector {
        // target already came from parent, so ignore
        write_element_selector(&postfix, false, is_global, context, emitter);
      }
    }
    ast::Selector::Element(element) => {
      emitter.push_target(element.tag_name.to_string());
      if is_target {
        emitter.push_target(get_scope_selector(context, is_global));
      }
    }
    ast::Selector::Descendent(selector) => {
      write_element_selector(&selector.ancestor, is_target, is_global, context, emitter);
      emitter.push_target(" ".to_string());
      write_element_selector(&selector.descendent, is_target, is_global, context, emitter);
    }
    ast::Selector::Child(selector) => {
      write_element_selector(&selector.parent, is_target, is_global, context, emitter);
      emitter.push_target(" > ".to_string());
      write_element_selector(&selector.child, is_target, is_global, context, emitter);
    }
    ast::Selector::Sibling(selector) => {
      write_element_selector(&selector.selector, is_target, is_global, context, emitter);
      emitter.push_target(" ~ ".to_string());
      write_element_selector(
        &selector.sibling_selector,
        is_target,
        is_global,
        context,
        emitter,
      );
    }
    ast::Selector::Adjacent(selector) => {
      write_element_selector(&selector.selector, is_target, is_global, context, emitter);
      emitter.push_target(" + ".to_string());
      write_element_selector(
        &selector.next_sibling_selector,
        is_target,
        is_global,
        context,
        emitter,
      );
    }
    ast::Selector::PseudoElement(selector) => {
      if selector.name == "root" {
        if is_global {
          emitter.push_target(":root".to_string());
        } else {
          emitter.push_target(get_document_scope_selector(context));
        }
      } else {
        if is_target {
          emitter.push_target(format!(
            "{}{}{}",
            get_scope_selector(context, is_global),
            selector.separator,
            selector.name
          ));
        } else {
          emitter.push_target(format!("{}{}", selector.separator, selector.name));
        }
      }
    }
    ast::Selector::AllSelector(_) => {
      // need to make sure it's not part of combo
      if is_global {
        emitter.push_target("*".to_string())
      } else {
        emitter.push_target(get_scope_selector(context, is_global));
      }
    }
    ast::Selector::Id(selector) => {
      emitter.push_target(format!("#{}", selector.id));
      if is_target {
        if is_global {
          emitter.push_target(format!("#{}", selector.id));
        } else {
          emitter.push_target(get_document_scope_selector(context));
        }
      }
    }
    ast::Selector::PseudoParamElement(selector) => {
      if is_target {
        emitter.push_target(get_document_scope_selector(context));
      }
      emitter.push_target(format!(":{}({})", selector.name, selector.param));
    }
    ast::Selector::Attribute(selector) => {
      emitter.push_target(selector.to_string());
      if is_global {
        emitter.push_target(selector.to_string());
      }
      if is_target {
        emitter.push_target(get_document_scope_selector(context));
      }
    }
    ast::Selector::Not(selector) => {
      if is_target {
        emitter.push_target(get_document_scope_selector(context));
      }

      if is_global {
        emitter.push_target(get_scope_selector(context, is_global));
      }

      emitter.push_buffer(":not(".to_string());

      write_element_selector(&selector.selector, false, is_global, context, emitter);
      emitter.push_buffer(")".to_string());
      emitter.persist_buffer();
    }
    ast::Selector::SubElement(selector) => {
      // Note that we don't want extra specificty in :not selector since :not
      // doesn't support things like :not([class].class)

      if is_target {
        emitter.push_target(get_scope_selector(context, is_global));
      }

      emitter.push_buffer(format!(":{}(", selector.name));

      write_element_selector(&selector.selector, true, is_global, context, emitter);
      emitter.push_buffer(")".to_string());
      emitter.persist_buffer();
    }
    ast::Selector::Combo(combo) => {
      let mut found_pseudo = false;

      for child in &combo.selectors {
        let is_pseudo = is_pseudo_element(child);

        write_element_selector(
          child,
          // This is _very_ redundant, but we want to pass down extra_specificity
          // and extra_specificity since things like class names need to remain injectible
          // in other docs. This particular case happens with .a:within(.b)
          !found_pseudo && is_pseudo,
          is_global,
          context,
          emitter,
        );

        found_pseudo = found_pseudo || is_pseudo;
      }

      if is_target && !found_pseudo {
        emitter.push_target(get_scope_selector(context, is_global));
      }
    }

    // NOTE that classes behave differently than other selectors since they can be
    // injected into other documents via $. Because of this, the document scope is included in the selector
    ast::Selector::Class(selector) => {
      // Don't hate me for adding [class] -- it's the browsers fault, I promise. Each
      // selector other than class has a scope class, and that gives priority over
      // any class. So to counter-balance that, we need to add [class] so that classes take priority, again.

      let new_class_name = if is_global {
        format!(".{}", selector.class_name)
      } else {
        format!("._{}_{}", get_document_scope(context), selector.class_name)
      };

      let mut selector_text = new_class_name.to_string();

      // specificity needs to be same as other selectors that include document
      // scope class, so just double-up class name
      // NOTE!! [class] is necessary here to cover this case: `.a { &--b { }}`
      // while also remaining injectable in other documents
      if is_target {
        selector_text = format!("[class]{}", new_class_name);
      }

      emitter.push_target(selector_text);
    }
  }
}

fn is_pseudo_element(child: &ast::Selector) -> bool {
  match child {
    ast::Selector::PseudoElement(_) | ast::Selector::PseudoParamElement(_) => true,
    _ => false,
  }
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
    format!("_{}_{}", context.private_scope, value)
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
    static ref url_re: Regex = Regex::new(r#"url\((?:['"]?)([^(]*?)(?:['"]?)\)"#).unwrap();
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
          &expr.value_range,
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
        source: ExprTextSource::new(context.uri.to_string(), expr.range.clone()),
      },
    );
  }

  declarations.push(virt::CSSStyleProperty {
    source_id: expr.id.to_string(),
    name: expr.name.to_string(),
    value: value.to_string(),
  });

  for start in css3_name_starts.iter() {
    if expr.name.starts_with(start) {
      for prefix in css3_prefixes.iter() {
        declarations.push(virt::CSSStyleProperty {
          source_id: expr.id.to_string(),
          name: format!("{}{}", prefix, expr.name.to_string()),
          value: value.to_string(),
        });
      }
    }
  }

  Ok(())
}
