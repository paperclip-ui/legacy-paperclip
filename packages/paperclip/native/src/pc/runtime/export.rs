use crate::css::runtime::export as css_export;
use std::collections::HashSet;
use serde::Serialize;

#[derive(Debug, PartialEq, Clone, Serialize)]
pub struct Exports {
  pub style: css_export::Exports,
  pub components: HashSet<String>
}
