use serde::Serialize;
use super::ast::Location;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum NoticeLevel {
  Warning,
  Error
}


#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Notice {

  // level of warning
  level: NoticeLevel,

  // source where the error is
  source_location: Location,

  // message to the user
  message: String,
}

impl Notice {
  pub fn new_warning<'a>(message: &'a str, source_location: Location) -> Notice {
    Notice {
      level: NoticeLevel::Warning,
      source_location,
      message: message.to_string()
    }
  }
}
