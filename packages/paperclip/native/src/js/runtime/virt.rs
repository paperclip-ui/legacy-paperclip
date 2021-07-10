use crate::base::ast::ExprTextSource;
use crate::pc::runtime::virt::Node;
use serde::Serialize;
use std::collections::HashMap;
use std::fmt;

// TODO - all js values here need to extend JsClass

#[allow(dead_code)]
#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum JsValue {
  JsObject(JsObject),
  JsArray(JsArray),
  JsNode(Node),
  JsString(JsString),
  JsBoolean(JsBoolean),
  JsNumber(JsNumber),
  JsUndefined(JsUndefined),
}

impl JsValue {
  pub fn truthy(&self) -> bool {
    match self {
      JsValue::JsUndefined(_) => false,
      JsValue::JsBoolean(value) => value.value == true,
      JsValue::JsNumber(value) => value.value != 0.0,
      JsValue::JsString(value) => (&value.value).len() != 0,
      _ => true,
    }
  }
  pub fn is_number(&self) -> bool {
    match self {
      JsValue::JsNumber(value) => true,
      _ => false,
    }
  }
  pub fn get_source_id(&self) -> &String {
    match self {
      JsValue::JsUndefined(value) => &value.source_id,
      JsValue::JsNode(value) => &value.get_source_id(),
      JsValue::JsBoolean(value) => &value.source_id,
      JsValue::JsNumber(value) => &value.source_id,
      JsValue::JsString(value) => &value.source_id,
      JsValue::JsObject(value) => &value.source_id,
      JsValue::JsArray(value) => &value.source_id,
    }
  }
}

impl fmt::Display for JsValue {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      JsValue::JsObject(_object) => write!(f, "[Object object]"),
      JsValue::JsString(value) => write!(f, "{}", value.value),
      JsValue::JsBoolean(value) => write!(f, "{}", if value.value { "true" } else { "false" }),
      JsValue::JsNode(_value) => write!(f, "[Object object]"),
      JsValue::JsNumber(value) => write!(f, "{}", value.value),
      JsValue::JsArray(_value) => write!(f, "[Object object]"),
      JsValue::JsUndefined(_) => write!(f, "undefined"),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct JsString {
  #[serde(rename = "sourceId")]
  pub source_id: String,
  pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct JsBoolean {
  #[serde(rename = "sourceId")]
  pub source_id: String,
  pub value: bool,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct JsNumber {
  #[serde(rename = "sourceId")]
  pub source_id: String,
  pub value: f64,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct JsUndefined {
  #[serde(rename = "sourceId")]
  pub source_id: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct JsObject {
  #[serde(rename = "sourceId")]
  pub source_id: String,
  pub values: HashMap<String, JsValue>,
}

impl JsObject {
  pub fn new(source_id: String) -> JsObject {
    JsObject {
      source_id,
      values: HashMap::new(),
    }
  }
}

impl PartialEq for JsObject {
  fn eq(&self, other: &Self) -> bool {
    self.values == other.values
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct JsArray {
  pub source_id: String,
  pub values: Vec<JsValue>,
}

impl JsArray {
  pub fn new(source_id: String) -> JsArray {
    JsArray {
      source_id,
      values: vec![],
    }
  }
}

pub fn get_js_value_property<'a, 'b>(
  value: &'a JsValue,
  property_name: &'b str,
) -> Option<&'a JsValue> {
  match value {
    JsValue::JsObject(object) => object.values.get(property_name),
    _ => None,
  }
}
