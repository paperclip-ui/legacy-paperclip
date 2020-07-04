use super::super::ast;
use super::cache::Cache;
use super::export::Exports;
use super::virt;
use crate::base::ast::{ExprSource, Location};
use crate::base::runtime::RuntimeError;
use crate::base::utils::{get_document_style_scope, is_relative_path};
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph};
use crate::core::vfs::VirtualFileSystem;
use crate::css::runtime::evaluator::{evaluate as evaluate_css, EvalInfo as CSSEvalInfo};
use crate::css::runtime::export as css_export;
use crate::css::runtime::virt as css_virt;
use crate::js::ast as js_ast;
use crate::js::runtime::evaluator::evaluate as evaluate_js;
use crate::js::runtime::virt as js_virt;
use serde::Serialize;
use std::collections::{BTreeMap, HashMap, HashSet};
use std::iter::FromIterator;

#[derive(Clone)]
pub struct Context<'a> {
  pub graph: &'a DependencyGraph,
  pub vfs: &'a VirtualFileSystem,
  pub uri: &'a String,
  pub import_ids: HashSet<&'a String>,
  pub part_ids: HashSet<&'a String>,
  pub scope: String,
  pub data: &'a js_virt::JsValue,
  pub render_call_stack: Vec<(String, RenderStrategy)>,
  pub imports: &'a HashMap<String, Exports>,
}

impl<'a> Context<'a> {
  pub fn get_current_render_strategy(&self) -> &(String, RenderStrategy) {
    self
      .render_call_stack
      .get(self.render_call_stack.len() - 1)
      .unwrap()
  }
}

#[derive(Clone, PartialEq, Debug)]
pub enum RenderStrategy {
  Part(String),
  Preview,
  Auto,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct EvalInfo {
  pub sheet: css_virt::CSSSheet,
  pub preview: virt::Node,
  pub exports: Exports,
}

pub fn evaluate<'a>(
  uri: &String,
  graph: &'a DependencyGraph,
  vfs: &'a VirtualFileSystem,
  imports: &'a HashMap<String, Exports>,
) -> Result<Option<EvalInfo>, RuntimeError> {
  let dep = graph.dependencies.get(uri).unwrap();
  if let DependencyContent::Node(node_expr) = &dep.content {
    let data = js_virt::JsValue::JsObject(js_virt::JsObject::new(ExprSource::new(
      uri.clone(),
      node_expr.get_location().clone(),
    )));
    let mut context = create_context(node_expr, uri, graph, vfs, &data, None, imports);

    let mut preview = wrap_as_fragment(
      evaluate_instance_node(node_expr, &mut context, RenderStrategy::Auto, false, None)?,
      &context,
    );

    // don't want to do this, actually.
    // let style = evaluate_jumbo_style(node_expr, &mut context)?;

    let (sheet, css_exports) = evaluate_document_sheet(uri, node_expr, &mut context)?;

    Ok(Some(EvalInfo {
      sheet,
      preview,
      exports: Exports {
        style: css_exports,
        components: HashSet::from_iter(context.part_ids.iter().map(|id| id.to_string())),
      },
    }))
  } else {
    Err(RuntimeError::new(
      "Incorrect file type".to_string(),
      uri,
      &Location { start: 0, end: 0 },
    ))
  }
}

fn wrap_as_fragment(node_option: Option<virt::Node>, context: &Context) -> virt::Node {
  if let Some(node) = node_option {
    match node {
      virt::Node::Fragment(fragment) => virt::Node::Fragment(fragment),
      _ => virt::Node::Fragment(virt::Fragment {
        source: node.get_source().clone(),
        children: vec![node],
      }),
    }
  } else {
    virt::Node::Fragment(virt::Fragment {
      children: vec![],
      source: ExprSource::virt(context.uri.clone()),
    })
  }
}

pub fn get_instance_target_node<'a>(
  node_expr: &'a ast::Node,
  render_strategy: &RenderStrategy,
  imported: bool,
) -> Option<&'a ast::Node> {
  let target_node_option = match render_strategy {
    RenderStrategy::Part(id) => find_child(node_expr, |child| {
      ast::get_attribute_value("as", child) == Some(&id)
        && ast::has_attribute("component", child)
        && (!imported || ast::has_attribute("export", child))
    }),
    RenderStrategy::Auto | RenderStrategy::Preview => {
      find_child(node_expr, |child| ast::has_attribute("preview", child))
    }
  };

  if let Some(target_node) = target_node_option {
    Some(target_node)
  } else if render_strategy == &RenderStrategy::Auto {
    Some(node_expr)
  } else {
    None
  }
}

