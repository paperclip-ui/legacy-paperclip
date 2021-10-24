use super::ast;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct RuntimeError {
  pub uri: String,
  pub location: ast::Range,
  pub message: String,
}

impl RuntimeError {
  pub fn new(message: String, uri: &String, location: &ast::Range) -> RuntimeError {
    RuntimeError {
      message: message,
      uri: uri.to_string(),
      location: location.clone(),
    }
  }
  pub fn unknown(uri: &String) -> RuntimeError {
    RuntimeError::new(
      "An unknown error has occurred.".to_string(),
      uri,
      &ast::Range::new(ast::Location::new(0, 0, 0), ast::Location::new(0, 0, 0))
    )
  }
}
