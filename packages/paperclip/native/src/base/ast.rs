use super::string_scanner::U16Position;
use serde::Serialize;
use std::fmt;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Range {
  pub start: U16Position,
  pub end: U16Position,
}

impl Range {
  pub fn new(start: U16Position, end: U16Position) -> Range {
    Range { start, end }
  }
  pub fn nil() -> Range {
    Range::new(U16Position::new(0, 0, 0), U16Position::new(0, 0, 0))
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct BasicRaws {
  pub before: String,
  pub after: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ExprTextSource {
  pub uri: String,
  pub range: Range,
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
  pub fn new(uri: String, range: Range) -> ExprTextSource {
    ExprTextSource { uri, range }
  }
  pub fn virt(uri: String) -> ExprTextSource {
    ExprTextSource::new(
      uri,
      Range::new(U16Position::new(0, 0, 0), U16Position::new(0, 0, 0)),
    )
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