fn find_child<TTest>(parent: &ast::Node, test: TTest) -> Option<&ast::Node>
where
  TTest: Fn(&ast::Element) -> bool,
{
  match ast::get_children(parent) {
    Some(children) => children.iter().find(|child| {
      if let ast::Node::Element(element) = child {
        if test(element) {
          return true;
        }
      }
      false
    }),
    None => None,
  }
}

pub fn evaluate_document_styles<'a>(
  node_expr: &ast::Node,
  uri: &String,
  vfs: &'a VirtualFileSystem,
  graph: &'a DependencyGraph,
  include_imported_styled: bool,
) -> Result<(css_virt::CSSSheet, css_export::Exports), RuntimeError> {
  let mut sheet = css_virt::CSSSheet { rules: vec![] };
  let entry = graph.dependencies.get(uri).unwrap();

  let mut css_imports: HashMap<String, css_export::Exports> = HashMap::new();

  for (id, dep_uri) in &entry.dependencies {
    let imp = graph.dependencies.get(dep_uri).unwrap();

    match &imp.content {
      DependencyContent::Node(imp_node) => {
        let (imp_sheet, imp_exports) =
          evaluate_document_styles(imp_node, dep_uri, vfs, graph, include_imported_styled)?;

        css_imports.insert(id.to_string(), imp_exports);
        if include_imported_styled {
          sheet.extend(imp_sheet);
        }
      }
      DependencyContent::StyleSheet(imp_style) => {
        let info = evaluate_css(
          imp_style,
          dep_uri,
          &get_document_style_scope(&dep_uri),
          vfs,
          &HashMap::new(),
        )?;

        match info {
          CSSEvalInfo {
            sheet: imp_sheet,
            exports: imp_exports,
          } => {
            css_imports.insert(id.to_string(), imp_exports);
            if include_imported_styled {
              sheet.extend(imp_sheet);
            }
          }
        }
      }
    };
  }

  let mut css_exports: css_export::Exports = css_export::Exports::new();

  let children_option = ast::get_children(&node_expr);
  let scope = get_document_style_scope(uri);
  if let Some(children) = children_option {
    // style elements are only allowed in root, so no need to traverse
    for child in children {
      if let ast::Node::StyleElement(style_element) = &child {
        let info = evaluate_css(&style_element.sheet, uri, &scope, vfs, &css_imports)?;

        match info {
          CSSEvalInfo {
            sheet: child_sheet,
            exports: child_exports,
          } => {
            sheet.extend(child_sheet);
            css_exports.extend(&child_exports);
          }
        }
      }
    }
  }

  Ok((sheet, css_exports))
}

fn evaluate_document_sheet<'a>(
  uri: &String,
  entry_expr: &ast::Node,
  context: &'a mut Context,
) -> Result<(css_virt::CSSSheet, css_export::Exports), RuntimeError> {
  let mut sheet = css_virt::CSSSheet { rules: vec![] };
  let entry = context.graph.dependencies.get(uri).unwrap();

  let mut css_exports: css_export::Exports = css_export::Exports::new();
  let mut css_imports: HashMap<String, css_export::Exports> = HashMap::new();

  for (id, imp) in context.imports {
    css_imports.insert(id.to_string(), imp.style.clone());
  }

  // for (id, dep_uri) in &entry.dependencies {
  //   let imp_option = context.imports.get(dep_uri);
  //   if let Some(imp) = imp_option {
  //     css_imports.insert(id.to_string(), imp.style.clone());
  //   }
  // }

  let children_option = ast::get_children(&entry_expr);
  let scope = get_document_style_scope(uri);
  if let Some(children) = children_option {
    // style elements are only allowed in root, so no need to traverse
    for child in children {
      if let ast::Node::StyleElement(style_element) = &child {
        let info = evaluate_css(&style_element.sheet, uri, &scope, context.vfs, &css_imports)?;
        match info {
          CSSEvalInfo {
            sheet: child_sheet,
            exports: child_exports,
          } => {
            sheet.extend(child_sheet);
            css_exports.extend(&child_exports);
          }
        }
      }
    }
  }

  Ok((sheet, css_exports))
}

