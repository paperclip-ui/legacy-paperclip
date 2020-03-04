use super::super::ast;
use crate::base::runtime::{RuntimeError};
use crate::base::ast::{Location};
use super::virt;
use std::collections::HashSet;
use std::iter::FromIterator;
use super::graph::{DependencyGraph, DependencyContent, Dependency};
use super::vfs::{VirtualFileSystem};
use crate::css::runtime::evaluator::{evaluate as evaluate_css};
use crate::js::runtime::evaluator::{evaluate as evaluate_js};
use crate::js::runtime::virt as js_virt;
use crate::js::ast as js_ast;
use crate::css::runtime::virt as css_virt;
use crate::base::utils::{get_document_style_scope, is_relative_path};
use crc::{crc32};


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
  pub id_seed: String,
  pub id_count: i32
}

#[derive(Clone, PartialEq, Debug)] 
pub enum RenderStrategy {
  Instance,
  Part(String),
  Preview
}

impl<'a> Context<'a> {
  pub fn get_next_id(&mut self) -> String {
    self.id_count += 1;
    format!("{}-{}", self.id_seed, self.id_count)
  }
}

pub fn evaluate<'a>(uri: &String, graph: &'a DependencyGraph, vfs: &'a VirtualFileSystem, data: &js_virt::JsValue, part_option: Option<String>) -> Result<Option<virt::Node>, RuntimeError>  {

  let dep = graph.dependencies.get(uri).unwrap();
  if let DependencyContent::Node(node_expr) = &dep.content {

    let mut context = create_context(node_expr, uri, graph, vfs, data, None);
    let mut root_option = evaluate_instance_node(node_expr, &mut context, if let Some(part) = part_option {
      RenderStrategy::Part(part)
    } else {
      RenderStrategy::Preview
    })?;

    match root_option {
      Some(ref mut root) => {
        let style = evaluate_jumbo_style(node_expr, &mut context)?;
        root.prepend_child(style);
      },
      _ => { }
    }

    Ok(root_option)
  } else {
    Err(RuntimeError::new("Incorrect file type".to_string(), uri, &Location { start: 0, end: 0 }))
  }
}


pub fn get_instance_target_node<'a>(node_expr: &ast::Node, render_strategy: RenderStrategy) -> &ast::Node {

  let default_part = "default".to_string();

  let target_node_option = match render_strategy {
    RenderStrategy::Instance => find_child(node_expr, |child|  {
      child.tag_name == "part" && ast::get_attribute_value("id", child) == Some(&default_part)
    }),
    RenderStrategy::Part(id) => find_child(node_expr, |child|  {
      child.tag_name == "part" && ast::get_attribute_value("id", child) == Some(&id)
    }),
    RenderStrategy::Preview => find_child(node_expr, |child|  {
      child.tag_name == "preview"
    })
  };

  if let Some(target_node) = target_node_option {
    target_node
  } else {
    node_expr
  }
}

fn find_child<TTest>(parent: &ast::Node, test: TTest) -> Option<&ast::Node> 
where TTest: Fn(&ast::Element) -> bool {
  match ast::get_children(parent) {
    Some(children) => children.iter().find(|child| {
      if let ast::Node::Element(element) = child {
        if test(element) {
          return true;
        }
      } 
      false
    }),
    None => None
  }
}

pub fn evaluate_document_styles<'a>(node_expr: &ast::Node, uri: &String, vfs: &'a VirtualFileSystem) -> Result<css_virt::CSSSheet, RuntimeError>  {
  let mut sheet = css_virt::CSSSheet {
    rules: vec![] 
  };
  let children_option = ast::get_children(&node_expr);
  let scope = get_document_style_scope(uri);
  if let Some(children) = children_option {
    // style elements are only allowed in root, so no need to traverse
    for child in children {
      if let ast::Node::StyleElement(style_element) = &child {
        sheet.extend(evaluate_css(&style_element.sheet, uri, &scope, vfs)?);
      }
    }
  }

  Ok(sheet)
}

