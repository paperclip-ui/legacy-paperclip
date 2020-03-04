use std::fmt;
use serde::{Serialize};
use crate::css::runtime::virt as css_virt;
use crate::base::ast::{Location};

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Fragment {
  pub children: Vec<Node>
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
  
  pub id: String,
  
  #[serde(rename = "sourceUri")]
  pub source_uri: String,

  #[serde(rename = "sourceLocation")]
  pub source_location: Location,

  #[serde(rename = "tagName")]
  pub tag_name: String,
  pub attributes: Vec<Attribute>,
  pub children: Vec<Node>
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleElement {
  pub id: String,
  pub sheet: css_virt::CSSSheet
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
    for attribute in &self.attributes {
      if attribute.value == None {
        write!(f, " {}", &attribute.name)?;
      } else {
        write!(f, " {}=\"{}\"", attribute.name, attribute.value.as_ref().unwrap())?;
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

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Attribute {
  pub id: String,
  pub name: String,
  pub value: Option<String>
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Text {
  // #[serde(rename = "sourceUri")]
  // pub source_uri: String,

  // #[serde(rename = "sourceLocation")]
  // pub source_location: Location,
  pub id: String,
  pub value: String
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum Node {
  Element(Element),
  Text(Text),
  Fragment(Fragment),
  StyleElement(StyleElement)
}

impl fmt::Display for Node {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Node::Element(el) => { write!(f, "{}", el.to_string())},
      Node::Fragment(fragment) => { write!(f, "{}", fragment.to_string())},
      Node::StyleElement(el) => { write!(f, "{}", el.to_string())},
      Node::Text(text) => { write!(f, "{}", text.value.to_string())}
    }
  }
}

impl Node {
  pub fn prepend_child<'a>(&mut self, child: Node) {
    match self {
      Node::Element(ref mut element) => {
        element.children.insert(0, child);
      },
      Node::Fragment(ref mut element) => {
        element.children.insert(0, child);
      },
      _ => {
        
      }
    }
  }
}

