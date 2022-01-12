use super::tokenizer::*;
use crate::base::ast::Range;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum ParseErrorKind {
  EndOfFile,
  Unknown,
  Unexpected,
  Unterminated,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ParseError {
  pub kind: ParseErrorKind,
  pub message: String,
  pub range: Range,
}

impl ParseError {
  pub fn new(kind: ParseErrorKind, message: String, range: Range) -> ParseError {
    ParseError {
      kind,
      message,
      range,
    }
  }
  pub fn unexpected_token(range: Range) -> ParseError {
    ParseError::new(
      ParseErrorKind::Unexpected,
      "Unexpected token".to_string(),
      range,
    )
  }
  pub fn unexpected(message: String, range: Range) -> ParseError {
    ParseError::new(ParseErrorKind::Unexpected, message, range)
  }
  pub fn unterminated(message: String, range: Range) -> ParseError {
    ParseError::new(ParseErrorKind::Unterminated, message, range)
  }
  pub fn eof() -> ParseError {
    ParseError::new(
      ParseErrorKind::EndOfFile,
      "End of file".to_string(),
      Range::nil(),
    )
  }
  pub fn unknown() -> ParseError {
    ParseError::new(
      ParseErrorKind::Unknown,
      "An unknown error has occurred".to_string(),
      Range::nil(),
    )
  }
}

pub fn get_buffer<'a, TTokenizer, FF>(
  tokenizer: &mut TTokenizer,
  until: FF,
) -> Result<&'a str, ParseError>
where
  TTokenizer: BaseTokenizer<'a>,
  FF: Fn(&mut TTokenizer) -> Result<bool, ParseError>,
{
  let start = tokenizer.get_pos();
  let mut end = start;

  while !tokenizer.is_eof() {
    if !until(tokenizer)? {
      break;
    }
    tokenizer.skip()?;
    end = tokenizer.get_pos();
  }

  Ok(std::str::from_utf8(&tokenizer.get_range()[start..end]).unwrap())
}
