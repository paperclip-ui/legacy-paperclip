use super::ast::{Location};

pub enum Notice<'a> {
  Warning(Info<'a>),
  Error(Info<'a>)
}

pub struct Info<'a> {
  source: &'a Location,
  message: String,
}