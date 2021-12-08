use crate::base::parser::ParseError;
use crate::base::string_scanner::{Char, StringScanner};
use crate::base::tokenizer::BaseTokenizer;

#[derive(PartialEq, Debug)]
pub enum Token<'a> {
  // &&
  LogicalAnd,
  LogicalOr,

  // <
  LessThan,

  // -
  Minus,

  // !
  Bang,

  // {
  CurlyOpen,

  // }
  CurlyClose,

  // (
  ParenOpen,

  // )
  ParenClose,

  // [
  SquareOpen,

  // ]
  SquareClose,

  // "
  DoubleQuote,

  // '
  SingleQuote,

  //
  Whitespace,

  // .
  Dot,

  // ,
  Comma,

  // :
  Colon,

  // div, blay
  Word(&'a str),

  // 5, .5, 0.5
  Number(&'a str),

  Byte(u8),
  Cluster(&'a [u8]),
}

pub struct Tokenizer<'a> {
  pub scanner: StringScanner<'a>,
}

impl<'a> Tokenizer<'a> {
  pub fn peek(&mut self, steps: u8) -> Result<Token<'a>, ParseError> {
    let pos = self.scanner.get_pos();
    let mut i = 0;
    let mut result = Err(ParseError::unknown());
    while i < steps {
      result = self.next();
      i += 1;
    }
    self.scanner.set_pos(&pos);
    result
  }
  pub fn peek_eat_whitespace(&mut self, steps: u8) -> Result<Token<'a>, ParseError> {
    let pos = self.scanner.get_pos();
    let mut i = 0;
    let mut result = Err(ParseError::unknown());
    while i < steps {
      self.scanner.eat_whitespace();
      result = self.next();
      i += 1;
    }
    self.scanner.set_pos(&pos);
    result
  }

  pub fn next_expect(&mut self, expected_token: Token) -> Result<Token<'a>, ParseError> {
    let utf16_pos = self.scanner.get_u16pos();
    let token = self.next()?;
    if token == expected_token {
      return Ok(token);
    } else {
      return Err(ParseError::unexpected_token(
        utf16_pos.range_from(self.scanner.get_u16pos()),
      ));
    }
  }

  pub fn next_word_value(&mut self) -> Result<String, ParseError> {
    let pos = self.scanner.get_u16pos();
    if let Token::Word(value) = self.next()? {
      Ok(value.to_string())
    } else {
      Err(ParseError::unexpected_token(
        pos.range_from(self.scanner.get_u16pos()),
      ))
    }
  }

  pub fn next(&mut self) -> Result<Token<'a>, ParseError> {
    if self.is_eof() {
      return Err(ParseError::eof());
    }

    let c = self
      .scanner
      .curr_byte()
      .or_else(|_| Err(ParseError::eof()))?;

    match c {
      b'&' => {
        if self.scanner.starts_with(b"&&") {
          self.scanner.forward(2);
          Ok(Token::LogicalAnd)
        } else {
          self.scanner.forward(1);
          Ok(Token::Byte(c))
        }
      }
      b'|' => {
        if self.scanner.starts_with(b"||") {
          self.scanner.forward(2);
          Ok(Token::LogicalOr)
        } else {
          self.scanner.forward(1);
          Ok(Token::Byte(c))
        }
      }
      b'<' => {
        self.scanner.forward(1);
        Ok(Token::LessThan)
      }
      b'-' => {
        self.scanner.forward(1);
        Ok(Token::Minus)
      }
      b'!' => {
        self.scanner.forward(1);
        Ok(Token::Bang)
      }
      b',' => {
        self.scanner.forward(1);
        Ok(Token::Comma)
      }
      b':' => {
        self.scanner.forward(1);
        Ok(Token::Colon)
      }
      b'.' => {
        self.scanner.forward(1);
        let is_number = |c| matches!(c, b'0'..=b'9');

        if !self.is_eof() && is_number(self.scanner.curr_byte().unwrap()) {
          let start = self.scanner.pos - 1;
          self.scanner.scan(is_number);
          Ok(Token::Number(self.scanner.since(start)))
        } else {
          Ok(Token::Dot)
        }
      }
      b'{' => {
        self.scanner.forward(1);
        Ok(Token::CurlyOpen)
      }
      b'}' => {
        self.scanner.forward(1);
        Ok(Token::CurlyClose)
      }
      b'(' => {
        self.scanner.forward(1);
        Ok(Token::ParenOpen)
      }
      b')' => {
        self.scanner.forward(1);
        Ok(Token::ParenClose)
      }
      b'0'..=b'9' => {
        let start = self.scanner.pos;
        let is_number = |c| matches!(c, b'0'..=b'9');
        self.scanner.scan(is_number);
        if self.scanner.starts_with(b".") {
          self.scanner.forward(1);
          self.scanner.scan(is_number);
        }

        Ok(Token::Number(self.scanner.since(start)))
      }
      b'[' => {
        self.scanner.forward(1);
        Ok(Token::SquareOpen)
      }
      b']' => {
        self.scanner.forward(1);
        Ok(Token::SquareClose)
      }
      b'"' => {
        self.scanner.forward(1);
        Ok(Token::DoubleQuote)
      }
      b'\'' => {
        self.scanner.forward(1);
        Ok(Token::SingleQuote)
      }
      b'a'..=b'z' | b'A'..=b'Z' => {
        Ok(Token::Word(self.scanner.search(|c| -> bool {
          matches!(c, b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9')
        })))
      }
      b' ' | b'\t' | b'\r' | b'\n' => {
        self
          .scanner
          .scan(|c| -> bool { matches!(c, b' ' | b'\t' | b'\r' | b'\n') });
        Ok(Token::Whitespace)
      }
      _ => {
        let c = self
          .scanner
          .next_char()
          .or_else(|_| Err(ParseError::eof()))?;

        Ok(match c {
          Char::Byte(b) => Token::Byte(b),
          Char::Cluster(chars) => Token::Cluster(chars),
        })
      }
    }
  }

  pub fn new_from_scanner(scanner: StringScanner<'a>) -> Tokenizer<'a> {
    Tokenizer { scanner: scanner }
  }
}

impl<'a> BaseTokenizer<'a> for Tokenizer<'a> {
  fn is_eof(&self) -> bool {
    self.scanner.is_eof()
  }
  fn skip(&mut self) -> Result<(), ParseError> {
    self.next()?;
    Ok(())
  }
  fn get_range(&self) -> &'a [u8] {
    self.scanner.source
  }
  fn get_pos(&self) -> usize {
    self.scanner.pos
  }
}