pub fn evaluate_jumbo_style<'a>(
  entry_expr: &ast::Node,
  context: &'a mut Context,
) -> Result<virt::Node, RuntimeError> {
  let mut sheet = css_virt::CSSSheet { rules: vec![] };
  let uri = context.uri;

  // this element styles always get priority.
  let (child_sheet, _) =
    evaluate_document_styles(&entry_expr, &uri, context.vfs, context.graph, true)?;
  sheet.extend(child_sheet);

  Ok(virt::Node::StyleElement(virt::StyleElement {
    sheet,
    source: ExprSource::virt(context.uri.clone()),
  }))
}

pub fn evaluate_instance_node<'a>(
  node_expr: &ast::Node,
  context: &'a mut Context,
  render_strategy: RenderStrategy,
  imported: bool,
  instance_source: Option<ExprSource>,
) -> Result<Option<virt::Node>, RuntimeError> {
  context
    .render_call_stack
    .push((context.uri.to_string(), render_strategy.clone()));
  let target_option = get_instance_target_node(node_expr, &render_strategy, imported);
  if let Some(target) = target_option {
    evaluate_node(target, true, instance_source, context)
  } else {
    Ok(None)
  }
}

fn create_context<'a>(
  node_expr: &'a ast::Node,
  uri: &'a String,
  graph: &'a DependencyGraph,
  vfs: &'a VirtualFileSystem,
  data: &'a js_virt::JsValue,
  parent_option: Option<&'a Context>,
  imports: &'a HashMap<String, Exports>,
) -> Context<'a> {
  let render_call_stack = if let Some(parent) = parent_option {
    parent.render_call_stack.clone()
  } else {
    vec![]
  };

  let scope = get_document_style_scope(uri);

  Context {
    graph,
    uri,
    vfs,
    render_call_stack,
    imports,
    import_ids: HashSet::from_iter(ast::get_import_ids(node_expr)),
    part_ids: HashSet::from_iter(ast::get_part_ids(node_expr)),
    scope,
    data,
  }
}

pub fn evaluate_node<'a>(
  node_expr: &ast::Node,
  is_root: bool,
  instance_source: Option<ExprSource>,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  match &node_expr {
    ast::Node::Element(el) => evaluate_element(&el, is_root, instance_source, context),
    ast::Node::StyleElement(el) => evaluate_style_element(&el, context),
    ast::Node::Text(text) => Ok(Some(virt::Node::Text(virt::Text {
      source: ExprSource {
        uri: context.uri.to_string(),
        location: text.location.clone(),
      },
      value: text.value.to_string(),
    }))),
    ast::Node::Slot(slot) => evaluate_slot(&slot, context),
    ast::Node::Fragment(el) => evaluate_fragment(&el, context),
    ast::Node::Comment(_el) => Ok(None),
  }
}

fn evaluate_element<'a>(
  element: &ast::Element,
  is_root: bool,
  instance_source: Option<ExprSource>,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  match element.tag_name.as_str() {
    "import" => evaluate_import_element(element, context),
    "script" | "property" | "logic" => Ok(None),
    _ => {
      if ast::has_attribute("component", element) {
        if let Some(id) = ast::get_attribute_value("as", element) {
          if context.get_current_render_strategy()
            != &(
              context.uri.to_string(),
              RenderStrategy::Part(id.to_string()),
            )
          {
            return Ok(None);
          }
        }
      }

      let source = instance_or_element_source(element, context.uri, instance_source);

      if context.import_ids.contains(&ast::get_tag_name(&element)) {
        let result = evaluate_imported_component(element, source, context);

        if Ok(None) == result {
          return Err(RuntimeError::new(
            "Unable to find component, or it's not exported.".to_string(),
            &context.uri,
            &element.open_tag_location,
          ));
        }

        result
      } else if context.part_ids.contains(&element.tag_name) {
        evaluate_part_instance_element(element, source, context)
      } else {
        if element.tag_name == "fragment" {
          evaluate_children_as_fragment(&element.children, &element.location, context)
        } else {
          evaluate_native_element(element, is_root, source, context)
        }
      }
    }
  }
}

fn instance_or_element_source<'a>(
  element: &ast::Element,
  dep_uri: &String,
  source_option: Option<ExprSource>,
) -> Option<ExprSource> {
  if let Some(source) = source_option {
    Some(source)
  } else {
    Some(ExprSource {
      uri: dep_uri.clone(),
      location: element.location.clone(),
    })
  }
}

