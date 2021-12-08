use super::ast;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct RuntimeError {
  pub uri: String,
  pub range: ast::Range,
  pub message: String,
}

impl RuntimeError {
  pub fn new(message: String, uri: &String, range: &ast::Range) -> RuntimeError {
    RuntimeError {
      message: message,
      uri: uri.to_string(),
      range: range.clone(),
    }
  }
  pub fn unknown(uri: &String) -> RuntimeError {
    RuntimeError::new(
      "An unknown error has occurred.".to_string(),
      uri,
      &ast::Range::nil(),
    )
  }
}
