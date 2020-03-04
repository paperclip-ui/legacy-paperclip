use std::fmt;
use serde::{Serialize};

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Location {
  pub start: usize,
  pub end: usize,
}

impl Location {
  pub fn new(start: usize, end: usize) -> Location {
    Location {
      start,
      end
    }
  }
}

impl fmt::Display for Location {
  fn fmt(&self, _f: &mut fmt::Formatter) -> fmt::Result {
    Ok(())
  }
}


// TODO - change to trait
#[derive(Debug, PartialEq, Serialize)]
pub struct Expression<TItem> {
  // TODO - location: Location
  pub item: TItem
}