fn evaluate_slot<'a>(
  slot: &ast::Slot,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {

  assert_slot_in_instance(&slot.location, context)?;

  let script = &slot.script;
  let mut js_value = evaluate_js(script, context)?;

  // if array of values, then treat as document fragment
  if let js_virt::JsValue::JsArray(ary) = &mut js_value {
    let mut children = vec![];
    for item in ary.values.drain(0..) {
      if let js_virt::JsValue::JsNode(child) = item {
        children.push(child);
      } else {
        children.push(virt::Node::Text(virt::Text {
          source: item.get_source().clone(),
          value: item.to_string(),
        }))
      }
    }

    return Ok(Some(virt::Node::Fragment(virt::Fragment {
      children,
      source: ary.source.clone(),
    })));
  } else if let js_virt::JsValue::JsNode(node) = js_value {
    return Ok(Some(node));
  }

  Ok(Some(virt::Node::Text(virt::Text {
    source: js_value.get_source().clone(),
    value: js_value.to_string(),
  })))
}

pub fn evaluate_imported_component<'a>(
  element: &ast::Element,
  instance_source: Option<ExprSource>,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  let self_dep = &context.graph.dependencies.get(context.uri).unwrap();
  let dep_uri = &self_dep
    .dependencies
    .get(&ast::get_tag_name(element))
    .unwrap();
  let namespace_option = ast::get_tag_namespace(element);
  evaluate_component_instance(
    element,
    if let Some(part) = namespace_option {
      RenderStrategy::Part(part)
    } else {
      RenderStrategy::Part("default".to_string())
    },
    true,
    instance_source,
    dep_uri,
    context,
  )
}

fn in_render_stack<'a>(strategy: &RenderStrategy, context: &'a mut Context) -> bool {
  context
    .render_call_stack
    .iter()
    .any(|(uri, part)| uri == context.uri && part == strategy)
}

fn check_instance_loop<'a>(
  strategy: &RenderStrategy,
  element: &ast::Element,
  context: &'a mut Context,
) -> Result<(), RuntimeError> {
  let tag_option = match strategy {
    RenderStrategy::Part(id) => Some(id.to_string()),
    RenderStrategy::Preview | RenderStrategy::Auto => None,
  };

  if let Some(tag) = tag_option {
    if in_render_stack(strategy, context) {
      return Err(RuntimeError {
        uri: context.uri.to_string(),
        message: format!(
          "Can't call <{} /> here since this causes an infinite loop!",
          tag
        )
        .to_string(),
        location: element.open_tag_location.clone(),
      });
    } else {
      Ok(())
    }
  } else {
    Ok(())
  }
}

fn evaluate_part_instance_element<'a>(
  element: &ast::Element,
  instance_source: Option<ExprSource>,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  let self_dep = &context.graph.dependencies.get(context.uri).unwrap();

  if let DependencyContent::Node(_root_node) = &self_dep.content {
    evaluate_component_instance(
      element,
      RenderStrategy::Part(element.tag_name.to_string()),
      false,
      instance_source,
      context.uri,
      context,
    )
  } else {
    // This should _never_ happen
    Err(RuntimeError::unknown(context.uri))
  }
}

