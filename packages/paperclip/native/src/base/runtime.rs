use super::ast;
use serde::{Serialize};

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct RuntimeError {
  pub uri: String,
  pub location: ast::Location,
  pub message: String
}

impl RuntimeError {
  pub fn new(message: String, uri: &String, location: &ast::Location) -> RuntimeError {
    RuntimeError {
      message: message,
      uri: uri.to_string(),
      location: location.clone()
    }
  }
  pub fn unknown(uri: &String) -> RuntimeError {
    RuntimeError::new("An unknown error has occurred.".to_string(), uri, &ast::Location {
      start: 0,
      end: 1
    })
  }
}