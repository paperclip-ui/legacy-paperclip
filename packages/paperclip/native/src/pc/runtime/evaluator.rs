use super::super::ast;
use super::cache::Cache;
use super::export::{ComponentExport, Exports, Property};
use super::virt;
use crate::annotation::ast as annotation_ast;
use crate::base::ast::{ExprSource, ExprTextSource, Location};
use crate::base::runtime::RuntimeError;
use crate::base::utils::{get_document_id, get_document_style_public_scope, is_relative_path};
use crate::core::eval::DependencyEvalInfo;
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph};
use crate::core::vfs::VirtualFileSystem;
// use crate::css::runtime::evaluator::{evaluate as evaluate_css, EvalInfo as CSSEvalInfo};
use crate::core::id_generator::IDGenerator;
use crate::css::runtime::evaluator::{evaluate_expr as evaluate_css_expr, EvalInfo as CSSEvalInfo};
use crate::css::runtime::export as css_export;
use crate::css::runtime::virt as css_virt;
use crate::js::ast as js_ast;
use crate::js::runtime::evaluator::evaluate as evaluate_js;
use crate::js::runtime::virt as js_virt;
use crc::crc32;
use regex::Regex;
use serde::Serialize;
use std::collections::{BTreeMap, HashMap, HashSet};
use std::iter::FromIterator;

#[derive(Debug, PartialEq, Serialize)]
#[serde(tag = "kind")]
pub enum EngineMode {
  SingleFrame,
  MultiFrame,
}

pub struct ElementSource {
  pub id: String,
  pub tag_name: String,
}

impl ElementSource {
  pub fn new_from_element(element: &ast::Element) -> ElementSource {
    ElementSource {
      id: element.id.to_string(),
      tag_name: element.tag_name.to_string(),
    }
  }
}

#[derive(Clone)]
pub struct Context<'a> {
  pub graph: &'a DependencyGraph,
  pub vfs: &'a VirtualFileSystem,
  pub uri: &'a String,
  pub import_ids: HashSet<&'a String>,
  pub part_ids: HashSet<&'a String>,
  pub private_scope: String,
  pub injected_scopes: Vec<String>,
  pub public_scope: String,
  pub import_scopes: BTreeMap<String, String>,
  pub data: &'a js_virt::JsValue,
  pub render_call_stack: Vec<(String, RenderStrategy)>,
  pub evaluated_graph: &'a BTreeMap<String, DependencyEvalInfo>,
  pub mode: &'a EngineMode,
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
  // this is necessary so that consumers of EvalInfo can pull in all
  // style sheets
  #[serde(rename = "allImportedSheetUris")]
  pub all_imported_sheet_uris: Vec<String>,

  // need to include the imported dependency URIs since they're a snapshot for the evaluated data,
  // and might not exist as AST if there's a parse error
  pub dependencies: BTreeMap<String, String>,
  pub sheet: css_virt::CSSSheet,
  pub preview: virt::Node,
  pub exports: Exports,
}

pub fn evaluate<'a>(
  uri: &String,
  graph: &'a DependencyGraph,
  vfs: &'a VirtualFileSystem,
  evaluated_graph: &'a BTreeMap<String, DependencyEvalInfo>,
  mode: &EngineMode,
) -> Result<EvalInfo, RuntimeError> {
  let dep: &Dependency = graph.dependencies.get(uri).ok_or(RuntimeError::new(
    "URI not loaded".to_string(),
    uri,
    &Location { start: 0, end: 0 },
  ))?;

  if let DependencyContent::Node(node_expr) = &dep.content {
    let data = js_virt::JsValue::JsObject(js_virt::JsObject::new(node_expr.get_id().to_string()));
    let mut context = create_context(
      node_expr,
      uri,
      graph,
      vfs,
      &data,
      None,
      evaluated_graph,
      mode,
    );

    let mut preview = wrap_as_fragment(
      evaluate_instance_node(
        node_expr,
        &mut context,
        RenderStrategy::Auto,
        false,
        0,
        &None,
        None,
      )?,
      &context,
    );

    let (sheet, css_exports) = evaluate_document_sheet(uri, node_expr, &mut context)?;

    Ok(EvalInfo {
      sheet,
      preview,
      all_imported_sheet_uris: graph.flatten_dependencies(uri),
      dependencies: dep.dependencies.clone(),
      exports: Exports {
        style: css_exports,
        components: collect_component_exports(&node_expr, &context)?,
      },
    })
  } else {
    Err(RuntimeError::new(
      "Incorrect file type".to_string(),
      uri,
      &Location { start: 0, end: 0 },
    ))
  }
}

fn collect_component_exports<'a>(
  root: &ast::Node,
  context: &Context,
) -> Result<BTreeMap<String, ComponentExport>, RuntimeError> {
  let mut exports: BTreeMap<String, ComponentExport> = BTreeMap::new();

  let children = ast::get_children(root);

  if let Some(children) = children {
    for child in children.iter() {
      if let ast::Node::Element(element) = child {
        if ast::has_attribute("component", element)
          && ast::get_attribute_value("as", element) != None
        {
          let id = ast::get_attribute_value("as", element).ok_or(RuntimeError::new(
            "As must be present".to_string(),
            context.uri,
            &Location { start: 0, end: 0 },
          ))?;

          let properties = collect_node_properties(child);

          if exports.contains_key(id) {
            return Err(RuntimeError::new(
              "Component name is already declared.".to_string(),
              context.uri,
              &element.location,
            ));
          }

          exports.insert(
            id.to_string(),
            ComponentExport {
              name: id.to_string(),
              properties,
              public: ast::get_attribute("export", element) != None,
            },
          );
        }
      }
    }
  }

  Ok(exports)
}

