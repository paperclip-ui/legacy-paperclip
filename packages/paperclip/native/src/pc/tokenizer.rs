use crate::base::parser::ParseError;
use crate::base::tokenizer::{BaseTokenizer,Position};

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

  // />
  SelfTagClose,

  // </
  TagClose,

  // !
  Bang,

  // {#
  BlockOpen,

  // {/
  BlockClose,

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

  Continuation(&'a str),

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
  pub source: &'a [u8],
  pub pos: usize,
  pub utf16_pos: usize,
}

impl<'a> Tokenizer<'a> {
  pub fn eat_whitespace(&mut self) {
    if self.is_eof() {
      return;
    }
    let is_whitepace = |c| -> bool { matches!(c, b' ' | b'\t' | b'\r' | b'\n') };
    while !self.is_eof() && is_whitepace(self.curr_byte().unwrap()) {
      self.pos += 1;
      self.utf16_pos += 1;
    }
  }

  pub fn utf16_pos() {}

  pub fn get_pos(&self) -> Position {
    Position {
      u8_pos: self.pos,
      u16_pos: self.utf16_pos,
    }
  }

  pub fn peek(&mut self, steps: u8) -> Result<Token<'a>, ParseError> {
    let pos = self.get_pos();
    let mut i = 0;
    let mut result = Err(ParseError::unknown());
    while i < steps {
      result = self.next();
      i += 1;
    }
    self.set_pos(&pos);
    result
  }
  pub fn peek_eat_whitespace(&mut self, steps: u8) -> Result<Token<'a>, ParseError> {
    let pos = self.get_pos();
    let mut i = 0;
    let mut result = Err(ParseError::unknown());
    while i < steps {
      self.eat_whitespace();
      result = self.next();
      i += 1;
    }
    self.set_pos(&pos);
    result
  }

  pub fn next_expect(&mut self, expected_token: Token) -> Result<Token<'a>, ParseError> {
    let utf16_pos = self.utf16_pos;
    let token = self.next()?;
    if token == expected_token {
      return Ok(token);
    } else {
      return Err(ParseError::unexpected_token(utf16_pos));
    }
  }

  pub fn next_word_value(&mut self) -> Result<String, ParseError> {
    let pos = self.pos;
    if let Token::Word(value) = self.next()? {
      Ok(value.to_string())
    } else {
      Err(ParseError::unexpected_token(pos))
    }
  }

  pub fn next(&mut self) -> Result<Token<'a>, ParseError> {
    if self.is_eof() {
      return Err(ParseError::eof());
    }

    let mut c = self.curr_byte()?;

    match c {
      b'/' => {
        if self.starts_with(b"//") {
          self.forward(2);
          Ok(Token::LineCommentOpen)
        } else if self.starts_with(b"/>") {
          self.forward(2);
          Ok(Token::SelfTagClose)
        } else {
          self.forward(1);
          Ok(Token::Backslash)
        }
      }
      b'>' => {
        if self.starts_with(b">>>") {
          self.forward(3);
          Ok(Token::Pierce)
        } else {
          self.forward(1);
          Ok(Token::GreaterThan)
        }
      }
      b'<' => {
        if self.starts_with(b"</") {
          self.forward(2);
          Ok(Token::TagClose)
        } else if self.starts_with(b"<!--") {
          self.forward(4);
          Ok(Token::HtmlCommentOpen)
        } else {
          self.forward(1);
          Ok(Token::LessThan)
        }
      }
      b'-' => {
        if self.starts_with(b"-->") {
          self.forward(3);
          Ok(Token::HtmlCommentClose)
        } else {
          self.forward(1);
          Ok(Token::Minus)
        }
      }
      b'*' => {
        self.forward(1);
        Ok(Token::Star)
      }
      b'!' => {
        self.forward(1);
        Ok(Token::Bang)
      }
      b'+' => {
        self.forward(1);
        Ok(Token::Plus)
      }
      b'~' => {
        self.forward(1);
        Ok(Token::Squiggle)
      }
      b'@' => {
        self.forward(1);
        Ok(Token::At)
      }
      b',' => {
        self.forward(1);
        Ok(Token::Comma)
      }
      b':' => {
        self.forward(1);
        Ok(Token::Colon)
      }
      b';' => {
        self.forward(1);
        Ok(Token::Semicolon)
      }
      b'.' => {
        if self.starts_with(b"...") {
          self.forward(3);
          Ok(Token::Spread)
        } else {
          self.forward(1);
          let is_number = |c| matches!(c, b'0'..=b'9');

          if !self.is_eof() && is_number(self.curr_byte().unwrap()) {
            let start = self.pos - 1;
            self.scan(is_number);
            Ok(Token::Number(self.since(start)))
          } else {
            Ok(Token::Dot)
          }
        }
      }
      b'{' => {
        self.forward(1);
        if self.starts_with(b"#") {
          self.forward(1);
          Ok(Token::BlockOpen)
        } else if self.starts_with(b"/") {
          self.forward(1);
          Ok(Token::BlockClose)
        } else {
          Ok(Token::CurlyOpen)
        }
      }
      b'}' => {
        self.forward(1);
        Ok(Token::CurlyClose)
      }
      b'0'..=b'9' => {
        let start = self.pos;
        let is_number = |c| matches!(c, b'0'..=b'9');
        self.scan(is_number);
        if self.starts_with(b".") {
          self.forward(1);
          self.scan(is_number);
        }

        Ok(Token::Number(self.since(start)))
      }
      b'[' => {
        self.forward(1);
        Ok(Token::SquareOpen)
      }
      b']' => {
        self.forward(1);
        Ok(Token::SquareClose)
      }
      b'(' => {
        self.forward(1);
        Ok(Token::ParenOpen)
      }
      b')' => {
        self.forward(1);
        Ok(Token::ParenClose)
      }
      b'#' => {
        self.forward(1);
        Ok(Token::Hash)
      }
      b'"' => {
        self.forward(1);
        Ok(Token::DoubleQuote)
      }
      b'\'' => {
        self.forward(1);
        Ok(Token::SingleQuote)
      }
      b'=' => {
        if self.starts_with(b"===") {
          self.forward(3);
          Ok(Token::TrippleEquals)
        } else if self.starts_with(b"==") {
          self.forward(2);
          Ok(Token::DoubleEquals)
        } else {
          self.forward(1);
          Ok(Token::Equals)
        }
      }
      b'a'..=b'z' | b'A'..=b'Z' => {
        Ok(Token::Word(self.search(|c| -> bool {
          matches!(c, b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9')
        })))
      }
      b'\r' | b'\n' => {
        let pos = self.pos;
        self.scan(|c| -> bool { matches!(c, b'\r' | b'\n') });
        Ok(Token::Whitespace)
      }
      b' ' | b'\t' => {
        self.scan(|c| -> bool { matches!(c, b' ' | b'\t') });
        Ok(Token::Whitespace)
      }
      _ => {
        let mut len = 1;
        let mut utf8_step = 1;

        if c < 0x80 {
          len = 1;
        } else if c < 0xC0 {
          len = 1;
        } else if c < 0xE0 {
          len = 2;
        } else if c < 0xF0 {
          len = 3;
        } else if c < 0xF8 {
          len = 4;
          utf8_step = 2;
        }

        if len == 1 {
          self.forward(1);
          Ok(Token::Byte(c))
        } else {
          let start = self.pos;
          let utf8_pos = self.utf16_pos;
          let buffer = &self.source[self.pos..(self.pos + len)];
          self.forward(len);
          self.utf16_pos = utf8_pos + utf8_step;
          Ok(Token::Cluster(buffer))
        }
      }
    }
  }

  fn starts_with(&mut self, pattern: &[u8]) -> bool {
    self.source[self.pos..].starts_with(pattern)
  }
  fn forward(&mut self, pos: usize) {
    self.pos += pos;
    self.utf16_pos += pos;
  }
  pub fn set_pos(&mut self, pos: &Position) {
    self.pos = pos.u8_pos;
    self.utf16_pos = pos.u16_pos;
  }
  pub fn curr_byte(&mut self) -> Result<u8, ParseError> {
    if self.is_eof() {
      Err(ParseError::eof())
    } else {
      Ok(self.source[self.pos])
    }
  }
  fn search<FF>(&mut self, test: FF) -> &'a str
  where
    FF: Fn(u8) -> bool,
  {
    let start = self.pos;
    self.scan(test);
    self.since(start)
  }

  fn since(&mut self, start: usize) -> &'a str {
    std::str::from_utf8(&self.source[start..self.pos]).unwrap()
  }

  fn scan<FF>(&mut self, test: FF)
  where
    FF: Fn(u8) -> bool,
  {
    // TODO - use other tokenizer here for scanning instead
    while !self.is_eof() {
      let c = self.source[self.pos];
      self.pos += 1;
      self.utf16_pos += 1;
      if !test(c) {
        self.pos -= 1;
        self.utf16_pos -= 1;
        break;
      }
    }
  }
  pub fn is_eof(&mut self) -> bool {
    self.pos >= self.source.len()
  }
  pub fn new(source: &'a str) -> Tokenizer {
    Tokenizer {
      source: source.as_bytes(),
      pos: 0,
      utf16_pos: 0,
    }
  }
  pub fn new_from_bytes(source: &'a [u8], pos: Position) -> Tokenizer {
    Tokenizer {
      source: source,
      pos: pos.u8_pos,
      utf16_pos: pos.u16_pos,
    }
  }
}

