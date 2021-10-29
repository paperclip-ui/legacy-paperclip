use super::parser::ParseError;

pub trait BaseToken {}

pub trait BaseTokenizer<'a> {
  // Static method signature; `Self` refers to the implementor type.
  fn is_eof(&self) -> bool;
  fn skip(&mut self) -> Result<(), ParseError>;
  fn get_pos(&self) -> usize;
  fn get_range(&self) -> &'a [u8];
}

#[derive(Debug)]
pub struct Position {
  pub u8_pos: usize,
  pub u16_pos: usize,
}

#[derive(PartialEq, Debug)]
pub enum Token<'a> {
  Whitespace,
  Cluster(&'a [u8]),
}

pub struct Tokenizer<'a> {
  pub source: &'a [u8],
  pub pos: usize,
  pub utf16_pos: usize,
}

impl<'a> Tokenizer<'a> {
  pub fn next(&mut self) -> Option<Token> {
    let c = self.source[self.pos];

    match c {
      b' ' | b'\t' | b'\r' | b'\n' => {
        self.scan(|c| -> bool { matches!(c, b' ' | b'\t' | b'\r' | b'\n') });
        Some(Token::Whitespace)
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

        if len > 0 {
          let start = self.pos;
          let utf16_pos = self.utf16_pos;
          let buffer = &self.source[self.pos..(self.pos + len)];
          self.forward(len);
          self.utf16_pos = utf16_pos + utf8_step;
          Some(Token::Cluster(buffer))
        } else {
          None
        }
      }
    }
  }
  fn forward(&mut self, pos: usize) {
    self.pos += pos;
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
    while self.pos < self.source.len() {
      let c = self.source[self.pos];
      self.pos += 1;
      if !test(c) {
        self.pos -= 1;
        break;
      }
    }
  }
  pub fn new(source: &'a str) -> Tokenizer {
    Tokenizer {
      source: source.as_bytes(),
      pos: 0,
      utf16_pos: 0,
    }
  }
}