fn collect_node_properties<'a>(node: &ast::Node) -> BTreeMap<String, Property> {
  let mut properties: BTreeMap<String, Property> = BTreeMap::new();

  node.walk(&mut |node| -> bool {
    match node {
      ast::Node::Element(element) => {
        for attr in &element.attributes {
          match attr {
            // <a key="value" />
            ast::Attribute::KeyValueAttribute(kv_attr) => {
              if let Some(value) = &kv_attr.value {
                match value {
                  // <a key={value} />
                  ast::AttributeValue::Slot(slot) => {
                    add_script_property(&slot.script, &mut properties);
                  }

                  // <a key="value {anotherValue}" />
                  ast::AttributeValue::DyanmicString(d_string) => {
                    for val in &d_string.values {
                      match val {
                        ast::AttributeDynamicStringPart::Slot(slot) => {
                          add_script_property(&slot, &mut properties);
                        }
                        ast::AttributeDynamicStringPart::ClassNamePierce(_)
                        | ast::AttributeDynamicStringPart::Literal(_) => {}
                      }
                    }
                  }
                  ast::AttributeValue::String(_) => {}
                }
              }
            }

            // <a {...props} />
            ast::Attribute::SpreadAttribute(spread) => {
              add_script_property(&spread.script, &mut properties);
            }

            // <a className:b="c" />
            ast::Attribute::PropertyBoundAttribute(p_attr) => {
              add_property(&p_attr.binding_name, true, &mut properties);
            }
            // <a {props} />
            ast::Attribute::ShorthandAttribute(s_attr) => {
              add_script_property(&s_attr.reference, &mut properties);
            }
          }
        }
      }
      ast::Node::Slot(slot) => {
        add_script_property(&slot.script, &mut properties);
      }
      _ => {}
    }
    true
  });

  properties
}

fn add_script_property(script: &js_ast::Expression, properties: &mut BTreeMap<String, Property>) {
  match script {
    js_ast::Expression::Reference(reference) => {
      let part = reference.path.get(0).unwrap();
      add_property(&part.name, part.optional, properties);
    }
    js_ast::Expression::Conjunction(conjunction) => {
      add_script_property(&conjunction.left, properties);
      add_script_property(&conjunction.right, properties);
    }
    js_ast::Expression::Group(group) => {
      add_script_property(&group.expression, properties);
    }
    js_ast::Expression::Node(node) => {
      properties.extend(collect_node_properties(&node));
    }
    _ => {}
  };
}

fn add_property(name: &String, optional: bool, properties: &mut BTreeMap<String, Property>) {
  let optional = if let Some(prop) = properties.get(name) {
    prop.optional
  } else {
    optional
  };

  properties.insert(
    name.to_string(),
    Property {
      name: name.to_string(),
      optional,
    },
  );
}

