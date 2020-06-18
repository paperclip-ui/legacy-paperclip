use super::tokenizer::*;
use crate::base::ast::Location;
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
  pub location: Location,
}

impl ParseError {
  pub fn new(kind: ParseErrorKind, message: String, start: usize, end: usize) -> ParseError {
    ParseError {
      kind,
      message,
      location: Location { start, end },
    }
  }
  pub fn unexpected_token(start: usize) -> ParseError {
    ParseError::new(
      ParseErrorKind::Unexpected,
      "Unexpected token".to_string(),
      start,
      start + 1,
    )
  }
  pub fn unexpected(message: String, start: usize, end: usize) -> ParseError {
    ParseError::new(ParseErrorKind::Unexpected, message, start, end)
  }
  pub fn unterminated(message: String, start: usize, end: usize) -> ParseError {
    ParseError::new(ParseErrorKind::Unterminated, message, start, end)
  }
  pub fn eof() -> ParseError {
    ParseError::new(ParseErrorKind::EndOfFile, "End of file".to_string(), 0, 1)
  }
  pub fn unknown() -> ParseError {
    ParseError::new(
      ParseErrorKind::Unknown,
      "An unknown error has occurred".to_string(),
      0,
      1,
    )
  }
}

pub fn get_buffer<'a, TTokenizer, FF>(tokenizer: &mut TTokenizer, until: FF) -> Result<&'a str, ParseError>
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

  Ok(std::str::from_utf8(&tokenizer.get_source()[start..end]).unwrap())
}

// pub fn expect_token(a: Token, b: Token) -> Result<(), ParseError<'a>> {
//   if a != b {
//     Err("Unexpected token")
//   } else {
//     Ok(())
//   }
// }

// pub fn expect_token2(a: Token, b: Token) -> Result<(), &'static str> {
//   if a != b {
//     Err("Unexpected token")
//   } else {
//     Ok(())
//   }
// }
