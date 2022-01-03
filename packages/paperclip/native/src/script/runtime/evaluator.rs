use super::super::ast;
use super::virt;
use crate::base::ast::Range;
use crate::base::runtime::RuntimeError;
use crate::pc::ast as pc_ast;
use crate::pc::runtime::evaluator::{
  evaluate_node as evaluate_pc_node, use_expr_id, Context as PCContext,
};

pub fn evaluate<'a>(
  expr: &ast::Expression,
  depth: u32,
  context: &'a mut PCContext,
) -> Result<virt::Value, RuntimeError> {
  evaluate_expression(&expr, depth, context)
}
fn evaluate_expression<'a>(
  expression: &ast::Expression,
  depth: u32,
  context: &'a mut PCContext,
) -> Result<virt::Value, RuntimeError> {
  match expression {
    ast::Expression::Reference(reference) => evaluate_reference(reference, context),
    ast::Expression::Conjunction(conjunction) => evaluate_conjuction(conjunction, depth, context),
    ast::Expression::Group(group) => evaluate_group(group, depth, context),
    ast::Expression::Not(conjunction) => evaluate_not(conjunction, depth, context),
    ast::Expression::Node(node) => evaluate_node(node, depth, context),
    ast::Expression::String(value) => evaluate_string(&value, context),
    ast::Expression::Boolean(value) => evaluate_boolean(&value, context),
    ast::Expression::Number(value) => evaluate_number(&value, context),
    ast::Expression::Array(value) => evaluate_array(value, depth, context),
    ast::Expression::Object(value) => evaluate_object(value, depth, context),
  }
}
fn evaluate_group<'a>(
  group: &ast::Group,
  depth: u32,
  context: &'a mut PCContext,
) -> Result<virt::Value, RuntimeError> {
  use_expr_id(&group.id, context);
  evaluate_expression(&group.expression, depth, context)
}

fn evaluate_conjuction<'a>(
  conjunction: &ast::Conjunction,
  depth: u32,
  context: &'a mut PCContext,
) -> Result<virt::Value, RuntimeError> {
  use_expr_id(&conjunction.id, context);
  let left = evaluate_expression(&conjunction.left, depth, context)?;

  match conjunction.operator {
    ast::ConjunctionOperatorKind::And => {
      if !left.truthy() {
        match &*conjunction.right {
          ast::Expression::Conjunction(conj_right) => {
            if conj_right.operator == ast::ConjunctionOperatorKind::Or {
              evaluate_expression(&conj_right.right, depth, context)
            } else {
              Ok(left)
            }
          }
          _ => Ok(left),
        }
      } else {
        evaluate_expression(&conjunction.right, depth, context)
      }
    }
    ast::ConjunctionOperatorKind::Or => {
      if left.truthy() {
        Ok(left)
      } else {
        evaluate_expression(&conjunction.right, depth, context)
      }
    }
  }
}

fn evaluate_not<'a>(
  not: &ast::Not,
  depth: u32,
  context: &'a mut PCContext,
) -> Result<virt::Value, RuntimeError> {
  use_expr_id(&not.id, context);
  Ok(virt::Value::Boolean(virt::Boolean {
    source_id: not.id.to_string(),
    value: !evaluate_expression(&not.expression, depth, context)?.truthy(),
  }))
}

fn evaluate_node<'a>(
  node: &Box<pc_ast::Node>,
  depth: u32,
  context: &'a mut PCContext,
) -> Result<virt::Value, RuntimeError> {
  let node_option = evaluate_pc_node(node, depth, None, &None, context)?;
  if let Some(node) = node_option {
    Ok(virt::Value::Node(node))
  } else {
    Ok(virt::Value::Undefined(virt::Undefined {
      source_id: node.get_id().to_string(),
    }))
  }
}

fn evaluate_string<'a>(
  value: &ast::Str,
  context: &'a mut PCContext,
) -> Result<virt::Value, RuntimeError> {
  use_expr_id(&value.id, context);
  Ok(virt::Value::Str(virt::Str {
    source_id: value.id.to_string(),
    value: value.value.to_string(),
  }))
}

fn evaluate_boolean<'a>(
  value: &ast::Boolean,
  context: &'a mut PCContext,
) -> Result<virt::Value, RuntimeError> {
  use_expr_id(&value.id, context);
  Ok(virt::Value::Boolean(virt::Boolean {
    source_id: value.id.to_string(),
    value: value.value,
  }))
}

fn evaluate_number<'a>(
  value: &ast::Number,
  context: &'a mut PCContext,
) -> Result<virt::Value, RuntimeError> {
  use_expr_id(&value.id, context);
  let value_result = value.value.parse::<f64>();

  if let Ok(number) = value_result {
    Ok(virt::Value::Number(virt::Number {
      source_id: value.id.to_string(),
      value: number,
    }))
  } else {
    Err(RuntimeError::new(
      "Invalid number.".to_string(),
      context.uri,
      &value.range,
    ))
  }
}

fn evaluate_array<'a>(
  ary: &ast::Array,
  depth: u32,
  context: &'a mut PCContext,
) -> Result<virt::Value, RuntimeError> {
  let mut script_array = virt::Array::new(ary.id.to_string());
  for value in &ary.values {
    script_array
      .values
      .push(evaluate_expression(&value, depth, context)?);
  }
  Ok(virt::Value::Array(script_array))
}

fn evaluate_object<'a>(
  obj: &ast::Object,
  depth: u32,
  context: &'a mut PCContext,
) -> Result<virt::Value, RuntimeError> {
  let mut script_object = virt::Object::new(obj.id.to_string());
  for property in &obj.properties {
    script_object.values.insert(
      property.key.to_string(),
      evaluate_expression(&property.value, depth, context)?,
    );
  }
  Ok(virt::Value::Object(script_object))
}

fn evaluate_reference<'a>(
  reference: &ast::Reference,
  context: &'a mut PCContext,
) -> Result<virt::Value, RuntimeError> {
  use_expr_id(&reference.id, context);
  let mut curr = Some(context.data);

  for part in &reference.path {
    if let Some(object) = &curr {
      curr = virt::get_virt_value_property(&object, &part.name);
    } else {
      return Err(RuntimeError {
        uri: context.uri.to_string(),
        message: "Cannot access property of undefined".to_string(),
        range: Range::nil(),
      });
    }
  }

  if let Some(script_value) = curr {
    Ok(script_value.clone())
  } else {
    Ok(virt::Value::Undefined(virt::Undefined {
      source_id: reference.id.to_string(),
    }))
  }
}