fn wrap_as_fragment(node_option: Option<virt::Node>, context: &Context) -> virt::Node {
  if let Some(node) = node_option {
    match node {
      virt::Node::Fragment(fragment) => virt::Node::Fragment(fragment),
      _ => virt::Node::Fragment(virt::Fragment {
        source_id: node.get_source_id().to_string(),
        children: vec![node],
      }),
    }
  } else {
    virt::Node::Fragment(virt::Fragment {
      source_id: "".to_string(),
      children: vec![],
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

fn evaluate_document_sheet<'a>(
  uri: &String,
  entry_expr: &ast::Node,
  context: &'a mut Context,
) -> Result<(css_virt::CSSSheet, css_export::Exports), RuntimeError> {
  let mut sheet = css_virt::CSSSheet { rules: vec![] };

  let mut css_exports: css_export::Exports = css_export::Exports::new();

  evaluate_node_sheet(uri, None, entry_expr, &mut sheet, &mut css_exports, context)?;

  Ok((sheet, css_exports))
}

fn evaluate_node_sheet<'a>(
  uri: &String,
  parent: Option<&ast::Node>,
  current: &ast::Node,
  sheet: &'a mut css_virt::CSSSheet,
  css_exports: &'a mut css_export::Exports,
  context: &'a mut Context,
) -> Result<(), RuntimeError> {
  let private_scope = get_document_id(uri);
  let public_scope = get_document_style_public_scope(uri);

  let element_scope = if let Some(parent) = parent {
    if let ast::Node::Element(element) = parent {
      Some((
        element.id.to_string(),
        is_component_instance(element, context),
      ))
    } else {
      None
    }
  } else {
    None
  };

  if let ast::Node::StyleElement(style_element) = &current {
    let info = evaluate_css_expr(
      &style_element.sheet,
      uri,
      &private_scope,
      &public_scope,
      element_scope,
      context.import_scopes.clone(),
      context.vfs,
      context.graph,
      &context.evaluated_graph,
      Some(&css_exports),
      false,
    )?;
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

  let children_option = ast::get_children(&current);
  if let Some(children) = children_option {
    // style elements are only allowed in root, so no need to traverse
    for child in children {
      evaluate_node_sheet(uri, Some(&current), child, sheet, css_exports, context)?;
    }
  }

  // scan slots for styles. Holy nested check batman.
  if let ast::Node::Element(element) = current {
    for attribute in &element.attributes {
      if let ast::Attribute::KeyValueAttribute(kv) = attribute {
        if let Some(value) = &kv.value {
          if let ast::AttributeValue::Slot(slot) = value {
            traverse_js_expr_css(&slot.script, &mut |expr| {
              if let js_ast::Expression::Node(node) = expr {
                evaluate_node_sheet(uri, Some(&current), &*node, sheet, css_exports, context)?;
              }
              Ok(())
            })?;
          }
        }
      }
    }
  }

  if let ast::Node::Slot(slot) = current {
    traverse_js_expr_css(&slot.script, &mut |expr| {
      if let js_ast::Expression::Node(node) = expr {
        evaluate_node_sheet(uri, Some(&current), &*node, sheet, css_exports, context)?;
      }
      Ok(())
    })?;
  }

  Ok(())
}

pub fn traverse_js_expr_css<TEach>(
  current: &js_ast::Expression,
  each: &mut TEach,
) -> Result<(), RuntimeError>
where
  TEach: FnMut(&js_ast::Expression) -> Result<(), RuntimeError>,
{
  each(current)?;

  match current {
    js_ast::Expression::Conjunction(expr) => {
      traverse_js_expr_css(&expr.left, each)?;
      traverse_js_expr_css(&expr.right, each)?;
    }
    js_ast::Expression::Group(expr) => {
      traverse_js_expr_css(&expr.expression, each)?;
    }
    js_ast::Expression::Not(expr) => {
      traverse_js_expr_css(&expr.expression, each)?;
    }
    js_ast::Expression::Array(expr) => {
      for value in &expr.values {
        traverse_js_expr_css(&value, each)?;
      }
    }
    js_ast::Expression::Node(expr) => {}
    js_ast::Expression::Object(expr) => {
      for property in &expr.properties {
        traverse_js_expr_css(&property.value, each)?;
      }
    }
    _ => {}
  }
  Ok(())
}

pub fn evaluate_instance_node<'a>(
  node_expr: &ast::Node,
  context: &'a mut Context,
  render_strategy: RenderStrategy,
  imported: bool,
  depth: u32,
  annotations: &Option<js_virt::JsObject>,
  instance_source: Option<ElementSource>,
) -> Result<Option<virt::Node>, RuntimeError> {
  context
    .render_call_stack
    .push((context.uri.to_string(), render_strategy.clone()));
  let target_option = get_instance_target_node(node_expr, &render_strategy, imported);
  if let Some(target) = target_option {
    evaluate_node(target, true, depth, instance_source, annotations, context)
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
  evaluated_graph: &'a BTreeMap<String, DependencyEvalInfo>,
  mode: &'a EngineMode,
) -> Context<'a> {
  let render_call_stack = if let Some(parent) = parent_option {
    parent.render_call_stack.clone()
  } else {
    vec![]
  };

  let private_scope = get_document_id(uri);
  let public_scope = get_document_style_public_scope(uri);

  Context {
    graph,
    uri,
    vfs,
    render_call_stack,
    evaluated_graph,
    import_ids: HashSet::from_iter(ast::get_import_ids(node_expr)),
    injected_scopes: get_injected_scoped(node_expr, graph.dependencies.get(uri).unwrap()),
    import_scopes: get_import_scopes(graph.dependencies.get(uri).unwrap()),
    part_ids: HashSet::from_iter(ast::get_part_ids(node_expr)),
    private_scope,
    public_scope,
    data,
    mode,
  }
}

pub fn get_injected_scoped<'a>(root_expr: &'a ast::Node, entry: &Dependency) -> Vec<String> {
  let mut scopes: Vec<String> = vec![];
  for import in ast::get_imports(root_expr) {
    if ast::has_attribute("inject-styles", &import) {
      if let Some(src) = ast::get_attribute_value("src", &import) {
        scopes.push(get_document_style_public_scope(
          entry.dependency_uri_maps.get(src).unwrap(),
        ));
      }
    }
  }
  scopes
}

pub fn get_import_scopes<'a>(entry: &Dependency) -> BTreeMap<String, String> {
  let mut scopes = BTreeMap::new();
  for (id, uri) in &entry.dependencies {
    scopes.insert(id.to_string(), get_document_style_public_scope(uri));
  }
  scopes
}

pub fn evaluate_node<'a>(
  node_expr: &ast::Node,
  is_root: bool,
  depth: u32,
  instance_source: Option<ElementSource>,
  annotations: &Option<js_virt::JsObject>,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  if context.mode == &EngineMode::MultiFrame && !is_frame_visible(annotations) {
    return Ok(None);
  }

  match &node_expr {
    ast::Node::Element(el) => {
      evaluate_element(&el, is_root, depth, instance_source, annotations, context)
    }
    ast::Node::StyleElement(el) => {
      return evaluate_style_element(&el, context);
    }
    ast::Node::Text(text) => {
      // skip pure whitespace (this should only happen with new lines). This is necessary
      // particularly for annotations
      // if text.value.trim() == "" {
      //   return Ok(None);
      // }

      return Ok(Some(virt::Node::Text(virt::Text {
        source_id: node_expr.get_id().to_string(),
        annotations: annotations.clone(),
        value: text.value.to_string(),
      })));
    }
    ast::Node::Slot(slot) => evaluate_slot(&slot, depth, context),
    ast::Node::Fragment(el) => evaluate_fragment(&el, depth, context),
    ast::Node::Comment(el) => Ok(None),
  }
}

// pub fn get_element_scope<'a>(element: &ast::Element, context: &mut Context) -> String {
//   let buff = format!("{}{}", element.id);
//   format!("{:x}", crc32::checksum_ieee(buff.as_bytes())).to_string()
// }

fn is_frame_visible(annotations: &Option<js_virt::JsObject>) -> bool {
  let visible = annotations
    .as_ref()
    .and_then(|obj| -> Option<&js_virt::JsValue> { obj.values.get("frame") })
    .and_then(|frame_value| match frame_value {
      js_virt::JsValue::JsObject(frame) => Some(frame),
      _ => None,
    })
    .and_then(|frame| frame.values.get("visible"))
    .and_then(|visible_value| match visible_value {
      js_virt::JsValue::JsBoolean(visible) => Some(visible.value),
      _ => Some(true),
    });

  visible != Some(false)
}

