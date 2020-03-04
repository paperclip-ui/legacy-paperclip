
use std::fmt;
use crate::base::ast::{Location};
use crate::css::ast as css_ast;
use crate::js::ast as js_ast;
use serde::{Serialize};

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Element {

  pub location: Location,

  #[serde(rename = "openTagLocation")]
  pub open_tag_location: Location,

  #[serde(rename = "tagNameLocation")]
  pub tag_name_location: Location,

  #[serde(rename = "tagName")]
  pub tag_name: String,
  pub attributes: Vec<Attribute>,
  pub children: Vec<Node>
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ValueObject {
  pub location: Location,
  pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum Node {
  Text(ValueObject),
  Comment(ValueObject),
  Element(Element),
  Fragment(Fragment),
  StyleElement(StyleElement),
  Slot(Slot),
  Block(Block)
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Slot {

  // !{slot}
  #[serde(rename = "omitFromCompilation")]
  pub omit_from_compilation: bool,
  pub script: js_ast::Statement
}

impl fmt::Display for Node {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Node::Text(text) => write!(f, "{}", &text.value),
      Node::Slot(slot) => write!(f, "{{{}}}", &slot.script.to_string()),
      Node::Comment(comment) => write!(f, "<!--{}-->", &comment.value),
      Node::Fragment(node) => write!(f, "{}", node.to_string()),
      Node::Element(element) => write!(f, "{}", element.to_string()),
      Node::Block(_block) => write!(f, "[block]"),
      Node::StyleElement(element) => write!(f, "{}", element.to_string()),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "blockKind")]
pub enum Block {
  Conditional(ConditionalBlock),
  Each(EachBlock)
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "conditionalBlockKind")]
pub enum ConditionalBlock {
  PassFailBlock(PassFailBlock),
  FinalBlock(FinalBlock)
}


#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct PassFailBlock {
  pub condition: js_ast::Statement,
  pub body: Option<Box<Node>>,
  pub fail: Option<Box<ConditionalBlock>>
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct FinalBlock {
  pub body: Option<Box<Node>>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct EachBlock {
  
  #[serde(rename = "source")]
  pub source: js_ast::Statement,

  #[serde(rename = "valueName")]
  pub value_name: String,

  #[serde(rename = "keyName")]
  pub key_name: Option<String>,
  pub body: Option<Box<Node>>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct AttributeStringValue {
  pub value: String,
  pub location: Location
}

impl fmt::Display for AttributeStringValue {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "\"{}\"", self.value)
  }
}

pub fn fmt_attributes(attributes: &Vec<Attribute>, f: &mut fmt::Formatter) -> fmt::Result {
  for attribute in attributes {
    write!(f, " {}", attribute.to_string())?;
  }
  Ok(())
}

pub fn fmt_start_tag<'a>(tag_name: &'a str, attributes: &Vec<Attribute>, f: &mut fmt::Formatter) -> fmt::Result {
  write!(f, "<{}", tag_name)?;
  fmt_attributes(attributes, f)?;
  write!(f, ">")?;
  Ok(())
}

pub fn fmt_end_tag<'a>(tag_name: &'a str, f: &mut fmt::Formatter) -> fmt::Result {
  write!(f, "</{}>", tag_name)?;
  Ok(())
}

impl fmt::Display for Element {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    fmt_start_tag(&self.tag_name.as_str(), &self.attributes, f)?;
    for child in &self.children {
      write!(f, "{} ", child.to_string())?;
    }
    fmt_end_tag(&self.tag_name.as_str(), f)?;
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum Attribute {
  ShorthandAttribute(ShorthandAttribute),
  SpreadAttribute(SpreadAttribute),
  KeyValueAttribute(KeyValueAttribute)
}

impl fmt::Display for Attribute {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Attribute::ShorthandAttribute(attr) => attr.fmt(f),
      Attribute::KeyValueAttribute(attr) => attr.fmt(f),
      Attribute::SpreadAttribute(attr) => attr.fmt(f),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SpreadAttribute {

  // !{...slot}
  #[serde(rename = "omitFromCompilation")]
  pub omit_from_compilation: bool,
  pub script: js_ast::Statement,
}

impl fmt::Display for SpreadAttribute {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{{...{}}}", self.script.to_string())
  }
}


#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ShorthandAttribute {
  pub reference: js_ast::Statement,
}

impl ShorthandAttribute {
  pub fn get_name(&self) -> Result<&String, &'static str> {
    match &self.reference {
      js_ast::Statement::Reference(reference) => {
        if reference.path.len() == 1 {
          Ok(&reference.path[0])
        } else {
          Err("Unexpected Expression")
        }
      }
      _ => {
        Err("Unexpected Expression")
      }
    }
  }
}

impl fmt::Display for ShorthandAttribute {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{{{}}}", self.reference.to_string())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct KeyValueAttribute {
  pub name: String,
  pub value: Option<AttributeValue>,
}