fn create_component_instance_data<'a>(
  instance_element: &ast::Element,
  context: &'a mut Context,
) -> Result<js_virt::JsValue, RuntimeError> {
  let mut data = js_virt::JsObject::new(ExprSource {
    uri: context.uri.clone(),
    location: instance_element.location.clone(),
  });

  let mut property_bound_attrs: Vec<&ast::PropertyBoundAttribute> = vec![];

  for attr_expr in &instance_element.attributes {
    let attr = &attr_expr;
    match attr {
      ast::Attribute::KeyValueAttribute(kv_attr) => {
        if kv_attr.value == None {
          data.values.insert(
            kv_attr.name.to_string(),
            js_virt::JsValue::JsBoolean(js_virt::JsBoolean {
              value: true,
              source: ExprSource::new(context.uri.clone(), kv_attr.location.clone()),
            }),
          );
        } else {
          let value = evaluate_attribute_value(
            &kv_attr.name,
            &kv_attr.value.as_ref().unwrap(),
            false,
            context,
          )?;

          data.values.insert(kv_attr.name.to_string(), value);
        }
      }
      ast::Attribute::SpreadAttribute(attr) => {
        assert_slot_in_instance(&attr.location, context)?;
        let attr_data = evaluate_js(&attr.script, context)?;
        match attr_data {
          js_virt::JsValue::JsObject(mut object) => {
            for (key, value) in object.values.drain() {
              data.values.insert(key.to_string(), value);
            }
          }
          _ => {
            return Err(RuntimeError::new(
              "Spread value must be an object.".to_string(),
              context.uri,
              &instance_element.location,
            ));
          }
        };
      }
      ast::Attribute::ShorthandAttribute(sh_attr) => {


        assert_slot_in_instance(&sh_attr.location, context)?;

        let name = sh_attr.get_name().map_err(|message| RuntimeError {
          uri: context.uri.to_string(),
          message: message.to_string(),
          location: Location { start: 0, end: 0 },
        })?;

        data.values.insert(
          name.to_string(),
          evaluate_attribute_slot(&sh_attr.reference, context)?,
        );
      }
      ast::Attribute::PropertyBoundAttribute(kv_attr) => {
        assert_slot_in_instance(&kv_attr.location, context)?;
        property_bound_attrs.push(kv_attr);
      }
    };
  }

  // property bound attributes happen at the end so that we ensure that they're actually
  // added
  if property_bound_attrs.len() > 0 {
    for kv_attr in property_bound_attrs {
      match context.data {
        js_virt::JsValue::JsObject(object) => {
          let value_option = object.values.get(&kv_attr.binding_name);
          if let Some(prop_value) = value_option {
            if prop_value.truthy() {
              let value = if let Some(attr_value) = &kv_attr.value {
                evaluate_attribute_value(&kv_attr.name, attr_value, false, context)?
              } else {
                evaluate_attribute_string(
                  &kv_attr.name,
                  &kv_attr.binding_name,
                  &kv_attr.location,
                  false,
                  context,
                )?
              };

              let combined_value = if let Some(existing_value) = data.values.get(&kv_attr.name) {
                js_virt::JsValue::JsString(js_virt::JsString {
                  value: format!(
                    "{} {}",
                    stringify_attribute_value(&kv_attr.name, existing_value),
                    value.to_string()
                  ),
                  source: ExprSource::new(context.uri.clone(), kv_attr.location.clone()),
                })
              } else {
                value
              };

              data.values.insert(kv_attr.name.to_string(), combined_value);
            }
          }
        }
        _ => {}
      }
    }
  }

  let mut js_children = js_virt::JsArray::new(ExprSource::new(
    context.uri.clone(),
    instance_element.location.clone(),
  ));
  let children: Vec<js_virt::JsValue> = evaluate_children(&instance_element.children, context)?
    .into_iter()
    .map(|child| js_virt::JsValue::JsNode(child))
    .collect();

  js_children.values.extend(children);

  data.values.insert(
    "children".to_string(),
    js_virt::JsValue::JsArray(js_children),
  );

  Ok(js_virt::JsValue::JsObject(data))
}

fn combine_attr_value(
  value: String,
  other_value: Option<&Option<String>>,
  separator: String,
) -> String {
  if let Some(v) = other_value {
    if let Some(v2) = v {
      return format!("{}{}{}", value, separator, v2);
    }
  }

  return value;
}

fn evaluate_component_instance<'a>(
  instance_element: &ast::Element,
  render_strategy: RenderStrategy,
  imported: bool,
  instance_source: Option<ExprSource>,
  dep_uri: &String,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  let dep = &context
    .graph
    .dependencies
    .get(&dep_uri.to_string())
    .unwrap();
  let data = create_component_instance_data(instance_element, context)?;

  if let DependencyContent::Node(node) = &dep.content {
    let mut instance_context = create_context(
      &node,
      dep_uri,
      context.graph,
      context.vfs,
      &data,
      Some(&context),
      context.imports,
    );
    check_instance_loop(&render_strategy, instance_element, &mut instance_context)?;
    // TODO: if fragment, then wrap in span. If not, then copy these attributes to root element

    let source = if let Some(source) = instance_source {
      source.clone()
    } else {
      ExprSource {
        uri: dep_uri.to_string(),
        location: instance_element.location.clone(),
      }
    };

    evaluate_instance_node(
      &node,
      &mut instance_context,
      render_strategy,
      imported,
      Some(source),
    )
  } else {
    Err(RuntimeError::unknown(context.uri))
  }
}

