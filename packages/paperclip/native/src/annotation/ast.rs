use crate::base::ast as base_ast;
use crate::js::ast as js_ast;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Annotation {
  pub properties: Vec<AnnotationProperty>,
  pub location: base_ast::Location,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum AnnotationProperty {
  Declaration(Declaration),
  Text(Text),
}

// @property jsValue
// @property { key: "value" }
// @pane: { key: }
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Declaration {
  pub name: String,
  pub value: js_ast::Expression,
  pub location: base_ast::Location,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Text {
  pub value: String,
  pub location: base_ast::Location,
}