impl fmt::Display for KeyValueAttribute {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{}", self.name)?;
    if self.value == None {
      Ok(())
    } else {
      write!(f, "={}", self.value.as_ref().unwrap().to_string())
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "attrValueKind")]
pub enum AttributeValue {
  String(AttributeStringValue),
  Slot(js_ast::Statement)
}

impl fmt::Display for AttributeValue {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match &self {
      AttributeValue::String(value) => { write!(f, "{}", value.to_string()) },
      AttributeValue::Slot(script) => { write!(f, "{{{}}}", script.to_string()) },
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleElement {
  pub attributes: Vec<Attribute>,
  pub sheet: css_ast::Sheet,
}

impl fmt::Display for StyleElement {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    fmt_start_tag("style", &self.attributes, f)?;
    write!(f, "{}", self.sheet.to_string())?;
    fmt_end_tag("style", f)?;
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Fragment {
  pub children: Vec<Node>
}

impl fmt::Display for Fragment {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "")?;
    for child in &self.children {
      write!(f, "{}", child.to_string())?;
    }

    Ok(())
  }
}
pub fn get_children<'a>(expr: &'a Node) -> Option<&'a Vec<Node>> {
  match &expr {
    Node::Element(root) => Some(&root.children),
    Node::Fragment(root) => Some(&root.children),
    _ => None
  }
}

pub fn get_imports<'a>(root_expr: &'a Node) -> Vec<&'a Element> {
  let mut imports = vec![];

  let children = get_children(root_expr);

  if children != None {
    for child in children.unwrap() {
      if let Node::Element(element) = &child {
        if element.tag_name == "import" && get_attribute_value("src", element) != None {
          imports.push(element);
        }
      }
    }
  }

  imports
}


pub fn get_tag_name<'a>(element: &'a Element) -> String {
  if element.tag_name.contains(":") {
    element.tag_name[..element.tag_name.find(":").unwrap()].to_string()
  } else {
    element.tag_name.to_string()
  }
}

pub fn get_tag_namespace<'a>(element: &'a Element) -> Option<String> {
  if element.tag_name.contains(":") {
    Some(element.tag_name[(element.tag_name.find(":").unwrap() + 1)..].to_string())
  } else {
    None
  }
}

pub fn get_parts<'a>(root_expr: &'a Node) -> Vec<&'a Element> {
  let mut parts = vec![];

  let children = get_children(root_expr);

  if children != None {
    for child in children.unwrap() {
      if let Node::Element(element) = &child {
        if element.tag_name == "part" {
          parts.push(element);
        }
      }
    }
  }

  parts
}

pub fn get_part_by_id<'a>(id: &String, root_expr: &'a Node) -> Option<&'a Element> {
  get_parts(root_expr).iter().find(|element| {
    get_attribute_value("id", element) == Some(id)
  }).map(|element| {
    *element
  })
}

pub fn get_import_by_id<'a>(id: &String, root_expr: &'a Node) -> Option<&'a Element> {
  for import in get_imports(root_expr).iter() {
    if get_attribute_value("id", import) == Some(id) {
      return Some(import);
    }
  }
  None
}

pub fn get_import_by_src<'a>(src: &String, root_expr: &'a Node) -> Option<&'a Element> {
  for import in get_imports(root_expr).iter() {
    if get_attribute_value("src", import) == Some(src) {
      return Some(import);
    }
  }
  None
}

pub fn get_attribute<'a, 'b>(name: &'b str, element: &'a Element) -> Option<&'a Attribute> {
  for attribute in &element.attributes {
    if let Attribute::KeyValueAttribute(attr) = attribute {
      if attr.name == name {
        return Some(&attribute);
      }
    }
  }
  None
}

pub fn get_attribute_value<'a, 'b>(name: &'b str, element: &'a Element) -> Option<&'a String> {
  let attr = get_attribute(name, element);
  if let Some(att) = attr {
    if let Attribute::KeyValueAttribute(kv_attribute) = att {
      if let Some(expr) = &kv_attribute.value {
        if let AttributeValue::String(st) = &expr {
          return Some(&st.value);
        }
      }
    }
  }
  None
}

pub fn get_import_ids<'a>(root_expr: &'a Node) -> Vec<&'a String> {
  let mut ids = vec![];
  for import in get_imports(root_expr) {
    if let Some(id) = get_attribute_value("id", &import) {
      ids.push(id);
    }
  }
  ids
}

pub fn get_import_identifier<'a>(import: &'a Element) -> Option<&'a String> {
  if let Some(id) = get_attribute_value("id", &import) {
    return Some(id);
  }
  if let Some(src) = get_attribute_value("src", &import) {
    return Some(src);
  }
  return None;
}

pub fn get_part_ids<'a>(root_expr: &'a Node) -> Vec<&'a String> {
  let mut ids = vec![];
  for part in get_parts(root_expr) {
    if let Some(id) = get_attribute_value("id", &part) {
      ids.push(id);
    }
  }
  ids
}
