use crate::base::parser::ParseError;
use crate::base::runtime::RuntimeError;
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph, GraphError};
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "errorKind")]
pub enum EngineError {
  Graph(GraphError),
  Runtime(RuntimeError),
}