fn evaluate_element<'a>(
  element: &ast::Element,
  is_root: bool,
  depth: u32,
  instance_source: Option<ElementSource>,
  annotations: &Option<js_virt::JsObject>,
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
            if depth != 1 {
              return Err(RuntimeError::new(
                "Components need to be defined at the root.".to_string(),
                context.uri,
                &element.location,
              ));
            }

            // components should render with multi-frame mode
            if context.mode != &EngineMode::MultiFrame {
              return Ok(None);
            }
          }
        }
      }

      if context.import_ids.contains(&ast::get_tag_name(&element)) {
        let result = evaluate_imported_component(
          element,
          instance_source.or(Some(ElementSource::new_from_element(element))),
          depth,
          annotations,
          context,
        );

        if Ok(None) == result {
          return Err(RuntimeError::new(
            "Unable to find component, or it's not exported.".to_string(),
            &context.uri,
            &element.open_tag_location,
          ));
        }

        result
      } else if context.part_ids.contains(&element.tag_name) {
        evaluate_part_instance_element(
          element,
          instance_source.or(Some(ElementSource::new_from_element(element))),
          depth,
          annotations,
          context,
        )
      } else {
        // fragments should be preserved if in multi frame mode if root
        if element.tag_name == "fragment" && (context.mode != &EngineMode::MultiFrame || depth > 1)
        {
          evaluate_children_as_fragment(
            &element.children,
            depth,
            &element.id,
            &element.location,
            context,
          )
        } else {
          evaluate_native_element(
            element,
            is_root,
            depth,
            instance_source,
            annotations,
            context,
          )
        }
      }
    }
  }
}

fn evaluate_slot<'a>(
  slot: &ast::Slot,
  depth: u32,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  assert_slot_restrictions(&slot.location, context)?;

  let script = &slot.script;
  let mut js_value = evaluate_js(script, depth + 1, context)?;

  // if array of values, then treat as document fragment
  if let js_virt::JsValue::JsArray(ary) = &mut js_value {
    let mut children = vec![];
    for item in ary.values.drain(0..) {
      if let js_virt::JsValue::JsNode(child) = item {
        children.push(child);
      } else {
        children.push(virt::Node::Text(virt::Text {
          source_id: item.get_source_id().to_string(),
          annotations: None,
          value: item.to_string(),
        }))
      }
    }

    return Ok(Some(virt::Node::Fragment(virt::Fragment {
      source_id: ary.source_id.to_string(),
      children,
    })));
  } else if let js_virt::JsValue::JsNode(node) = js_value {
    return Ok(Some(node));
  }

  Ok(Some(virt::Node::Text(virt::Text {
    source_id: script.get_id().to_string(),
    annotations: None,
    value: if js_value.truthy() || js_value.is_number() {
      js_value.to_string()
    } else {
      "".to_string()
    },
  })))
}

