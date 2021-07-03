use crate::base::ast::ExprSource;
use crate::css::runtime::virt as css_virt;
use crate::js::runtime::virt as js_virt;
use serde::Serialize;
use std::collections::BTreeMap;
use std::fmt;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Fragment {
  pub source: ExprSource,
  pub children: Vec<Node>,
}

impl fmt::Display for Fragment {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    for child in &self.children {
      write!(f, " {}", &child.to_string())?;
    }
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Element {
  #[serde(rename = "source")]
  pub source: ExprSource,
  pub annotations: Option<js_virt::JsObject>,

  #[serde(rename = "tagName")]
  pub tag_name: String,
  pub attributes: BTreeMap<String, Option<String>>,
  pub children: Vec<Node>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleElement {
  pub source: ExprSource,
  pub sheet: css_virt::CSSSheet,
}

impl fmt::Display for StyleElement {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "<style>")?;
    write!(f, "{}", self.sheet.to_string())?;
    write!(f, "</style>")?;
    Ok(())
  }
}

impl fmt::Display for Element {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "<{}", self.tag_name)?;
    for (name, value) in &self.attributes {
      if value == &None {
        write!(f, " {}", name)?;
      } else {
        write!(f, " {}=\"{}\"", name, value.as_ref().unwrap())?;
      }
    }
    write!(f, ">")?;

    for child in &self.children {
      write!(f, " {}", &child.to_string())?;
    }

    write!(f, "</{}>", &self.tag_name)?;

    Ok(())
  }
}

impl Element {
  pub fn get_attribute<'a>(&self, name: &'a str) -> Option<Option<String>> {
    for (key, value) in &self.attributes {
      if (key == name) {
        return Some(value.clone())
      }
    }
    None
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Text {
  pub annotations: Option<js_virt::JsObject>,
  pub source: ExprSource,
  pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum Node {
  Element(Element),
  Text(Text),
  Fragment(Fragment),
  StyleElement(StyleElement),
}

impl fmt::Display for Node {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Node::Element(el) => write!(f, "{}", el.to_string()),
      Node::Fragment(fragment) => write!(f, "{}", fragment.to_string()),
      Node::StyleElement(el) => write!(f, "{}", el.to_string()),
      Node::Text(text) => write!(f, "{}", text.value.to_string()),
    }
  }
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
  pub fn get_source(&self) -> &ExprSource {
    match self {
      Node::Element(value) => &value.source,
      Node::Text(value) => &value.source,
      Node::Fragment(value) => &value.source,
      Node::StyleElement(value) => &value.source,
    }
  }
  pub fn get_children<'a>(&'a self) -> Option<&'a Vec<Node>> {
    match self {
      Node::Element(value) => {
        Some(&value.children)
      }
      Node::Fragment(value) => {
        Some(&value.children)
      }
      _ => {
        None
      }
    }
  }
}
