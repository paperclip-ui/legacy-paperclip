use crate::base::parser::ParseError;
use crate::base::tokenizer::{BaseTokenizer, Position};

#[derive(PartialEq, Debug)]
pub enum Token<'a> {
  // @
  At,

  // /*
  CommentOpen,

  // */
  CommentOpen,

  // <!--
  HtmlCommentOpen,

  // //
  LineCommentOpen,

  // -->
  HtmlCommentClose,

  Word(&'a str),

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
    return Token::At;
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
