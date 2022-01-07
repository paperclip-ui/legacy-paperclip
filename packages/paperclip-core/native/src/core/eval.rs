use super::vfs::VirtualFileSystem;
use crate::base::parser::ParseError;
// use crate::css::runtime::exports as css_exports;
// use crate::pc::runtime::exports as pc_exports;
use crate::css::runtime::evaluator as css_eval;
use crate::pc::runtime::evaluator as pc_eval;
use serde::Serialize;
use std::collections::{BTreeMap, HashSet};

// #[derive(Debug, PartialEq, Clone, Serialize)]
// pub enum DependencyExport {
//   CSS(css_exports::Exports),
//   PC(css_exports::Exports)
// }

#[derive(Debug, PartialEq, Clone, Serialize)]
#[serde(tag = "kind")]
pub enum DependencyEvalInfo {
  CSS(css_eval::EvalInfo),
  PC(pc_eval::EvalInfo),
}
