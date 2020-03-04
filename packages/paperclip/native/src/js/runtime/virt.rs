use std::fmt;
use std::collections::HashMap;
use serde::{Serialize};
use crate::pc::runtime::virt::{Node};

// TODO - all js values here need to extend JsClass

#[allow(dead_code)]
#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum JsValue {
  JsObject(JsObject),
  JsArray(JsArray),
  JsNode(Node),
  JsString(String),
  JsBoolean(bool),
  JsNumber(f64),
  JsUndefined()
}

impl JsValue {
  pub fn truthy(&self) -> bool {
    match self {
      JsValue::JsUndefined() => false,
      JsValue::JsBoolean(value) => *value,
      JsValue::JsNumber(value) => *value != 0 as f64,
      JsValue::JsString(value) => value.len() != 0,
      _ => true,
    }
  }
}
impl fmt::Display for JsValue {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      JsValue::JsObject(_object) => write!(f, "[Object object]"),
      JsValue::JsString(value) => write!(f, "{}", value),
      JsValue::JsBoolean(value) => write!(f, "{}", if *value { "true" } else { "false" }),
      JsValue::JsNode(_value) => write!(f, "[Object object]"),
      JsValue::JsNumber(value) => write!(f, "{}", value),
      JsValue::JsArray(_value) => write!(f, "[Object object]"),
      JsValue::JsUndefined() => write!(f, "undefined")
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct JsObject {
  pub values: HashMap<String, JsValue>,
}

impl JsObject {
  pub fn new() -> JsObject {
    JsObject {
      values: HashMap::new()
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct JsArray {
  pub values: Vec<JsValue>
}

impl JsArray {
  pub fn new() -> JsArray {
    JsArray {
      values: vec![]
    }
  }
}

pub fn get_js_value_property<'a, 'b>(value: &'a JsValue, property_name: &'b str) -> Option<&'a JsValue> {
  match value {
    JsValue::JsObject(object) => object.values.get(property_name),
    _ => None
  }
}
