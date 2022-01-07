use crate::annotation::ast as annotation_ast;
use crate::base::ast::{BasicRaws, Range};
use crate::core::ast::{walk_exprs, Expr, ExprVisitor};
use crate::css::ast as css_ast;
use crate::script::ast as script_ast;
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

impl Element {
  fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    walk_exprs(&self.children, visitor);
    walk_exprs(&self.attributes, visitor);
  }
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
pub enum Expression<'a> {
  Node(&'a Node),
  Attribute(&'a Attribute),
  CSS(css_ast::Expression<'a>),
  Script(&'a script_ast::Expression),
}

impl<'a> Expression<'a> {
  pub fn get_range(&'a self) -> &'a Range {
    match self {
      Expression::Node(node) => node.get_range(),
      Expression::Attribute(attr) => attr.get_range(),
      Expression::CSS(css) => css.get_range(),
      Expression::Script(js) => js.get_range(),
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
  pub fn get_children<'a>(&'a self) -> Option<&'a Vec<Node>> {
    match &self {
      Node::Element(root) => Some(&root.children),
      Node::Fragment(root) => Some(&root.children),
      _ => None,
    }
  }
  pub fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    match self {
      Node::Slot(slot) => {
        slot.walk_inside(visitor);
      }
      Node::StyleElement(style) => {
        style.walk_inside(visitor);
      }
      Node::Fragment(fragment) => {
        fragment.walk_inside(visitor);
      }
      Node::Element(element) => {
        element.walk_inside(visitor);
      }
      Node::Comment(_) | Node::Text(_) => {}
    }
  }
}

impl Expr for Node {
  fn walk<'a>(&'a self, visitor: &mut dyn ExprVisitor<'a>) {
    visitor.visit_node(self);
    if !visitor.should_continue() {
      return;
    }
  
    self.walk_inside(visitor);
  }
  fn get_id<'a>(&'a self) -> &'a String {
    self.get_id()
  }
  fn wrap<'a>(&'a self) -> Expression<'a> {
    return Expression::Node(self);
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Slot {
  pub id: String,
  // !{slot}
  #[serde(rename = "omitFromCompilation")]
  pub omit_from_compilation: bool,
  pub script: script_ast::Expression,
  pub range: Range,
  pub raws: BasicRaws,
}

impl Slot {
  fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    self.script.walk(visitor);
  }
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
  pub script: script_ast::Expression,
  pub range: Range,
}

impl AttributeSlotValue {
  pub fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    self.script.walk(visitor);
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct AttributeDynamicStringValue {
  pub id: String,
  pub values: Vec<AttributeDynamicStringPart>,
  pub range: Range,
}

impl AttributeDynamicStringValue {
  pub fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    for value in &self.values {
      value.walk(visitor);
      if !visitor.should_continue() {
        break;
      }
    }
  }
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
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "partKind")]
pub enum AttributeDynamicStringPart {
  Literal(AttributeDynamicStringLiteral),
  ClassNamePierce(AttributeDynamicStringClassNamePierce),
  Slot(script_ast::Expression),
}

impl AttributeDynamicStringPart {
  pub fn get_id(&self) -> &String {
    match self {
      AttributeDynamicStringPart::ClassNamePierce(expr) => &expr.id,
      AttributeDynamicStringPart::Literal(expr) => &expr.id,
      AttributeDynamicStringPart::Slot(expr) => &expr.get_id(),
    }
  }
  pub fn walk<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    match self {
      AttributeDynamicStringPart::ClassNamePierce(_) | AttributeDynamicStringPart::Literal(_) => {

      },
      AttributeDynamicStringPart::Slot(slot) => {
        slot.walk(visitor);
      }
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

impl Attribute {
  pub fn get_range(&self) -> &Range {
    match self {
      Attribute::ShorthandAttribute(expr) => &expr.range,
      Attribute::SpreadAttribute(expr) => &expr.range,
      Attribute::KeyValueAttribute(expr) => &expr.range,
      Attribute::PropertyBoundAttribute(expr) => &expr.range,
    }
  }
}

impl Expr for Attribute {
  fn get_id<'a>(&'a self) -> &'a String {
    match self {
      Attribute::ShorthandAttribute(expr) => &expr.id,
      Attribute::SpreadAttribute(expr) => &expr.id,
      Attribute::KeyValueAttribute(expr) => &expr.id,
      Attribute::PropertyBoundAttribute(expr) => &expr.id,
    }
  }

  fn walk<'a>(&'a self, visitor: &mut dyn ExprVisitor<'a>) {
    visitor.visit_attr(self);
    if !visitor.should_continue() {
      return;
    }
    match self {
      Attribute::KeyValueAttribute(kv) => kv.walk_inside(visitor),
      Attribute::ShorthandAttribute(kv) => kv.walk_inside(visitor),
      Attribute::PropertyBoundAttribute(kv) => kv.walk_inside(visitor),
      Attribute::SpreadAttribute(kv) => kv.walk_inside(visitor)
    }
  }
  fn wrap<'a>(&'a self) -> Expression<'a> {
    return Expression::Attribute(self);
  }
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
  pub script: script_ast::Expression,
  pub range: Range,
}

impl SpreadAttribute {
  pub fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    self.script.walk(visitor);
  }
}

impl fmt::Display for SpreadAttribute {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{{...{}}}", self.script.to_string())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ShorthandAttribute {
  pub id: String,
  pub reference: script_ast::Expression,
  pub range: Range,
}

impl ShorthandAttribute {
  pub fn get_name(&self) -> Result<&String, &'static str> {
    match &self.reference {
      script_ast::Expression::Reference(reference) => {
        if reference.path.len() == 1 {
          Ok(&reference.path[0].name)
        } else {
          Err("Unexpected Expression")
        }
      }
      _ => Err("Unexpected Expression"),
    }
  }
  pub fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    self.reference.walk(visitor);
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

impl PropertyBoundAttribute {
  pub fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    if let Some(value) = &self.value {
      value.walk(visitor);
    }
  }
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

impl KeyValueAttribute {
  pub fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    if let Some(value) = &self.value {
      value.walk(visitor);
    }
  }
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

impl AttributeValue {
  pub fn get_id(&self) -> &String {
    match self {
      AttributeValue::DyanmicString(value) => &value.id,
      AttributeValue::String(value) => &value.id,
      AttributeValue::Slot(value) => &value.id,
    }
  }
  pub fn walk<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    match self {
      AttributeValue::DyanmicString(ds) => ds.walk_inside(visitor),
      AttributeValue::Slot(ds) => ds.walk_inside(visitor),
      AttributeValue::String(_ds) => { }
    }
  }
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

impl StyleElement {
  fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    self.sheet.walk(visitor);
  }
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

impl Fragment {
  fn walk_inside<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    walk_exprs(&self.children, visitor);
  }
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

pub fn get_imports<'a>(root_expr: &'a Node) -> Vec<&'a Element> {
  let mut imports = vec![];

  let children = root_expr.get_children();

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

  let children = root_expr.get_children();

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
