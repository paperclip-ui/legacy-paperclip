use serde::Serialize;
use crate::base::parser::ParseError;
use crate::base::runtime::RuntimeError;
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph, GraphError};

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "errorKind")]
pub enum EngineError {
  Graph(GraphError),
  Parser(ParseError),
  Runtime(RuntimeError),
}
