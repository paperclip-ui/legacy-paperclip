use crate::js::ast as js_ast;
use crate::base::ast as base_ast;

pub enum Expression {
  AtProperty(AtProperty),
  Text(Text)
}

pub struct Group {
  children: Vec<Expression>,
  location: base_ast::Location
}

// @property jsValue
// @property { key: "value" }
// @pane: { key: }
pub struct AtProperty {
  name: String
  value: js_ast::Statement;
  location: base_ast::Location;
}

pub struct Text {
  value: String;
  location: base_ast::Location;
}