pub fn evaluate_imported_component<'a>(
  element: &ast::Element,
  instance_source: Option<ElementSource>,
  depth: u32,
  annotations: &Option<js_virt::JsObject>,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  let self_dep = &context.graph.dependencies.get(context.uri).unwrap();

  let tag_name = &ast::get_tag_name(element);

  let dep_uri = &self_dep.dependencies.get(tag_name).unwrap();
  let namespace_option = ast::get_tag_namespace(element);
  evaluate_component_instance(
    element,
    if let Some(part) = namespace_option {
      RenderStrategy::Part(part)
    } else {
      RenderStrategy::Part("default".to_string())
    },
    true,
    depth,
    instance_source,
    annotations,
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
  instance_source: Option<ElementSource>,
  depth: u32,
  annotations: &Option<js_virt::JsObject>,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  let self_dep = &context.graph.dependencies.get(context.uri).unwrap();

  if let DependencyContent::Node(_root_node) = &self_dep.content {
    evaluate_component_instance(
      element,
      RenderStrategy::Part(element.tag_name.to_string()),
      false,
      depth,
      instance_source,
      annotations,
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
  depth: u32,
  context: &'a mut Context,
) -> Result<js_virt::JsValue, RuntimeError> {
  let mut data = js_virt::JsObject::new(instance_element.id.to_string());

  let mut property_bound_attrs: Vec<&ast::PropertyBoundAttribute> = vec![];

  for attr_expr in &instance_element.attributes {
    let attr = &attr_expr;
    match attr {
      ast::Attribute::KeyValueAttribute(kv_attr) => {
        if kv_attr.value == None {
          data.values.insert(
            kv_attr.name.to_string(),
            js_virt::JsValue::JsBoolean(js_virt::JsBoolean {
              source_id: kv_attr.id.to_string(),
              value: true,
            }),
          );
        } else {
          let value = evaluate_attribute_value(
            &instance_element.tag_name,
            &kv_attr.name,
            &kv_attr.value.as_ref().unwrap(),
            false,
            depth,
            context,
          )?;

          data.values.insert(kv_attr.name.to_string(), value);
        }
      }
      ast::Attribute::SpreadAttribute(attr) => {
        assert_slot_restrictions(&attr.location, context)?;
        let attr_data = evaluate_js(&attr.script, depth + 1, context)?;
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
        let name = sh_attr.get_name().map_err(|message| RuntimeError {
          uri: context.uri.to_string(),
          message: message.to_string(),
          location: Location { start: 0, end: 0 },
        })?;
        assert_attr_slot_restrictions(
          &instance_element.tag_name,
          &name.to_string(),
          &sh_attr.location,
          context,
        )?;

        data.values.insert(
          name.to_string(),
          evaluate_attribute_slot(&sh_attr.reference, depth, context)?,
        );
      }
      ast::Attribute::PropertyBoundAttribute(kv_attr) => {
        assert_attr_slot_restrictions(
          &instance_element.tag_name,
          &kv_attr.name,
          &kv_attr.location,
          context,
        )?;
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
                evaluate_attribute_value(
                  &instance_element.tag_name,
                  &kv_attr.name,
                  attr_value,
                  false,
                  depth,
                  context,
                )?
              } else {
                evaluate_attribute_key_value_string(
                  &kv_attr.name,
                  &kv_attr.binding_name,
                  &kv_attr.id.to_string(),
                  &kv_attr.location,
                  false,
                  context,
                )?
              };

              let combined_value = if let Some(existing_value) = data.values.get(&kv_attr.name) {
                js_virt::JsValue::JsString(js_virt::JsString {
                  source_id: kv_attr.id.to_string(),
                  value: format!(
                    "{} {}",
                    stringify_attribute_value(&kv_attr.name, existing_value),
                    value.to_string()
                  ),
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

  let mut js_children = js_virt::JsArray::new(instance_element.id.to_string());

  let (ret_children, contains_style) =
    evaluate_children(&instance_element.children, depth, context)?;

  if contains_style {
    let class_name_option = data
      .values
      .get("className")
      .or_else(|| data.values.get("class"));

    let class_name_value = if let Some(class_name) = class_name_option {
      class_name.to_string()
    } else {
      "".to_string()
    };

    let scope_class_name = &instance_element.id;

    let new_class_name = if let Some(class_name) = class_name_option {
      format!("{} _{}", class_name.to_string(), scope_class_name)
    } else {
      format!("_{}", scope_class_name)
    };

    let new_class_name_value = js_virt::JsValue::JsString(js_virt::JsString {
      source_id: "".to_string(),
      value: new_class_name,
    });

    data
      .values
      .insert("class".to_string(), new_class_name_value.clone());
    data
      .values
      .insert("className".to_string(), new_class_name_value.clone());
  }

  let children: Vec<js_virt::JsValue> = ret_children
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
  depth: u32,
  instance_source: Option<ElementSource>,
  annotations: &Option<js_virt::JsObject>,
  dep_uri: &String,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  if let Some(dep) = &context.graph.dependencies.get(&dep_uri.to_string()) {
    let data = create_component_instance_data(instance_element, depth, context)?;

    if let DependencyContent::Node(node) = &dep.content {
      let mut instance_context = create_context(
        &node,
        dep_uri,
        context.graph,
        context.vfs,
        &data,
        Some(&context),
        context.evaluated_graph,
        context.mode,
      );
      check_instance_loop(&render_strategy, instance_element, &mut instance_context)?;
      // TODO: if fragment, then wrap in span. If not, then copy these attributes to root element

      evaluate_instance_node(
        &node,
        &mut instance_context,
        render_strategy,
        imported,
        depth,
        annotations,
        instance_source.or(Some(ElementSource::new_from_element(instance_element))),
      )
    } else {
      Err(RuntimeError::unknown(context.uri))
    }
  } else {
    Err(RuntimeError::new(
      format!("Dependency {} not found", dep_uri),
      context.uri,
      &Location::new(0, 0),
    ))
  }
}

fn get_actual_attribute_name(name: &String) -> String {
  if name == "className" {
    "class".to_string()
  } else {
    name.clone()
  }
}

fn append_attribute<'a>(
  attributes: &mut BTreeMap<String, Option<String>>,
  key: &'a str,
  value: String,
) {
  let new_value = attributes
    .get(key)
    .and_then(|existing_value_option| existing_value_option.clone())
    .and_then(|existing_value| Some(format!("{} {}", existing_value, value)))
    .or_else(|| Some(value));

  attributes.insert(key.to_string(), new_value);
}

fn evaluate_native_element<'a>(
  element: &ast::Element,
  is_root: bool,
  depth: u32,
  instance_source: Option<ElementSource>,
  annotations: &Option<js_virt::JsObject>,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  let mut attributes: BTreeMap<String, Option<String>> = BTreeMap::new();

  let mut tag_name = ast::get_tag_name(element);

  let mut property_bound_attrs: Vec<&ast::PropertyBoundAttribute> = vec![];

  for attr_expr in &element.attributes {
    let attr = &attr_expr;

    match attr {
      ast::Attribute::KeyValueAttribute(kv_attr) => {
        let actual_name = get_actual_attribute_name(&kv_attr.name);

        let (name, mut value_option) = if kv_attr.value == None {
          (actual_name, None)
        } else {
          let value = evaluate_attribute_value(
            &element.tag_name,
            &actual_name,
            &kv_attr.value.as_ref().unwrap(),
            true,
            depth,
            context,
          )?;
          if !value.truthy() {
            continue;
          }
          (
            actual_name,
            Some(stringify_attribute_value(&kv_attr.name, &value)),
          )
        };

        if name == "export" || name == "component" || name == "as" {
          continue;
        }
        attributes.insert(name, value_option);
      }
      ast::Attribute::PropertyBoundAttribute(kv_attr) => {
        assert_attr_slot_restrictions(
          &element.tag_name,
          &kv_attr.name,
          &kv_attr.location,
          context,
        )?;
        property_bound_attrs.push(kv_attr);
      }
      ast::Attribute::SpreadAttribute(attr) => {
        assert_slot_restrictions(&attr.location, context)?;
        let attr_data = evaluate_js(&attr.script, depth + 1, context)?;
        match attr_data {
          js_virt::JsValue::JsObject(mut object) => {
            for (key, value) in object.values.drain() {
              attributes.insert(get_actual_attribute_name(&key), Some(value.to_string()));
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
        let name = sh_attr.get_name().map_err(|message| RuntimeError {
          uri: context.uri.to_string(),
          message: message.to_string(),
          location: Location { start: 0, end: 0 },
        })?;
        let actual_name = get_actual_attribute_name(&name);

        assert_attr_slot_restrictions(&element.tag_name, &actual_name, &sh_attr.location, context)?;
        let mut js_value = evaluate_attribute_slot(&sh_attr.reference, depth, context)?;

        if js_value.truthy() {
          js_value = maybe_cast_attribute_js_value(&actual_name, js_value, true, context);

          attributes.insert(
            actual_name,
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
              let actual_name = get_actual_attribute_name(&kv_attr.name);
              let value = if let Some(kv_value) = &kv_attr.value {
                evaluate_attribute_value(
                  &element.tag_name,
                  &actual_name,
                  &kv_value,
                  true,
                  depth,
                  context,
                )?
              } else {
                evaluate_attribute_key_value_string(
                  &actual_name,
                  &kv_attr.binding_name,
                  &kv_attr.id,
                  &kv_attr.location,
                  true,
                  context,
                )?
              };

              let combined_value = combine_attr_value(
                stringify_attribute_value(&actual_name, &value),
                attributes.get(&actual_name),
                " ".to_string(),
              );

              attributes.insert(actual_name, Some(combined_value));
            }
          }
        }
        _ => {}
      }
    }
  }

  append_attribute(
    &mut attributes,
    "class",
    format!("_{}", context.private_scope.as_str()),
  );

  append_attribute(
    &mut attributes,
    "class",
    format!("_{}", context.public_scope.as_str()),
  );

  for injected_scope in &context.injected_scopes {
    append_attribute(&mut attributes, "class", format!("_{}", injected_scope));
  }

  // allow for tag name to be dynamically changed.
  if let Some(tag_name_attr_value_option) = attributes.get("tagName") {
    if let Some(tag_name_attr_value) = tag_name_attr_value_option {
      tag_name = tag_name_attr_value.to_string();
    }
    attributes.remove("tagName");
  }

  let (children, contains_style) = evaluate_children(&element.children, depth, context)?;

  if contains_style {
    // TODO - this needs to be scoped
    let element_scope = &element.id;
    // let scope_name = format!("data-pc-{}", element_scope).to_string();
    append_attribute(&mut attributes, "class", format!("_{}", element_scope));
    // attributes.insert(scope_name.to_string(), None);
  }

  Ok(Some(virt::Node::Element(virt::Element {
    source_info: virt::ElementSourceInfo {
      instance_of: if let Some(source) = &instance_source {
        Some(virt::ElementInstanceOfInfo {
          component_name: source.tag_name.to_string(),
        })
      } else {
        None
      },
    },
    source_id: if let Some(source) = &instance_source {
      source.id.clone()
    } else {
      element.id.to_string()
    },
    annotations: annotations.clone(),
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
  depth: u32,
  context: &'a mut Context,
) -> Result<(Vec<virt::Node>, bool), RuntimeError> {
  let mut children: Vec<virt::Node> = vec![];

  let mut contains_style = false;
  let mut annotations: Option<js_virt::JsObject> = None;

  for child_expr in children_expr {
    match child_expr {
      ast::Node::StyleElement(_) => {
        contains_style = true;
      }
      ast::Node::Comment(comment) => {
        annotations = Some(evaluate_comment(comment, depth, context)?);
        continue;
      }
      _ => {}
    }

    match evaluate_node(child_expr, false, depth + 1, None, &annotations, context)? {
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

    annotations = None;
  }

  if depth == 0 {
    if let Some(last_child) = children.last() {
      if let virt::Node::Text(text_node) = last_child {
        // remove last child if empty string
        if text_node.value.trim() == "" && text_node.annotations == None {
          children.pop();
        }
      }
    }
  }

  Ok((children, contains_style))
}

fn evaluate_comment<'a>(
  comment: &ast::Comment,
  depth: u32,
  context: &'a mut Context,
) -> Result<js_virt::JsObject, RuntimeError> {
  let mut data = js_virt::JsObject::new(comment.id.to_string());

  for property in &comment.annotation.properties {
    match property {
      annotation_ast::AnnotationProperty::Declaration(decl) => {
        let value = evaluate_js(&decl.value, depth + 1, context)?;
        data.values.insert(decl.name.to_string(), value);
      }
      _ => {
        // ignore text
      }
    }
  }

  Ok(data)
}

fn evaluate_fragment<'a>(
  fragment: &ast::Fragment,
  depth: u32,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  evaluate_children_as_fragment(
    &fragment.children,
    depth,
    &fragment.id,
    &fragment.location,
    context,
  )
}

fn evaluate_children_as_fragment<'a>(
  children: &Vec<ast::Node>,
  depth: u32,
  source_id: &String,
  location: &Location,
  context: &'a mut Context,
) -> Result<Option<virt::Node>, RuntimeError> {
  let (mut children, _) = evaluate_children(&children, depth, context)?;
  Ok(Some(virt::Node::Fragment(virt::Fragment {
    source_id: source_id.to_string(),
    children,
  })))
}

fn evaluate_attribute_value<'a>(
  tag_name: &String,
  name: &String,
  value: &ast::AttributeValue,
  is_native: bool,
  depth: u32,
  context: &mut Context,
) -> Result<js_virt::JsValue, RuntimeError> {
  match value {
    ast::AttributeValue::DyanmicString(st) => {
      evaluate_attribute_dynamic_string(name, st, &st.id, &st.location, is_native, depth, context)
    }
    ast::AttributeValue::String(st) => {
      evaluate_attribute_key_value_string(name, &st.value, &st.id, &st.location, is_native, context)
    }
    ast::AttributeValue::Slot(value) => {
      assert_attr_slot_restrictions(tag_name, name, &value.location, context)?;
      let value = evaluate_attribute_slot(&value.script, depth, context)?;
      Ok(maybe_cast_attribute_js_value(name, value, true, context))
    }
  }
}

fn evaluate_attribute_dynamic_string<'a>(
  name: &String,
  value: &ast::AttributeDynamicStringValue,
  source_id: &String,
  location: &Location,
  is_native: bool,
  depth: u32,
  context: &mut Context,
) -> Result<js_virt::JsValue, RuntimeError> {
  let mut buffer = vec![];

  for part in value.values.iter() {
    buffer.push(match part {
      ast::AttributeDynamicStringPart::Literal(value) => value.value.to_string(),
      ast::AttributeDynamicStringPart::ClassNamePierce(pierce) => {
        if pierce.class_name.contains(".") {
          let parts = pierce.class_name.split(".").collect::<Vec<&str>>();
          let import_id = parts.first().unwrap().to_string();
          let dep_option = context
            .graph
            .dependencies
            .get(context.uri)
            .and_then(|dep| dep.dependencies.get(&import_id));

          let dep_uri = if let Some(dep_uri) = dep_option {
            dep_uri
          } else {
            return Err(RuntimeError::new(
              "Reference not found.".to_string(),
              context.uri,
              &pierce.location,
            ));
          };

          // consider sm:p-3.5. Skip first ref. (BTW this is dirty AF)
          let class_name = &parts[1..].join(".").to_string();

          let import_option = get_import(context.uri, &import_id, context);

          let import = if let Some(import) = import_option {
            import
          } else {
            return Err(RuntimeError::new(
              "Reference not found.".to_string(),
              context.uri,
              &pierce.location,
            ));
          };

          let class_export_option = get_import_sheet(import)
            .class_names
            .get(&class_name.to_string());

          let class_export = if let Some(class_export) = class_export_option {
            class_export
          } else {
            return Err(RuntimeError::new(
              "Class name not found.".to_string(),
              context.uri,
              &pierce.location,
            ));
          };

          if class_export.public {
            format!(
              "_{}_{} {}",
              get_document_style_public_scope(dep_uri),
              class_name,
              class_name
            )
          } else {
            return Err(RuntimeError::new(
              "This class reference is private.".to_string(),
              context.uri,
              &pierce.location,
            ));
          }
        } else {
          format!(
            "_{}_{} _{}_{} {}",
            context.private_scope,
            pierce.class_name,
            context.public_scope,
            pierce.class_name,
            pierce.class_name
          )
        }
      }
      ast::AttributeDynamicStringPart::Slot(statement) => {
        evaluate_attribute_slot(statement, depth, context)
          .unwrap()
          .to_string()
      }
    });
  }

  let val = buffer.join("");
  // let val = value
  //   .values
  //   .iter()
  //   .map(|val|
  //   })
  //   .collect::<Vec<String>>()
  //   .join("");

  let js_value = js_virt::JsValue::JsString(js_virt::JsString {
    source_id: source_id.clone(),
    value: val.to_string(),
  });

  Ok(maybe_cast_attribute_js_value(
    name, js_value, is_native, context,
  ))
}

fn get_import<'a>(
  source_uri: &String,
  import_id: &String,
  context: &'a Context,
) -> Option<&'a DependencyEvalInfo> {
  context
    .graph
    .dependencies
    .get(source_uri)
    .and_then(|source: &Dependency| {
      source
        .dependencies
        .get(import_id)
        .and_then(|dep_uri| context.evaluated_graph.get(dep_uri))
    })
}

fn get_import_sheet<'a>(ev: &'a DependencyEvalInfo) -> &'a css_export::Exports {
  match &ev {
    DependencyEvalInfo::CSS(css) => &css.exports,
    DependencyEvalInfo::PC(pc) => &pc.exports.style,
  }
}

fn is_class_attribute_name(name: &String) -> bool {
  name == "class" || name == "className"
}

fn is_component_instance<'a>(element: &ast::Element, context: &Context<'a>) -> bool {
  context.import_ids.contains(&ast::get_tag_name(&element))
    || context.part_ids.contains(&element.tag_name)
}

fn transform_class_value<'a>(name: &String, value: &String, context: &mut Context) -> String {
  lazy_static! {
    static ref scope_re: Regex = Regex::new(r"^_[-\w]+_").unwrap();
  }

  let mut skip = 0;

  let class_name_parts: Vec<&str> = value.split(" ").collect();
  class_name_parts
    .iter()
    .map(|class| {
      // if previous class is scoped, then skip
      if skip > 0 {
        skip = skip - 1;
        return class.to_string();
      }

      // if already scoped, then skip
      if scope_re.is_match(class) {
        skip = context.injected_scopes.len() + 2;
        return class.to_string();
      }

      if class != &"" {
        let mut buffer = format!(
          "_{}_{} _{}_{}",
          context.private_scope, class, context.public_scope, class
        );

        for scope in &context.injected_scopes {
          buffer = format!("{} _{}_{}", buffer, scope, class);
        }

        format!("{} {}", buffer, class)
      } else {
        class.to_string()
      }
    })
    .collect::<Vec<String>>()
    .join(" ")
}

fn transform_style_value<'a>(name: &String, value: &String, context: &mut Context) -> String {
  // Fixes https://github.com/crcn/paperclip/issues/336
  // Primitive but easy solution
  lazy_static! {
    static ref undefined_styles_re: Regex = Regex::new(r"[^\s]+:\s*undefined;?").unwrap();
  }

  if undefined_styles_re.is_match(value) {
    let mut new_value = value.to_string();

    for caps in undefined_styles_re.captures_iter(value.to_string().as_str()) {
      new_value = undefined_styles_re
        .replace(new_value.as_str(), "")
        .to_string();
    }

    // trim in case string is empty
    return new_value.trim().to_string();
  }

  return value.to_string();
}

