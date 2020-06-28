use crate::css::runtime::export as css_export;
use serde::Serialize;
use std::collections::HashSet;

#[derive(Debug, PartialEq, Clone, Serialize)]
pub struct Exports {
  pub style: css_export::Exports,
  pub components: HashSet<String>,
}