fn evaluate_native_element<'a>(
  element: &ast::Element,
  is_root: bool,
  instance_source: Option<ExprSource>,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  let mut attributes: BTreeMap<String, Option<String>> = BTreeMap::new();

  let tag_name = ast::get_tag_name(element);

  let mut property_bound_attrs: Vec<&ast::PropertyBoundAttribute> = vec![];

  for attr_expr in &element.attributes {
    let attr = &attr_expr;

    match attr {
      ast::Attribute::KeyValueAttribute(kv_attr) => {
        let (name, mut value_option) = if kv_attr.value == None {
          (kv_attr.name.to_string(), None)
        } else {
          let value = evaluate_attribute_value(
            &kv_attr.name,
            &kv_attr.value.as_ref().unwrap(),
            true,
            context,
          )?;
          if !value.truthy() {
            continue;
          }
          (
            kv_attr.name.to_string(),
            Some(stringify_attribute_value(&kv_attr.name, &value)),
          )
        };

        if name == "export" || name == "component" || name == "as" {
          continue;
        }

        // value_option = evaluate_attribute_string_value(&name, value_option, context);

        attributes.insert(name.to_string(), value_option);
      }
      ast::Attribute::PropertyBoundAttribute(kv_attr) => {
        assert_slot_in_instance(&kv_attr.location, context)?;
        property_bound_attrs.push(kv_attr);
      }
      ast::Attribute::SpreadAttribute(attr) => {
        assert_slot_in_instance(&attr.location, context)?;
        let attr_data = evaluate_js(&attr.script, context)?;
        match attr_data {
          js_virt::JsValue::JsObject(mut object) => {
            for (key, value) in object.values.drain() {
              attributes.insert(key.to_string(), Some(value.to_string()));
            }
          }
          _ => {
            return Err(RuntimeError::new(
              "Spread value must be an object.".to_string(),
              context.uri,
              &element.location,
            ));
          }
        };
      }
      ast::Attribute::ShorthandAttribute(sh_attr) => {
        assert_slot_in_instance(&sh_attr.location, context)?;
        let name = sh_attr.get_name().map_err(|message| RuntimeError {
          uri: context.uri.to_string(),
          message: message.to_string(),
          location: Location { start: 0, end: 0 },
        })?;
        let js_value = evaluate_attribute_slot(&sh_attr.reference, context)?;

        if js_value.truthy() {
          attributes.insert(
            name.to_string(),
            Some(stringify_attribute_value(&name, &js_value)),
          );
        }
      }
    };
  }

  if property_bound_attrs.len() > 0 {
    for kv_attr in property_bound_attrs {
      match context.data {
        js_virt::JsValue::JsObject(object) => {
          let value_option = object.values.get(&kv_attr.binding_name);
          if let Some(prop_value) = value_option {
            if prop_value.truthy() {
              let value = if let Some(kv_value) = &kv_attr.value {
                evaluate_attribute_value(&kv_attr.name, &kv_value, true, context)?
              } else {
                evaluate_attribute_string(
                  &kv_attr.name,
                  &kv_attr.binding_name,
                  &kv_attr.location,
                  true,
                  context,
                )?
              };

              let combined_value = combine_attr_value(
                stringify_attribute_value(&kv_attr.name, &value),
                attributes.get(&kv_attr.name),
                " ".to_string(),
              );

              attributes.insert(kv_attr.name.to_string(), Some(combined_value));
            }
          }
        }
        _ => {}
      }
    }
  }

  // if is_root {
  //   if let js_virt::JsValue::JsObject(object) = &context.data {
  //     let class_key = "class".to_string();
  //     let class_option = object.values.get(&class_key);
  //     if let Some(class) = class_option {
  //       let existing_option = attributes.get(&class_key);
  //       if let Some(existing) = existing_option {
  //         if existing != &None {
  //           let combined_class = format!("{} {}", existing.clone().unwrap(), class);
  //           attributes.insert(class_key, Some(combined_class));
  //         }
  //       }
  //     }
  //   }
  // }

  let name = format!("data-pc-{}", context.scope.to_string()).to_string();

  attributes.insert(name.to_string(), None);

  let children = evaluate_children(&element.children, context)?;

  Ok(Some(virt::Node::Element(virt::Element {
    source: if let Some(source) = &instance_source {
      source.clone()
    } else {
      ExprSource {
        uri: context.uri.to_string(),
        location: element.location.clone(),
      }
    },
    tag_name: tag_name,
    attributes,
    children,
  })))
}

fn stringify_attribute_value(key: &String, value: &js_virt::JsValue) -> String {
  if key == "style" {
    if let js_virt::JsValue::JsObject(object) = value {
      let mut buffer = String::new();
      for (key, value) in object.values.iter() {
        buffer = format!("{}{}:{};", buffer, key.to_string(), value.to_string());
      }
      return buffer;
    }
  }

  return value.to_string();
}

