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
pub struct ExprTextSource {
  pub uri: String,
  pub location: Location,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ExprSource {
  // source where the error is. Might not exist
  #[serde(rename = "sourceId")]
  pub id: String,

  // This may not exist if we're dealing with just the AST
  #[serde(rename = "textSource")]
  pub text_source: Option<ExprTextSource>,
}

impl ExprSource {
  pub fn new<'a>(id: &'a str, text_source: Option<&ExprTextSource>) -> ExprSource {
    ExprSource {
      id: id.to_string(),
      text_source: text_source.and_then(|source| Some(source.clone())),
    }
  }
}

impl ExprTextSource {
  pub fn new(uri: String, location: Location) -> ExprTextSource {
    ExprTextSource { uri, location }
  }
  pub fn virt(uri: String) -> ExprTextSource {
    ExprTextSource::new(uri, Location::new(0, 0))
  }
}

// impl Eq for ExprTextSource {
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