pub fn evaluate_jumbo_style<'a>(entry_expr: &ast::Node, context: &'a mut Context) -> Result<virt::Node, RuntimeError>  {

  let mut sheet = css_virt::CSSSheet {
    rules: vec![] 
  };
  let uri = context.uri;

  let deps =  context.graph.flatten(uri);

  for (dependency, dependent_option) in context.graph.flatten(uri) {

    // skip if self -- styles get evaluated after all imports. Note
    // that this is incorrect if style is declared before import, but whatever.
    if &dependency.uri == uri {
      continue;
    }
    let dep_sheet = match &dependency.content {
      DependencyContent::Node(node) => {
        evaluate_document_styles(node, &dependency.uri, context.vfs)?
      },
      DependencyContent::StyleSheet(sheet) => {
        let scope = if let Some(dependent) = dependent_option {
          get_document_style_scope(&dependent.uri)
        } else {
          get_document_style_scope(&dependency.uri)
        };
        
        evaluate_css(&sheet, &dependency.uri, &scope, context.vfs)?
      }
    };

    sheet.extend(dep_sheet);
  }

  // this element styles always get priority.
  sheet.extend(evaluate_document_styles(&entry_expr, &uri, context.vfs)?);

  
  Ok(virt::Node::StyleElement(virt::StyleElement {
    id: context.get_next_id(),
    sheet
  }))
}

pub fn evaluate_instance_node<'a>(node_expr: &ast::Node, context: &'a mut Context, render_strategy: RenderStrategy) -> Result<Option<virt::Node>, RuntimeError>  {
  context.render_call_stack.push((context.uri.to_string(), render_strategy.clone()));
  evaluate_node(get_instance_target_node(node_expr, render_strategy), true, context)
}

fn create_context<'a>(node_expr: &'a ast::Node, uri: &'a String, graph: &'a DependencyGraph, vfs: &'a VirtualFileSystem, data: &'a js_virt::JsValue,  parent_option: Option<&'a Context>) -> Context<'a> {

  let (render_call_stack, curr_id_count) = if let Some(parent) = parent_option {
    (parent.render_call_stack.clone(), parent.id_count)
  } else {
    (vec![], 0)
  };

  let scope = get_document_style_scope(uri);
  let id_seed = create_id_seed(uri, curr_id_count);

  Context {
    graph,
    uri,
    vfs,
    render_call_stack,
    import_ids: HashSet::from_iter(ast::get_import_ids(node_expr)),
    part_ids: HashSet::from_iter(ast::get_part_ids(node_expr)),
    scope,
    data,
    id_seed,
    id_count: 0
  }
}

fn create_id_seed(uri: &String, curr_id_count: i32) -> String{
  format!("{:x}", crc32::checksum_ieee(format!("{}-{}", uri, curr_id_count).as_bytes())).to_string()
}

pub fn evaluate_node<'a>(node_expr: &ast::Node, is_root: bool, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
  match &node_expr {
    ast::Node::Element(el) => {
      evaluate_element(&el, is_root, context)
    },
    ast::Node::StyleElement(el) => {
      evaluate_style_element(&el, context)
    },
    ast::Node::Text(text) => {
      Ok(Some(virt::Node::Text(virt::Text { 
        // source_uri: context.uri.to_string(),
        // source_location: text.location.clone(),
        id: context.get_next_id(),
        value: text.value.to_string()
      })))
    },
    ast::Node::Slot(slot) => {
      evaluate_slot(&slot, context)
    },
    ast::Node::Fragment(el) => {
      evaluate_fragment(&el, context)
    },
    ast::Node::Block(block) => {
      evaluate_block(&block, context)
    },
    ast::Node::Comment(_el) => {
      Ok(None)
    }
  }
}

fn evaluate_element<'a>(element: &ast::Element, is_root: bool, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
  match element.tag_name.as_str() {
    "import" => evaluate_import_element(element, context),
    "part" => evaluate_part_element(element, is_root, context),
    "self" => evaluate_self_element(element, context),
    "preview" => evaluate_preview_element(element, is_root, context),
    "script" | "property" | "logic" => Ok(None),
    _ => {
      if context.import_ids.contains(&ast::get_tag_name(&element)) {
        evaluate_imported_component(element, context)
      } else if context.part_ids.contains(&element.tag_name) {
        evaluate_part_instance_element(element, context)
      } else {
        evaluate_basic_element(element, context)
      }
    }
  }
}

fn evaluate_preview_element<'a>(element: &ast::Element, is_root: bool, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
  if is_root {
    evaluate_children_as_fragment(&element.children, context)
  } else {
    Ok(None)
  }
}