// fn evaluate_attribute_string_value<'a>(name: &String, value_option: Option<String>, context: &'a Context) -> Option<String> {
//   let mut value_option2 = value_option;

//   if name == "src" {
//     if let Some(value) = value_option2 {
//       if is_relative_path(&value) {
//         let full_path = context.vfs.resolve(context.uri, &value);
//         value_option2 = Some(full_path);
//       } else {
//         value_option2 = None;
//       }
//     }
//   }

//   value_option2
// }

fn evaluate_import_element<'a>(
  _element: &ast::Element,
  _context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  Ok(None)
}

fn evaluate_style_element<'a>(
  _element: &ast::StyleElement,
  _context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  Ok(None)
}

fn evaluate_children<'a>(
  children_expr: &Vec<ast::Node>,
  context: &'a mut Context,
) -> Result<Vec<virt::Node>, RuntimeError> {
  let mut children: Vec<virt::Node> = vec![];

  for child_expr in children_expr {
    match evaluate_node(child_expr, false, None, context)? {
      Some(c) => match c {
        virt::Node::Fragment(mut fragment) => {
          for child in fragment.children.drain(0..) {
            children.push(child);
          }
        }
        _ => {
          children.push(c);
        }
      },
      None => {}
    }
  }

  Ok(children)
}

fn evaluate_fragment<'a>(
  fragment: &ast::Fragment,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  evaluate_children_as_fragment(&fragment.children, &fragment.location, context)
}

fn evaluate_children_as_fragment<'a>(
  children: &Vec<ast::Node>,
  location: &Location,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  let mut children = evaluate_children(&children, context)?;
  Ok(Some(virt::Node::Fragment(virt::Fragment {
    children,
    source: ExprSource {
      uri: context.uri.clone(),
      location: location.clone(),
    },
  })))
}

fn evaluate_attribute_value<'a>(
  name: &String,
  value: &ast::AttributeValue,
  is_native: bool,
  context: &mut Context,
) -> Result<js_virt::JsValue, RuntimeError> {
  match value {
    ast::AttributeValue::DyanmicString(st) => {
      evaluate_attribute_dynamic_string(name, st, &st.location, is_native, context)
    }
    ast::AttributeValue::String(st) => {
      evaluate_attribute_string(name, &st.value, &st.location, is_native, context)
    }
    ast::AttributeValue::Slot(value) => {
      assert_slot_in_instance(&value.location, context)?;
      evaluate_attribute_slot(&value.script, context)
    },
  }
}

fn evaluate_attribute_dynamic_string<'a>(
  name: &String,
  value: &ast::AttributeDynamicStringValue,
  location: &Location,
  is_native: bool,
  context: &mut Context,
) -> Result<js_virt::JsValue, RuntimeError> {
  let val = value
    .values
    .iter()
    .map(|val| match val {
      ast::AttributeDynamicStringPart::Literal(value) => {
        evaluate_attribute_string(name, &value.value, &value.location, is_native, context)
          .unwrap()
          .to_string()
      }
      ast::AttributeDynamicStringPart::ClassNamePierce(pierce) => {
        if pierce.class_name.contains(".") {
          let parts = pierce.class_name.split(".").collect::<Vec<&str>>();
          let imp = parts.first().unwrap().to_string();
          let dep_option = context
            .graph
            .dependencies
            .get(context.uri)
            .unwrap()
            .dependencies
            .get(&imp);
          if let Some(dep_uri) = dep_option {
            let class_name = parts.last().unwrap();
            format!("_{}_{}", get_document_style_scope(dep_uri), class_name)
          } else {
            pierce.class_name.to_string()
          }
        } else {
          format!(
            "_{}_{} {}",
            context.scope, pierce.class_name, pierce.class_name
          )
        }
      }
      ast::AttributeDynamicStringPart::Slot(statement) => {
        evaluate_attribute_slot(statement, context)
          .unwrap()
          .to_string()
      }
    })
    .collect::<Vec<String>>()
    .join("");

  Ok(js_virt::JsValue::JsString(js_virt::JsString {
    value: val.to_string(),
    source: ExprSource {
      uri: context.uri.clone(),
      location: location.clone(),
    },
  }))
}

