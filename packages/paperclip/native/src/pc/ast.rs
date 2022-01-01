use crate::annotation::ast as annotation_ast;
use crate::base::ast::{BasicRaws, Range};
use crate::css::ast as css_ast;
use crate::js::ast as js_ast;
use serde::Serialize;
use std::fmt;
use std::str;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ElementRaws {
  pub before: String,
}

impl ElementRaws {
  pub fn new(before: &[u8]) -> ElementRaws {
    ElementRaws {
      before: str::from_utf8(before).unwrap().to_string(),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Element {
  pub id: String,
  pub raws: ElementRaws,

  pub range: Range,

  #[serde(rename = "openTagRange")]
  pub open_tag_range: Range,

  #[serde(rename = "tagNameRange")]
  pub tag_name_range: Range,

  #[serde(rename = "tagName")]
  pub tag_name: String,
  pub attributes: Vec<Attribute>,
  pub children: Vec<Node>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Comment {
  pub id: String,
  pub raws: BasicRaws,
  pub range: Range,
  pub annotation: annotation_ast::Annotation,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ValueObject {
  pub id: String,
  pub range: Range,
  pub value: String,
  pub raws: BasicRaws,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "nodeKind")]
pub enum Node {
  Text(ValueObject),
  Comment(Comment),
  Element(Element),
  Fragment(Fragment),
  StyleElement(StyleElement),
  Slot(Slot),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "pcObjectKind")]
pub enum PCObject<'a> {
  Node(&'a Node),
  CSSObject(css_ast::CSSObject<'a>),
  JSObject(&'a js_ast::Expression),
}

impl<'a> PCObject<'a> {
  pub fn get_range(&'a self) -> &'a Range {
    match self {
      PCObject::Node(node) => node.get_range(),
      PCObject::CSSObject(css) => css.get_range(),
      PCObject::JSObject(js) => js.get_range(),
    }
  }
}

impl Node {
  pub fn get_range(&self) -> &Range {
    match self {
      Node::Text(value) => &value.range,
      Node::Comment(value) => &value.range,
      Node::Element(value) => &value.range,
      Node::Fragment(value) => &value.range,
      Node::StyleElement(value) => &value.range,
      Node::Slot(value) => &value.range,
    }
  }
  pub fn walk<F: FnMut(&Node) -> bool>(&self, each: &mut F) -> bool {
    if !(each)(self) {
      return false;
    }
    if let Some(children) = get_children(self) {
      for child in children {
        if !child.walk(each) {
          return false;
        }
      }
    }
    return true;
  }
  pub fn get_id(&self) -> &String {
    match self {
      Node::Text(value) => &value.id,
      Node::Comment(value) => &value.id,
      Node::Element(value) => &value.id,
      Node::Fragment(value) => &value.id,
      Node::StyleElement(value) => &value.id,
      Node::Slot(value) => &value.id,
    }
  }
  pub fn get_object_by_id<'a>(&self, id: &String) -> Option<PCObject> {
    if self.get_id() == id {
      return Some(PCObject::Node(self));
    }

    if let Node::Slot(slot) = self {
      return slot
        .script
        .get_object_by_id(id)
        .and_then(|object| match object {
          js_ast::JSObject::PCObject(obj) => Some(obj),
          js_ast::JSObject::Expression(expr) => match expr {
            js_ast::Expression::Node(node) => Some(PCObject::Node(node)),
            _ => Some(PCObject::JSObject(expr)),
          },
        });
    } else if let Node::StyleElement(style_element) = self {
      return style_element
        .sheet
        .get_object_by_id(id)
        .and_then(|object| Some(PCObject::CSSObject(object)));
    }

    get_children(self).and_then(|children| {
      for child in children {
        let nested = child.get_object_by_id(id);
        if nested != None {
          return nested;
        }
      }
      None
    })
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Slot {
  pub id: String,
  // !{slot}
  #[serde(rename = "omitFromCompilation")]
  pub omit_from_compilation: bool,
  pub script: js_ast::Expression,
  pub range: Range,
  pub raws: BasicRaws,
}

impl fmt::Display for Node {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Node::Text(text) => write!(f, "{}", &text.value),
      Node::Slot(slot) => write!(f, "{{{}}}", &slot.script.to_string()),
      Node::Comment(comment) => write!(f, "<!--[Annotation]-->"),
      Node::Fragment(node) => write!(f, "{}", node.to_string()),
      Node::Element(element) => write!(f, "{}", element.to_string()),
      Node::StyleElement(element) => write!(f, "{}", element.to_string()),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct AttributeStringValue {
  pub id: String,
  pub value: String,
  pub range: Range,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct AttributeSlotValue {
  pub id: String,
  pub script: js_ast::Expression,
  pub range: Range,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct AttributeDynamicStringValue {
  pub id: String,
  pub values: Vec<AttributeDynamicStringPart>,
  pub range: Range,
}

impl fmt::Display for AttributeDynamicStringValue {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    for value in &self.values {
      match value {
        AttributeDynamicStringPart::Slot(stmt) => {
          stmt.fmt(f);
        }
        AttributeDynamicStringPart::ClassNamePierce(stmt) => {
          write!(f, "${}", stmt.class_name);
        }
        AttributeDynamicStringPart::Literal(stmt) => {
          write!(f, "{}", stmt.value);
        }
      }
    }
    Ok(())
    // match &self {
    //   AttributeValue::String(value) => write!(f, "{}", value.to_string()),
    //   AttributeValue::Slot(script) => write!(f, "{{{}}}", script.to_string()),
    //   AttributeValue::DyanmicString(script) => write!(f, "{{{}}}", script.to_string()),
    // }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "partKind")]
pub enum AttributeDynamicStringPart {
  Literal(AttributeDynamicStringLiteral),
  ClassNamePierce(AttributeDynamicStringClassNamePierce),
  Slot(js_ast::Expression),
}

impl AttributeDynamicStringPart {
 pub fn get_id(&self) -> &String {
    match self {
      AttributeDynamicStringPart::ClassNamePierce(expr) => &expr.id,
      AttributeDynamicStringPart::Literal(expr) => &expr.id,
      AttributeDynamicStringPart::Slot(expr) => &expr.get_id()
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct AttributeDynamicStringLiteral {
  pub id: String,
  pub value: String,
  pub range: Range,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "className")]
pub struct AttributeDynamicStringClassNamePierce {
  pub id: String,
  #[serde(rename = "className")]
  pub class_name: String,
  pub range: Range,
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

pub fn fmt_start_tag<'a>(
  tag_name: &'a str,
  attributes: &Vec<Attribute>,
  f: &mut fmt::Formatter,
) -> fmt::Result {
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
#[serde(tag = "attrKind")]
pub enum Attribute {
  ShorthandAttribute(ShorthandAttribute),
  SpreadAttribute(SpreadAttribute),
  KeyValueAttribute(KeyValueAttribute),
  PropertyBoundAttribute(PropertyBoundAttribute),
}

impl fmt::Display for Attribute {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Attribute::ShorthandAttribute(attr) => attr.fmt(f),
      Attribute::KeyValueAttribute(attr) => attr.fmt(f),
      Attribute::SpreadAttribute(attr) => attr.fmt(f),
      Attribute::PropertyBoundAttribute(attr) => attr.fmt(f),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SpreadAttribute {
  pub id: String,
  // !{...slot}
  #[serde(rename = "omitFromCompilation")]
  pub omit_from_compilation: bool,
  pub script: js_ast::Expression,
  pub range: Range,
}

impl fmt::Display for SpreadAttribute {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{{...{}}}", self.script.to_string())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ShorthandAttribute {
  pub id: String,
  pub reference: js_ast::Expression,
  pub range: Range,
}

impl ShorthandAttribute {
  pub fn get_name(&self) -> Result<&String, &'static str> {
    match &self.reference {
      js_ast::Expression::Reference(reference) => {
        if reference.path.len() == 1 {
          Ok(&reference.path[0].name)
        } else {
          Err("Unexpected Expression")
        }
      }
      _ => Err("Unexpected Expression"),
    }
  }
}

impl fmt::Display for ShorthandAttribute {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{{{}}}", self.reference.to_string())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct PropertyBoundAttribute {
  pub id: String,
  #[serde(rename = "bindingName")]
  pub binding_name: String,
  pub name: String,
  pub range: Range,
  pub value: Option<AttributeValue>,
}

impl fmt::Display for PropertyBoundAttribute {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{}:{}", self.name, self.binding_name)?;
    if self.value == None {
      Ok(())
    } else {
      write!(f, "={}", self.value.as_ref().unwrap().to_string())
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct KeyValueAttribute {
  pub id: String,
  pub name: String,
  pub range: Range,
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
  DyanmicString(AttributeDynamicStringValue),
  String(AttributeStringValue),
  Slot(AttributeSlotValue),
}

impl fmt::Display for AttributeValue {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match &self {
      AttributeValue::String(value) => write!(f, "{}", value.to_string()),
      AttributeValue::Slot(value) => write!(f, "{{{}}}", value.script.to_string()),
      AttributeValue::DyanmicString(script) => write!(f, "{{{}}}", script.to_string()),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleElement {
  pub id: String,
  pub raws: ElementRaws,
  pub attributes: Vec<Attribute>,
  pub sheet: css_ast::Sheet,
  pub range: Range,
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
  pub id: String,
  pub range: Range,
  pub children: Vec<Node>,
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
    _ => None,
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
  if element.tag_name.contains(".") {
    element.tag_name[..element.tag_name.find(".").unwrap()].to_string()
  } else {
    element.tag_name.to_string()
  }
}

pub fn get_tag_namespace<'a>(element: &'a Element) -> Option<String> {
  if element.tag_name.contains(".") {
    Some(element.tag_name[(element.tag_name.find(".").unwrap() + 1)..].to_string())
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
        if has_attribute("component", element) {
          parts.push(element);
        }
      }
    }
  }

  parts
}

pub fn get_part_by_id<'a>(id: &String, root_expr: &'a Node) -> Option<&'a Element> {
  get_parts(root_expr)
    .iter()
    .find(|element| get_attribute_value("as", element) == Some(id))
    .map(|element| *element)
}

pub fn get_import_by_id<'a>(id: &String, root_expr: &'a Node) -> Option<&'a Element> {
  for import in get_imports(root_expr).iter() {
    if get_attribute_value("as", import) == Some(id) {
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

pub fn has_attribute<'a, 'b>(name: &'b str, element: &'a Element) -> bool {
  match get_attribute(name, element) {
    Some(attr) => true,
    None => false,
  }
}

pub fn get_import_ids<'a>(root_expr: &'a Node) -> Vec<&'a String> {
  let mut ids = vec![];
  for import in get_imports(root_expr) {
    if let Some(id) = get_attribute_value("as", &import) {
      ids.push(id);
    }
  }
  ids
}

pub fn get_import_identifier<'a>(import: &'a Element) -> Option<&'a String> {
  if let Some(id) = get_attribute_value("as", &import) {
    return Some(id);
  }
  if let Some(src) = get_attribute_value("src", &import) {
    return Some(src);
  }
  return None;
}

pub fn get_import_by_identifier<'a>(id: &String, root_expr: &'a Node) -> Option<&'a Element> {
  for import in get_imports(root_expr) {
    if get_attribute_value("as", &import) == Some(id)
      || get_attribute_value("src", &import) == Some(id)
    {
      return Some(import);
    }
  }
  return None;
}

pub fn get_part_ids<'a>(root_expr: &'a Node) -> Vec<&'a String> {
  let mut ids = vec![];

  // DEPRECATED
  for part in get_parts(root_expr) {
    if let Some(id) = get_attribute_value("as", &part) {
      ids.push(id);
    }
  }
  ids
}
