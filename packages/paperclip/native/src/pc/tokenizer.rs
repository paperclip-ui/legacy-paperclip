use crate::base::parser::ParseError;
use crate::base::string_scanner::{Char, StringScanner};
use crate::base::tokenizer::{BaseTokenizer, Position};

// TODO - continuation byte
// inspiration: https://gist.github.com/tommai78101/3631ed1f136b78238e85582f08bdc618
// https://stackoverflow.com/questions/7153935/how-to-convert-utf-8-stdstring-to-utf-16-stdwstring
// https://github.com/servo/rust-cssparser/blob/5188d5e0b242431530fc37c764edf471a2c8242b/src/tokenizer.rs

#[derive(PartialEq, Debug)]
pub enum Token<'a> {
  // <
  LessThan,

  // -
  Minus,

  // *
  Star,

  // +
  Plus,

  // ~
  Squiggle,

  // @
  At,

  // >
  GreaterThan,

  // >>>
  Pierce,

  // $
  Dollar,

  // />
  SelfTagClose,

  // </
  TagClose,

  // !
  Bang,

  // {
  CurlyOpen,

  // }
  CurlyClose,

  // [
  SquareOpen,

  // ]
  SquareClose,

  // (
  ParenOpen,

  // )
  ParenClose,

  // "
  DoubleQuote,

  // '
  SingleQuote,

  // =
  Equals,

  // ==
  DoubleEquals,

  // ===
  TrippleEquals,

  // /
  Backslash,

  //
  Whitespace,

  // ...
  Spread,

  // .
  Dot,

  // #
  Hash,

  // ,
  Comma,

  // :
  Colon,

  // :
  Semicolon,

  // -->
  HtmlCommentOpen,

  // //
  LineCommentOpen,

  // -->
  HtmlCommentClose,

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

  pub fn next(&mut self) -> Result<Token<'a>, ParseError> {
    if self.is_eof() {
      return Err(ParseError::eof());
    }

    let c = self
      .scanner
      .curr_byte()
      .or_else(|_| Err(ParseError::eof()))?;

    match c {
      b'/' => {
        if self.scanner.starts_with(b"//") {
          self.scanner.forward(2);
          Ok(Token::LineCommentOpen)
        } else if self.scanner.starts_with(b"/>") {
          self.scanner.forward(2);
          Ok(Token::SelfTagClose)
        } else {
          self.scanner.forward(1);
          Ok(Token::Backslash)
        }
      }
      b'$' => {
        self.scanner.forward(1);
        Ok(Token::Dollar)
      }
      b'>' => {
        if self.scanner.starts_with(b">>>") {
          self.scanner.forward(3);
          Ok(Token::Pierce)
        } else {
          self.scanner.forward(1);
          Ok(Token::GreaterThan)
        }
      }
      b'<' => {
        if self.scanner.starts_with(b"</") {
          self.scanner.forward(2);
          Ok(Token::TagClose)
        } else if self.scanner.starts_with(b"<!--") {
          self.scanner.forward(4);
          Ok(Token::HtmlCommentOpen)
        } else {
          self.scanner.forward(1);
          Ok(Token::LessThan)
        }
      }
      b'-' => {
        if self.scanner.starts_with(b"-->") {
          self.scanner.forward(3);
          Ok(Token::HtmlCommentClose)
        } else {
          self.scanner.forward(1);
          Ok(Token::Minus)
        }
      }
      b'*' => {
        self.scanner.forward(1);
        Ok(Token::Star)
      }
      b'!' => {
        self.scanner.forward(1);
        Ok(Token::Bang)
      }
      b'+' => {
        self.scanner.forward(1);
        Ok(Token::Plus)
      }
      b'~' => {
        self.scanner.forward(1);
        Ok(Token::Squiggle)
      }
      b'@' => {
        self.scanner.forward(1);
        Ok(Token::At)
      }
      b',' => {
        self.scanner.forward(1);
        Ok(Token::Comma)
      }
      b':' => {
        self.scanner.forward(1);
        Ok(Token::Colon)
      }
      b';' => {
        self.scanner.forward(1);
        Ok(Token::Semicolon)
      }
      b'.' => {
        if self.scanner.starts_with(b"...") {
          self.scanner.forward(3);
          Ok(Token::Spread)
        } else {
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
      }
      b'{' => {
        self.scanner.forward(1);
        Ok(Token::CurlyOpen)
      }
      b'}' => {
        self.scanner.forward(1);
        Ok(Token::CurlyClose)
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
      b'(' => {
        self.scanner.forward(1);
        Ok(Token::ParenOpen)
      }
      b')' => {
        self.scanner.forward(1);
        Ok(Token::ParenClose)
      }
      b'#' => {
        self.scanner.forward(1);
        Ok(Token::Hash)
      }
      b'"' => {
        self.scanner.forward(1);
        Ok(Token::DoubleQuote)
      }
      b'\'' => {
        self.scanner.forward(1);
        Ok(Token::SingleQuote)
      }
      b'=' => {
        if self.scanner.starts_with(b"===") {
          self.scanner.forward(3);
          Ok(Token::TrippleEquals)
        } else if self.scanner.starts_with(b"==") {
          self.scanner.forward(2);
          Ok(Token::DoubleEquals)
        } else {
          self.scanner.forward(1);
          Ok(Token::Equals)
        }
      }
      b'a'..=b'z' | b'A'..=b'Z' => {
        Ok(Token::Word(self.scanner.search(|c| -> bool {
          matches!(c, b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9')
        })))
      }
      b'\r' | b'\n' => {
        self
          .scanner
          .scan(|c| -> bool { matches!(c, b'\r' | b'\n') });
        Ok(Token::Whitespace)
      }
      b' ' | b'\t' => {
        self.scanner.scan(|c| -> bool { matches!(c, b' ' | b'\t') });
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

  pub fn peek_eat_whitespace_is_eof(&mut self) -> bool {
    let start = self.scanner.get_pos();
    self.scanner.eat_whitespace();
    let eof = self.scanner.is_eof();
    self.scanner.set_pos(&start);
    eof
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
