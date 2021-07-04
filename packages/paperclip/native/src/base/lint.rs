use super::ast::Location;
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
  source_id: String,

  // message to the user
  message: String,
}

impl Notice {
  pub fn new_warning<'a>(message: &'a str, source_id: String) -> Notice {
    Notice {
      level: NoticeLevel::Warning,
      source_id,
      message: message.to_string(),
    }
  }
}
