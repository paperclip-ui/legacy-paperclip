use crate::base::ast::ExprTextSource;
use crate::pc::runtime::virt::Node;
use serde::Serialize;
use std::collections::HashMap;
use std::fmt;

// TODO - all  values here need to extend JsClass

#[allow(dead_code)]
#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum Value {
  Object(Object),
  Array(Array),
  Node(Node),
  Str(Str),
  Boolean(Boolean),
  Number(Number),
  Undefined(Undefined),
}

impl Value {
  pub fn truthy(&self) -> bool {
    match self {
      Value::Undefined(_) => false,
      Value::Boolean(value) => value.value == true,
      Value::Number(value) => value.value != 0.0,
      Value::Str(value) => (&value.value).len() != 0,
      _ => true,
    }
  }
  pub fn is_number(&self) -> bool {
    match self {
      Value::Number(value) => true,
      _ => false,
    }
  }
  pub fn get_source_id(&self) -> &String {
    match self {
      Value::Undefined(value) => &value.source_id,
      Value::Node(value) => &value.get_source_id(),
      Value::Boolean(value) => &value.source_id,
      Value::Number(value) => &value.source_id,
      Value::Str(value) => &value.source_id,
      Value::Object(value) => &value.source_id,
      Value::Array(value) => &value.source_id,
    }
  }
}

impl fmt::Display for Value {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Value::Object(_object) => write!(f, "[Object object]"),
      Value::Str(value) => write!(f, "{}", value.value),
      Value::Boolean(value) => write!(f, "{}", if value.value { "true" } else { "false" }),
      Value::Node(_value) => write!(f, "[Object object]"),
      Value::Number(value) => write!(f, "{}", value.value),
      Value::Array(_value) => write!(f, "[Object object]"),
      Value::Undefined(_) => write!(f, "undefined"),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Str {
  #[serde(rename = "sourceId")]
  pub source_id: String,
  pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Boolean {
  #[serde(rename = "sourceId")]
  pub source_id: String,
  pub value: bool,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Number {
  #[serde(rename = "sourceId")]
  pub source_id: String,
  pub value: f64,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Undefined {
  #[serde(rename = "sourceId")]
  pub source_id: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct Object {
  #[serde(rename = "sourceId")]
  pub source_id: String,
  pub values: HashMap<String, Value>,
}

impl Object {
  pub fn new(source_id: String) -> Object {
    Object {
      source_id,
      values: HashMap::new(),
    }
  }
}

impl PartialEq for Object {
  fn eq(&self, other: &Self) -> bool {
    self.values == other.values
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Array {
  pub source_id: String,
  pub values: Vec<Value>,
}

impl Array {
  pub fn new(source_id: String) -> Array {
    Array {
      source_id,
      values: vec![],
    }
  }
}

pub fn get_virt_value_property<'a, 'b>(
  value: &'a Value,
  property_name: &'b str,
) -> Option<&'a Value> {
  match value {
    Value::Object(object) => object.values.get(property_name),
    _ => None,
  }
}