fn evaluate_slot<'a>(slot: &ast::Slot, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
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
          // location: item.location.clone(),
          // source_location: item.source_location.clone(),
          id: context.get_next_id(),
          value:item.to_string()
        }))
      }
    }

    return Ok(Some(virt::Node::Fragment(virt::Fragment {
      children
    })));
  } else if let js_virt::JsValue::JsNode(node)  = js_value {
    return Ok(Some(node));
  }

  Ok(Some(virt::Node::Text(virt::Text { 
    id: context.get_next_id(),
    // value: format!("{:?}", context.data)
    value: js_value.to_string() 
  })))
}

pub fn evaluate_imported_component<'a>(element: &ast::Element, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
  let self_dep  = &context.graph.dependencies.get(context.uri).unwrap();
  let dep_uri = &self_dep.dependencies.get(&ast::get_tag_name(element)).unwrap();
  let namespace_option = ast::get_tag_namespace(element);
  evaluate_component_instance(element, if let Some(part) = namespace_option {
    RenderStrategy::Part(part)
  }  else {
    RenderStrategy::Instance
  }, dep_uri, context)
}

fn in_render_stack<'a>(strategy: &RenderStrategy, context: &'a mut Context) -> bool {
  context.render_call_stack.iter().any(|(uri, part)| uri == context.uri && part == strategy)
}

fn check_instance_loop<'a>(strategy: &RenderStrategy, element: &ast::Element, context: &'a mut Context) -> Result<(), RuntimeError> {
  let tag = match strategy {
    RenderStrategy::Instance => "self".to_string(),
    RenderStrategy::Part(id) => id.to_string(),
    RenderStrategy::Preview => "preview".to_string(),
  };
  
  if in_render_stack(strategy, context) {
    return Err(RuntimeError { 
      uri: context.uri.to_string(), 
      message: format!("Can't call <{} /> here since this causes an infinite loop!", tag).to_string(), 
      location: element.open_tag_location.clone() 
    });
  } else {
    Ok(())
  }
}

fn evaluate_self_element<'a>(element: &ast::Element, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
  evaluate_component_instance(element, RenderStrategy::Instance, context.uri, context)
}

fn evaluate_part_instance_element<'a>(element: &ast::Element, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
  let self_dep  = &context.graph.dependencies.get(context.uri).unwrap();

  if let DependencyContent::Node(_root_node) = &self_dep.content {
    // let part = ast::get_part_by_id(&element.tag_name, root_node).unwrap();
    // let data = create_component_instance_data(element, context)?;
    // let mut new_context = create_context(root_node, &self_dep.uri, context.graph, context.vfs, &data, Some(context));
    // new_context.render_call_stack.push(RenderStrategy::Part(part.to_string()));

    evaluate_component_instance(element, RenderStrategy::Part(element.tag_name.to_string()), context.uri, context)
    // evaluate_instance_node()
    // evaluate_element(part, false, &mut new_context)
  } else {

    // This should _never_ happen
    Err(RuntimeError::unknown(context.uri))
  }
}

fn create_component_instance_data<'a>(instance_element: &ast::Element, context: &'a mut Context) -> Result<js_virt::JsValue, RuntimeError> {
  let mut data = js_virt::JsObject::new();

  for attr_expr in &instance_element.attributes {
    let attr = &attr_expr;
    match attr {
      ast::Attribute::KeyValueAttribute(kv_attr) => {
        if kv_attr.value == None {
          data.values.insert(kv_attr.name.to_string(), js_virt::JsValue::JsBoolean(true));
        } else {
          let value = evaluate_attribute_value(&kv_attr.value.as_ref().unwrap(), context)?;
          data.values.insert(
            kv_attr.name.to_string(),
            value
          );
        }
      },
      ast::Attribute::SpreadAttribute(attr) => {
        let attr_data = evaluate_js(&attr.script, context)?;
        match attr_data {
          js_virt::JsValue::JsObject(mut object) => {
            for (key, value) in object.values.drain() {
              data.values.insert(key.to_string(), value);
            }
          },
          _ => {
            return Err(RuntimeError::new("Spread value must be an object.".to_string(), context.uri, &instance_element.location));
          }
        };
      },
      ast::Attribute::ShorthandAttribute(sh_attr) => {
        let name = sh_attr.get_name().map_err(|message| {
          RuntimeError {
            uri: context.uri.to_string(),
            message: message.to_string(),
            location: Location { 
              start: 0,
              end: 0
            }
          }
        })?;

        data.values.insert(name.to_string(), evaluate_attribute_slot(&sh_attr.reference, context)?);
      }
    };
  }

  
  let mut js_children = js_virt::JsArray::new();
  let children: Vec<js_virt::JsValue> = evaluate_children(&instance_element.children, context)?.into_iter().map(|child| {
    js_virt::JsValue::JsNode(child)
  }).collect();

  js_children.values.extend(children);

  data.values.insert("children".to_string(), js_virt::JsValue::JsArray(js_children));

  Ok(js_virt::JsValue::JsObject(data))
}

