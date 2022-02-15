extern crate wasm_bindgen;
use crate::css::runtime::virt as css_virt;
use crate::script::runtime::virt as script_virt;
use serde::Serialize;
use std::collections::BTreeMap;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct NodeSource {
  pub path: Vec<usize>,

  #[serde(rename = "documentUri")]
  pub document_uri: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Fragment {
  pub id: String,
  #[serde(rename = "sourceId")]
  pub source_id: String,
  pub children: Vec<Node>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ElementInstanceOfInfo {
  #[serde(rename = "componentName")]
  pub component_name: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ElementSourceInfo {
  #[serde(rename = "instanceOf")]
  pub instance_of: Option<ElementInstanceOfInfo>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Slot {
  pub id: String,
  #[serde(rename = "sourceId")]
  pub source_id: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Element {
  pub id: String,
  #[serde(rename = "sourceId")]
  pub source_id: String,

  // Deprecated, use source_id instead
  pub annotations: Option<script_virt::Object>,

  #[serde(rename = "tagName")]
  pub tag_name: String,
  pub attributes: BTreeMap<String, Option<String>>,
  pub children: Vec<Node>,

  #[serde(rename = "sourceInfo")]
  pub source_info: ElementSourceInfo,
}

impl Element {
  pub fn get_annotation(&self, name: &String) -> Option<&script_virt::Value> {
    self.annotations.as_ref().and_then(|annotations| {
      if let Some(annotation) = annotations.values.get(name) {
        Some(annotation)
      } else {
        None
      }
    })
  }
  pub fn get_annotation_property_value(
    &self,
    annotation_name: &str,
    property_name: &str,
  ) -> Option<&script_virt::Value> {
    self
      .get_annotation(&annotation_name.to_string())
      .and_then(|ann| {
        if let script_virt::Value::Object(object) = ann {
          object.values.get(property_name)
        } else {
          None
        }
      })
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleElement {
  pub id: String,
  #[serde(rename = "sourceId")]
  pub source_id: String,
  pub sheet: css_virt::CSSSheet,
}

impl Element {
  pub fn get_attribute<'a>(&self, name: &'a str) -> Option<Option<String>> {
    for (key, value) in &self.attributes {
      if (key == name) {
        return Some(value.clone());
      }
    }
    None
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Text {
  pub id: String,
  #[serde(rename = "sourceId")]
  pub source_id: String,
  pub annotations: Option<script_virt::Object>,
  pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum Node {
  Element(Element),
  Text(Text),
  Slot(Slot),
  Fragment(Fragment),
  StyleElement(StyleElement),
}

impl Node {
  pub fn prepend_child<'a>(&mut self, child: Node) {
    match self {
      Node::Element(ref mut element) => {
        element.children.insert(0, child);
      }
      Node::Fragment(ref mut element) => {
        element.children.insert(0, child);
      }
      _ => {}
    }
  }
  pub fn get_source_id(&self) -> &String {
    match self {
      Node::Element(value) => &value.source_id,
      Node::Text(value) => &value.source_id,
      Node::Slot(value) => &value.source_id,
      Node::Fragment(value) => &value.source_id,
      Node::StyleElement(value) => &value.source_id,
    }
  }

  pub fn get_children<'a>(&'a self) -> Option<&'a Vec<Node>> {
    match self {
      Node::Element(value) => Some(&value.children),
      Node::Fragment(value) => Some(&value.children),
      _ => None,
    }
  }

  pub fn get_descendent<'a>(&'a self, path: &Vec<usize>) -> Option<&'a Node> {
    let mut curr = Some(self);
    for i in path {
      curr = curr
        .and_then(|node| node.get_children())
        .and_then(|children| children.get(*i));

      if curr == None {
        break;
      }
    }

    curr
  }
}
