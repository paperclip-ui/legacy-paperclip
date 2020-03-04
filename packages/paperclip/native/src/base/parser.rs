use super::tokenizer::*;
use serde::{Serialize};
use crate::base::ast::{Location};

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
      location: Location { start, end }
    }
  }
  pub fn unexpected_token(start: usize) -> ParseError {
    ParseError::new(ParseErrorKind::Unexpected, "Unexpected token".to_string(), start, start + 1)
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
    ParseError::new(ParseErrorKind::Unknown, "An unknown error has occurred".to_string(), 0, 1)
  }
}

pub fn get_buffer<'a, FF>(tokenizer: &mut Tokenizer<'a>, until: FF) -> Result<&'a str, ParseError> where
FF: Fn(&mut Tokenizer) -> Result<bool, ParseError> {
  let start = tokenizer.pos;
  let mut end = start;

  while !tokenizer.is_eof() {
    if !until(tokenizer)? {
      break;
    }
    tokenizer.next()?;
    end = tokenizer.pos;
  }

  Ok(std::str::from_utf8(&tokenizer.source[start..end]).unwrap())
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