fn cast_attribute_value<'a>(
  name: &String,
  value: &String,
  is_native: bool,
  context: &mut Context,
) -> Option<String> {
  if !is_native {
    return None;
  }
  if is_class_attribute_name(name) {
    Some(transform_class_value(name, value, context))
  } else if name == "style" {
    Some(transform_style_value(name, value, context))
  } else {
    None
  }
}

fn maybe_cast_attribute_js_value<'a>(
  name: &String,
  value: js_virt::JsValue,
  is_native: bool,
  context: &mut Context,
) -> js_virt::JsValue {
  let str_value = value.to_string();

  if let Some(casted_value) = cast_attribute_value(name, &str_value, is_native, context) {
    js_virt::JsValue::JsString(js_virt::JsString {
      source_id: value.get_source_id().to_string(),
      value: casted_value.to_string(),
    })
  } else {
    value
  }
}

fn evaluate_attribute_key_value_string<'a>(
  name: &String,
  value: &String,
  source_id: &String,
  location: &Location,
  is_native: bool,
  context: &mut Context,
) -> Result<js_virt::JsValue, RuntimeError> {
  let mut val = value.clone();

  if let Some(casted_value) = cast_attribute_value(name, value, is_native, context) {
    val = casted_value;
  } else if name == "src" {
    if is_relative_path(&value) {
      let value_option = context.vfs.resolve(context.uri, &value);
      if let Some(value) = &value_option {
        val = value.to_string();
      } else {
        return Err(RuntimeError::new(
          format!("Unable to resolve file: {} from {}", value, context.uri),
          context.uri,
          location,
        ));
      }
    }
  }

  Ok(js_virt::JsValue::JsString(js_virt::JsString {
    value: val.clone(),
    source_id: source_id.to_string(),
  }))
}

