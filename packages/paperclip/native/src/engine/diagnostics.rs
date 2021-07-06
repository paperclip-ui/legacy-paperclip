use super::errors::EngineError;
use crate::pc::runtime::lint::LintWarning;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "diagnosticKind")]
pub enum Diagnostic {
  EngineError(EngineError),
  LintWarning(LintWarning),
}