fn evaluate_component_instance<'a>(instance_element: &ast::Element, render_strategy: RenderStrategy, dep_uri: &String, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {

  let dep = &context.graph.dependencies.get(&dep_uri.to_string()).unwrap();
  let data = create_component_instance_data(instance_element, context)?;
  
  if let DependencyContent::Node(node) = &dep.content {
    let mut instance_context = create_context(&node, dep_uri, context.graph, context.vfs, &data, Some(&context));
    check_instance_loop(&render_strategy, instance_element, &mut instance_context)?;

    // TODO: if fragment, then wrap in span. If not, then copy these attributes to root element
    evaluate_instance_node(&node, &mut instance_context, render_strategy)
  } else {
    Err(RuntimeError::unknown(context.uri))
  }
}

fn evaluate_basic_element<'a>(element: &ast::Element, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {

  let mut attributes = vec![];

  let tag_name = ast::get_tag_name(element);

  for attr_expr in &element.attributes {
    let attr = &attr_expr;

    match attr {
      ast::Attribute::KeyValueAttribute(kv_attr) => {
        let (name, mut value_option) = if kv_attr.value == None {
          (kv_attr.name.to_string(), None)
        } else {
          let value = evaluate_attribute_value(&kv_attr.value.as_ref().unwrap(), context)?;
          if !value.truthy() {
            continue;
          }
          (kv_attr.name.to_string(), Some(value.to_string()))
        };

        if name == "src" {
          if let Some(value) = value_option {
            if is_relative_path(&value) {
              let full_path = context.vfs.resolve(context.uri, &value);
              value_option = Some(full_path);
            } else {
              value_option = None;
            }
          }
        }

        attributes.push(virt::Attribute {
          id: context.get_next_id(),
          name,
          value: value_option,
        });
      },
      ast::Attribute::SpreadAttribute(attr) => {
        let attr_data = evaluate_js(&attr.script, context)?;
        match attr_data {
          js_virt::JsValue::JsObject(mut object) => {
            for (key, value) in object.values.drain() {
              // data.values.insert(key.to_string(), value);
              attributes.push(virt::Attribute {
                id: context.get_next_id(),
                name: key.to_string(),
                value: Some(value.to_string()),
              });
            }
          },
          _ => {
            return Err(RuntimeError::new("Spread value must be an object.".to_string(), context.uri, &element.location));
          }
        };
      },
      ast::Attribute::ShorthandAttribute(sh_attr) => {
        let name = sh_attr.get_name().map_err(|message| {
          RuntimeError {
            uri: context.uri.to_string(),
            message: message.to_string(),
            location: Location { 
              start: 0,
              end: 0
            }
          }
        })?;
        let js_value = evaluate_attribute_slot(&sh_attr.reference, context)?;

        if js_value.truthy() {
          attributes.push(virt::Attribute {
            id: context.get_next_id(),
            name: name.to_string(),
            value: Some(js_value.to_string()),
          });
        }
      }
    };

  }

  attributes.push(virt::Attribute {
    id: context.get_next_id(),
    name: format!("data-pc-{}", context.scope.to_string()).to_string(),
    value: None
  });

  let children = evaluate_children(&element.children, context)?;

  Ok(Some(virt::Node::Element(virt::Element {
    id: context.get_next_id(),
    source_uri: context.uri.to_string(),
    source_location: element.location.clone(),
    tag_name: tag_name,
    attributes,
    children
  })))
}

fn evaluate_import_element<'a>(_element: &ast::Element, _context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
  Ok(None)
}


