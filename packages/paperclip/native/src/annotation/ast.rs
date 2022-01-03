use crate::base::ast as base_ast;
use crate::script::ast as script_ast;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Annotation {
  pub properties: Vec<AnnotationProperty>,
  pub range: base_ast::Range,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
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
  pub value: script_ast::Expression,
  pub raws: base_ast::BasicRaws,
  pub range: base_ast::Range,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Text {
  pub raws: base_ast::BasicRaws,
  pub value: String,
  pub range: base_ast::Range,
}
