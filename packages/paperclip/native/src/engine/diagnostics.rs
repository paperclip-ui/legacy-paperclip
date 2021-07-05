use serde::Serialize;
use super::errors::EngineError;
use crate::pc::runtime::lint::{LintWarning};

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "errorKind")]
pub enum Diagnostic {
  EngineError(EngineError),
  LintWarning(LintWarning)
}