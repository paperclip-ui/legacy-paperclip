use crate::js::ast as js_ast;
use crate::base::ast as base_ast;


pub struct Annotation {
  pub properties: Vec<AnnotationProperty>,
  pub location: base_ast::Location
}

pub enum AnnotationProperty {
  Declaration(Declaration),
  Text(Text)
}

// @property jsValue
// @property { key: "value" }
// @pane: { key: }
pub struct Declaration {
  pub name: String,
  pub value: js_ast::Statement,
  pub location: base_ast::Location
}

pub struct Text {
  pub value: String,
  pub location: base_ast::Location
}