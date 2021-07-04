use super::ast::Location;
use crate::base::ast::ExprSource;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum NoticeLevel {
  Warning,
  Error,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Notice {
  // level of warning
  level: NoticeLevel,

  // source where the error is
  #[serde(rename = "sourceId")]
  source_id: String,

  #[serde(rename = "textSource")]
  text_source: Option<ExprSource>,

  // message to the user
  message: String,
}

impl Notice {
  pub fn new_warning<'a>(
    message: &'a str,
    source_id: String,
    source: Option<ExprSource>,
  ) -> Notice {
    Notice {
      level: NoticeLevel::Warning,
      source_id,
      text_source: source.and_then(|src| Some(src.clone())),
      message: message.to_string(),
    }
  }
}