fn evaluate_attribute_string<'a>(
  name: &String,
  value: &String,
  location: &Location,
  is_native: bool,
  context: &mut Context,
) -> Result<js_virt::JsValue, RuntimeError> {
  let mut val = value.clone();

  if (name == "class" || name == "className") && is_native {
    let class_name_parts: Vec<&str> = val.split(" ").collect();
    val = class_name_parts
      .iter()
      .map(|class| {
        if class != &"" {
          format!("_{}_{} {}", context.scope, class, class).to_string()
        } else {
          class.to_string()
        }
      })
      .collect::<Vec<String>>()
      .join(" ");
  } else if name == "src" {
    if is_relative_path(&value) {
      let value_option = context.vfs.resolve(context.uri, &value);
      if let Some(value) = &value_option {
        val = value.to_string();
      } else {
        return Err(RuntimeError::new(
          "Unable to resolve file.".to_string(),
          context.uri,
          location,
        ));
      }
    }
  }

  Ok(js_virt::JsValue::JsString(js_virt::JsString {
    value: val.clone(),
    source: ExprSource {
      uri: context.uri.to_string(),
      location: location.clone(),
    },
  }))
}

fn evaluate_attribute_slot<'a>(
  script: &js_ast::Statement,
  context: &'a mut Context,
) -> Result<js_virt::JsValue, RuntimeError> {
  evaluate_js(script, context)
}

fn assert_slot_in_instance(location: &Location, context: &Context) -> Result<(), RuntimeError> {
  if in_instance(context) {
    Ok(())
  } else {
    Err(RuntimeError::new("Bindings can only be defined within components.".to_string(), context.uri, location))
  }
}

fn in_instance(context: &Context) -> bool {
  for (src, strategy) in &context.render_call_stack {
    if let RenderStrategy::Part(_) = strategy {
      return true;
    }
  }
  return false;
}

#[cfg(test)]
mod tests {
  use super::super::super::parser::*;
  use super::*;

  #[test]
  fn can_evaluate_a_style() {
    let case = "<style>div { color: red; } a, b { & c { color: blue }}</style><div></div>";
    let ast = parse(case).unwrap();
    let graph = DependencyGraph::new();
    let vfs = VirtualFileSystem::new(
      Box::new(|_| "".to_string()),
      Box::new(|_| true),
      Box::new(|_, _| Some("".to_string())),
    );
    let _node = evaluate_source(case);
  }

  #[test]
  fn catches_infinite_part_loop() {
    let result = evaluate_source(
      "
      <fragment component as='test'>
        <div>
          <test a />          
        </div>
      </fragment>
      <preview>
        <test />
      </preview>
    ",
    );

    assert_eq!(
      result,
      Err(RuntimeError::new(
        "Can't call <test /> here since this causes an infinite loop!".to_string(),
        &"some-file.pc".to_string(),
        &Location { start: 62, end: 72 }
      ))
    );
  }

  #[test]
  fn catches_recursion_in_multiple_parts() {
    let result = evaluate_source(
      "
      <fragment component as='test2'>
        <div>
          <test />
        </div>
      </fragment>
      <fragment component as='test'>
        <div>
          <test2 />          
        </div>
      </fragment>
      <preview>
        <test />
      </preview>
    ",
    );

    assert_eq!(
      result,
      Err(RuntimeError::new(
        "Can't call <test /> here since this causes an infinite loop!".to_string(),
        &"some-file.pc".to_string(),
        &Location { start: 63, end: 71 }
      ))
    )
  }

  #[test]
  fn allows_self_to_be_called_in_preview() {
    evaluate_source(
      "
      Hello
      <preview>
        <self />
      </preview>
    ",
    )
    .unwrap();
  }

  fn evaluate_source<'a>(code: &'a str) -> Result<Option<EvalInfo>, RuntimeError> {
    let mut graph = DependencyGraph::new();
    let uri = "some-file.pc".to_string();
    let vfs = VirtualFileSystem::new(
      Box::new(|_| "".to_string()),
      Box::new(|_| true),
      Box::new(|_, uri| Some(uri.to_string())),
    );
    graph.dependencies.insert(
      uri.clone(),
      Dependency::from_source(code.to_string(), &uri, &vfs).unwrap(),
    );

    evaluate(&uri, &graph, &vfs, &HashMap::new())
  }

  #[test]
  fn can_evaluate_class_pierce() {
    let result = evaluate_source(
      "
      <div something='>>>something >>>that' />
    ",
    )
    .unwrap();
  }
}