fn evaluate_attribute_slot<'a>(
  script: &js_ast::Expression,
  depth: u32,
  context: &'a mut Context,
) -> Result<js_virt::JsValue, RuntimeError> {
  evaluate_js(script, depth + 1, context)
}

fn assert_attr_slot_restrictions(
  tag_name: &String,
  attr_name: &String,
  location: &Location,
  context: &Context,
) -> Result<(), RuntimeError> {
  // if tag_name == "component" {
  //   match attr_name.as_str() {
  //     "component" | "export" | "as" => {
  //       return Err(RuntimeError::new("Cannot bind to reserved attribute name.".to_string(), context.uri, location));
  //     },
  //     _ => {

  //     }
  //   }
  // }
  assert_slot_restrictions(location, context)?;

  return Ok(());
}

fn assert_slot_restrictions(location: &Location, context: &Context) -> Result<(), RuntimeError> {
  // if !in_instance(context) {
  //   return Err(RuntimeError::new(
  //     "Bindings can only be defined within components.".to_string(),
  //     context.uri,
  //     location,
  //   ));
  // }

  return Ok(());
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
    let ast = parse(case, "sed", "uri").unwrap();
    let graph = DependencyGraph::new();
    let vfs = VirtualFileSystem::new(
      Box::new(|_| "".to_string()),
      Box::new(|_| true),
      Box::new(|_, _| Some("".to_string())),
    );
    __test__evaluate_pc_code(case);
  }

  #[test]
  fn catches_infinite_part_loop() {
    let (result, _) = __test__evaluate_pc_code(
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
    let (result, _) = __test__evaluate_pc_code(
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
    let (result, _) = __test__evaluate_pc_code(
      "
      Hello
      <preview>
        <self />
      </preview>
    ",
    );
    result.unwrap();
  }

  #[test]
  fn can_evaluate_class_pierce() {
    let (result, _) = __test__evaluate_pc_code(
      "
      <div something='$something $that' />
    ",
    );

    result.unwrap();
  }
}

pub fn __test__evaluate_pc_code<'a>(
  code: &'a str,
) -> (Result<EvalInfo, RuntimeError>, DependencyGraph) {
  let mut files: BTreeMap<String, String> = BTreeMap::new();
  files.insert("some-file.pc".to_string(), code.to_string());
  __test__evaluate_pc_files(files, "some-file.pc")
}

pub fn __test__evaluate_pc_files<'a>(
  files: BTreeMap<String, String>,
  main_file_name: &'a str,
) -> (Result<EvalInfo, RuntimeError>, DependencyGraph) {
  let mut graph = DependencyGraph::new();
  let uri = main_file_name.to_string();
  let vfs = VirtualFileSystem::new(
    Box::new(|_| "".to_string()),
    Box::new(|_| true),
    Box::new(|_, uri| Some(uri.to_string())),
  );

  for (file_name, content) in files {
    graph.dependencies.insert(
      file_name.clone(),
      Dependency::from_source(
        content.to_string(),
        &file_name,
        &vfs,
        get_document_id(&file_name).as_str(),
      )
      .unwrap(),
    );
  }

  (
    evaluate(
      &uri,
      &graph,
      &vfs,
      &BTreeMap::new(),
      &EngineMode::SingleFrame,
    ),
    graph,
  )
}