fn evaluate_part_element<'a>(element: &ast::Element, is_root: bool, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
  if !is_root {
    return Ok(None)
  }

  // check_instance_loop(&RenderStrategy::Part(ast::get_attribute_value("id", element).unwrap().to_string()), element, context)?;    
  evaluate_children_as_fragment(&element.children, context)
}

fn evaluate_style_element<'a>(_element: &ast::StyleElement, _context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
  Ok(None)
}
  

fn evaluate_children<'a>(children_expr: &Vec<ast::Node>, context: &'a mut Context) -> Result<Vec<virt::Node>, RuntimeError> {
  
  let mut children: Vec<virt::Node> = vec![];

  for child_expr in children_expr {
    match evaluate_node(child_expr, false, context)? {
      Some(c) => { children.push(c); },
      None => { }
    }
  }

  Ok(children)
}

fn evaluate_fragment<'a>(fragment: &ast::Fragment, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
  evaluate_children_as_fragment(&fragment.children, context)
}

fn evaluate_children_as_fragment<'a>(children: &Vec<ast::Node>, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
  let mut children = evaluate_children(&children, context)?;
  if children.len() == 1 {
    return Ok(children.pop());
  }
  Ok(Some(virt::Node::Fragment(virt::Fragment {
    children
  })))
}

fn evaluate_block<'a>(block: &ast::Block, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
  match block {
    ast::Block::Conditional(conditional_block) => {
      evaluate_conditional_block(conditional_block, context)
    },
    ast::Block::Each(each_block) => {
      evaluate_each_block(each_block, context)
    }
  }
}

fn evaluate_conditional_block<'a>(block: &ast::ConditionalBlock, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
  match block {
    ast::ConditionalBlock::PassFailBlock(pass_fail) => {
      evaluate_pass_fail_block(pass_fail, context)
    },
    ast::ConditionalBlock::FinalBlock(block) => {
      if let Some(node) = &block.body {
        evaluate_node(node, false, context)
      } else {
        Ok(None)
      }
    }
  }
}

fn evaluate_pass_fail_block<'a>(block: &ast::PassFailBlock, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {
  let condition = evaluate_js(&block.condition, context)?;
  if condition.truthy() {
    if let Some(node) = &block.body {
      evaluate_node(node, false, context)
    } else {
      Ok(None)
    }
  } else if let Some(fail) = &block.fail {
    evaluate_conditional_block(fail, context)
  } else {
    Ok(None)
  }
}

fn evaluate_each_block<'a>(block: &ast::EachBlock, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {

  if block.body == None {
    return Ok(None)
  }

  let body = block.body.as_ref().unwrap();

  let mut children: Vec<virt::Node> = vec![];
  let source = evaluate_js(&block.source, context)?;

  if let js_virt::JsValue::JsArray(items) = source {
    for (index, item) in items.values.iter().enumerate() {
      let child_option = evaluate_each_block_body(&body, item, index, &block.value_name, &block.key_name, context)?;
      if let Some(child) = child_option {
        children.push(child);
      }
    }

  } else {

  }

  Ok(Some(virt::Node::Fragment(virt::Fragment {
    children,
  })))
}

fn evaluate_each_block_body<'a>(body: &ast::Node, item: &js_virt::JsValue, index: usize, item_name: &String, key_name: &Option<String>, context: &'a mut Context) -> Result<Option<virt::Node>, RuntimeError> {

  let mut data = context.data.clone();
  match data {
    js_virt::JsValue::JsObject(ref mut data) => {
      data.values.insert(item_name.to_string(), item.clone());
      if let Some(key) = key_name {
        let key_value = js_virt::JsValue::JsNumber(index as f64);
        data.values.insert(key.to_string(), key_value);
      }
    },
    _ => { }
  }  
  context.id_count += 1;
  let mut child_context = context.clone();
  child_context.id_count = 0;
  child_context.id_seed = create_id_seed(context.uri, context.id_count);
  child_context.data = &data;

  evaluate_node(body, false, &mut child_context)
}

fn evaluate_attribute_value<'a>(value: &ast::AttributeValue, context: &mut Context) -> Result<js_virt::JsValue, RuntimeError> {
  match value {
    ast::AttributeValue::String(st) => {
      Ok(js_virt::JsValue::JsString(st.value.clone()))
    }
    ast::AttributeValue::Slot(script) => {
      evaluate_attribute_slot(script, context)
    }
  }
}