impl<'a> BaseTokenizer<'a> for Tokenizer<'a> {
  fn is_eof(&self) -> bool {
    self.pos >= self.source.len()
  }
  fn skip(&mut self) -> Result<(), ParseError> {
    self.next()?;
    Ok(())
  }
  fn get_source(&self) -> &'a [u8] {
    self.source
  }
  fn get_pos(&self) -> usize {
    self.pos
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn can_parse_utf8_strings() {
    // let mut tokenizer = Tokenizer::new(&"🤦🏼‍♂️");
    // // println!("{}", "👩‍👩‍👦‍👦".len());
    // assert_eq!(tokenizer.utf16_pos, 0);
    // println!("{:?}", "👩‍👩‍👦‍👦".len());
    // println!("{:?}", "👩‍👩‍👦‍👦".encode_utf16().collect::<Vec<u16>>().len());
    // println!("{:?}", "🤦🏼‍♂️".encode_utf16().collect::<Vec<u16>>().len());
    // println!("{:?}", "イーブイ".encode_utf16().collect::<Vec<u16>>().len());
    // assert_eq!(tokenizer.utf16_pos, 1);
    // panic!("D");
  }

  fn scan_till_end(tokenizer: &mut Tokenizer) {
    while !tokenizer.is_eof() {
      tokenizer.next();
    }
  }
}
