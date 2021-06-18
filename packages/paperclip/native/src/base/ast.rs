use serde::Serialize;
use std::fmt;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Location {
  pub start: usize,
  pub end: usize,
}

// impl Eq for Location {
//   fn eq(&self, other: &Self) -> bool {
//     self.start == other.start && self.end == other.end
//   }
// }

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct BasicRaws {
  pub before: String,
  pub after: String,
}

impl Location {
  pub fn new(start: usize, end: usize) -> Location {
    Location { start, end }
  }
}

impl fmt::Display for Location {
  fn fmt(&self, _f: &mut fmt::Formatter) -> fmt::Result {
    Ok(())
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ExprSource {
  pub uri: String,
  pub location: Location,
}

impl ExprSource {
  pub fn new(uri: String, location: Location) -> ExprSource {
    ExprSource { uri, location }
  }
  pub fn virt(uri: String) -> ExprSource {
    ExprSource::new(uri, Location::new(0, 0))
  }
}

// impl Eq for ExprSource {
//   fn eq(&self, other: &Self) -> bool {
//     self.uri == other.uri && self.location == self.location
//   }
// }
// TODO - change to trait
#[derive(Debug, PartialEq, Serialize)]
pub struct Expression<TItem> {
  // TODO - location: Location
  pub item: TItem,
}
