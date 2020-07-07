use super::super::ast;
use super::virt;
use crate::base::ast::{ExprSource, Location};
use crate::base::runtime::RuntimeError;
use crate::pc::ast as pc_ast;
use crate::pc::runtime::evaluator::{evaluate_node as evaluate_pc_node, Context as PCContext};

pub fn evaluate<'a>(
  expr: &ast::Statement,
  context: &'a mut PCContext,
) -> Result<virt::JsValue, RuntimeError> {
  evaluate_statement(&expr, context)
}
fn evaluate_statement<'a>(
  statement: &ast::Statement,
  context: &'a mut PCContext,
) -> Result<virt::JsValue, RuntimeError> {
  match statement {
    ast::Statement::Reference(reference) => evaluate_reference(reference, context),
    ast::Statement::Node(node) => evaluate_node(node, context),
    ast::Statement::String(value) => evaluate_string(&value, context),
    ast::Statement::Boolean(value) => evaluate_boolean(&value, context),
    ast::Statement::Number(value) => evaluate_number(&value, context),
    ast::Statement::Array(value) => evaluate_array(value, context),
    ast::Statement::Object(value) => evaluate_object(value, context),
  }
}

fn evaluate_node<'a>(
  node: &Box<pc_ast::Node>,
  context: &'a mut PCContext,
) -> Result<virt::JsValue, RuntimeError> {
  let node_option = evaluate_pc_node(node, false, None, context)?;
  if let Some(node) = node_option {
    Ok(virt::JsValue::JsNode(node))
  } else {
    Ok(virt::JsValue::JsUndefined(virt::JsUndefined {
      source: ExprSource::new(context.uri.clone(), node.get_location().clone()),
    }))
  }
}

fn evaluate_string<'a>(
  value: &ast::Str,
  context: &'a mut PCContext,
) -> Result<virt::JsValue, RuntimeError> {
  Ok(virt::JsValue::JsString(virt::JsString {
    value: value.value.to_string(),
    source: ExprSource::new(context.uri.clone(), value.location.clone()),
  }))
}

fn evaluate_boolean<'a>(
  value: &ast::Boolean,
  context: &'a mut PCContext,
) -> Result<virt::JsValue, RuntimeError> {
  Ok(virt::JsValue::JsBoolean(virt::JsBoolean {
    value: value.value,
    source: ExprSource::new(context.uri.clone(), value.location.clone()),
  }))
}

fn evaluate_number<'a>(
  value: &ast::Number,
  context: &'a mut PCContext,
) -> Result<virt::JsValue, RuntimeError> {
  let value_result = value.value.parse::<f64>();

  if let Ok(number) = value_result {
    Ok(virt::JsValue::JsNumber(virt::JsNumber {
      value: number,
      source: ExprSource::new(context.uri.clone(), value.location.clone()),
    }))
  } else {
    Err(RuntimeError::new(
      "Invalid number.".to_string(),
      context.uri,
      &value.location,
    ))
  }
}

fn evaluate_array<'a>(
  ary: &ast::Array,
  context: &'a mut PCContext,
) -> Result<virt::JsValue, RuntimeError> {
  let mut js_array = virt::JsArray::new(ExprSource::new(context.uri.clone(), ary.location.clone()));
  for value in &ary.values {
    js_array.values.push(evaluate_statement(&value, context)?);
  }
  Ok(virt::JsValue::JsArray(js_array))
}

fn evaluate_object<'a>(
  obj: &ast::Object,
  context: &'a mut PCContext,
) -> Result<virt::JsValue, RuntimeError> {
  let mut js_object =
    virt::JsObject::new(ExprSource::new(context.uri.clone(), obj.location.clone()));
  for property in &obj.properties {
    js_object.values.insert(
      property.key.to_string(),
      evaluate_statement(&property.value, context)?,
    );
  }
  Ok(virt::JsValue::JsObject(js_object))
}

fn evaluate_reference<'a>(
  reference: &ast::Reference,
  context: &'a mut PCContext,
) -> Result<virt::JsValue, RuntimeError> {
  let mut curr = Some(context.data);

  for part in &reference.path {
    if let Some(object) = &curr {
      curr = virt::get_js_value_property(&object, &part.name);
    } else {
      return Err(RuntimeError {
        uri: context.uri.to_string(),
        message: "Cannot access property of undefined".to_string(),
        location: Location { start: 0, end: 1 },
      });
    }
  }

  if let Some(js_value) = curr {
    Ok(js_value.clone())
  } else {
    Ok(virt::JsValue::JsUndefined(virt::JsUndefined {
      source: ExprSource::new(context.uri.clone(), reference.location.clone()),
    }))
  }
}