fn evaluate_attribute_slot<'a>(script: &js_ast::Statement, context: &'a mut Context) -> Result<js_virt::JsValue, RuntimeError> {
  evaluate_js(script, context)
}

#[cfg(test)]
mod tests {
  use super::*;
  use super::super::super::parser::*;

  #[test]
  fn can_evaluate_a_style() {
    let case = "<style>div { color: red; }</style><div></div>";
    let ast = parse(case).unwrap();
    let graph = DependencyGraph::new();
    let vfs = VirtualFileSystem::new(Box::new(|_| "".to_string()), Box::new(|_| true), Box::new(|_,_| "".to_string()));
    let _node = evaluate_source(case);
  }

  #[test]
  fn can_evaluate_a_simple_each_block() {
    let code = "{#each items as item}{item}{/}";
    let ast = parse(code).unwrap();
    let graph = DependencyGraph::new();
    let vfs = VirtualFileSystem::new(Box::new(|_| "".to_string()), Box::new(|_| true), Box::new(|_,_| "".to_string()));

    let mut object = js_virt::JsObject::new();
    let mut items = js_virt::JsArray::new();
    items.values.push(js_virt::JsValue::JsString("a".to_string()));
    items.values.push(js_virt::JsValue::JsString("b".to_string()));
    items.values.push(js_virt::JsValue::JsString("c".to_string()));
    object.values.insert("items".to_string(), js_virt::JsValue::JsArray(items));
    let data = js_virt::JsValue::JsObject(object);
    let _node = evaluate_source(code);
  }

  #[test]
  fn can_smoke_evaluate_various_elements() {

    let cases = [
      "{#each [1, 2, 3] as item}{item}{/}",
      "{#if true}do something{/}",
      "{#if false}do something{/else}something else{/}",
      "
      <span>
        {#each [0, false, 1, true] as item}
          {#if item}
            pass: {item}
          {/else}
            fail: {item}
          {/}
        {/}
      </span>
      {#each [1, 2, 3] as item}
        okay
      {/}
    ",

    "{true}",
    "{'false'}"
    // "<span {...props} />"
    ];
    
    for code in cases.iter() {
      let _node = evaluate_source(code);
    }
  }
  #[test]
  fn catches_infinite_part_loop() {
    let result = evaluate_source("
      <part id='test'>
        <div>
          <test a />          
        </div>
      </part>
      <preview>
        <test />
      </preview>
    ");
    
    assert_eq!(result, Err(RuntimeError::new("Can't call <test /> here since this causes an infinite loop!".to_string(), &"some-file.pc".to_string(), &Location {
      start: 48,
      end: 58
    })));
  }

  #[test]
  fn catches_recursion_in_multiple_parts() {
    let result = evaluate_source("
      <part id='test2'>
        <div>
          <test />
        </div>
      </part>
      <part id='test'>
        <div>
          <test2 />          
        </div>
      </part>
      <preview>
        <test />
      </preview>
    ");
    
    assert_eq!(result, Err(RuntimeError::new("Can't call <test /> here since this causes an infinite loop!".to_string(), &"some-file.pc".to_string(), &Location {
      start: 49,
      end: 57
    })))
  }

  #[test]
  fn catches_recursion_for_self_element() {
    let result = evaluate_source("
      Hello world
      <self />
    ");
    
    assert_eq!(result, Err(RuntimeError::new("Can't call <self /> here since this causes an infinite loop!".to_string(), &"some-file.pc".to_string(), &Location {
      start: 25,
      end: 33
    })))
  }

  #[test]
  fn allows_self_to_be_called_in_preview() {
    evaluate_source("
      Hello
      <preview>
        <self />
      </preview>
    ").unwrap();
  }

  fn evaluate_source<'a>(code: &'a str) -> Result<Option<virt::Node>, RuntimeError>{
    let mut graph = DependencyGraph::new(); 
    let uri = "some-file.pc".to_string();
    let vfs = VirtualFileSystem::new(Box::new(|_| "".to_string()), Box::new(|_| true), Box::new(|_,uri| uri.to_string()));
    graph.dependencies.insert(uri.clone(), Dependency::from_source(code.to_string(), &uri, &vfs).unwrap());

    let data = js_virt::JsValue::JsObject(js_virt::JsObject::new());
    evaluate(&uri, &graph, &vfs, &data, None)
  }
}
