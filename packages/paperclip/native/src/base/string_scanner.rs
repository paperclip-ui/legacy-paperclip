
#[derive(Debug)]
pub struct Position {
  pub u8_pos: usize,
  pub u16_pos: usize,
  pub u16_line: usize,
  pub u16_column: usize
}

pub enum Char<'a> {
  Byte(u8),
  Cluster(&'a [u8])
}

pub struct StringScanner<'a> {
  pub source: &'a [u8],
  pub pos: usize,
  pub u16_pos: usize,
  pub u16_line: usize,
  pub u16_column: usize
}

impl<'a> StringScanner<'a> {
  pub fn eat_whitespace(&mut self) -> Option<&'a [u8]> {
    if self.is_eof() {
      return None;
    }
    let is_whitepace = |c| -> bool { matches!(c, b' ' | b'\t' | b'\r' | b'\n') };
    let start = self.pos;

    while !self.is_eof() && is_whitepace(self.curr_byte()) {
      self.forward(1);
    }
    Some(&self.source[start..self.pos])
  }

  pub fn starts_with(&mut self, pattern: &[u8]) -> bool {
    self.source[self.pos..].starts_with(pattern)
  }

  pub fn get_pos(&self) -> Position {
    Position {
      u8_pos: self.pos,
      u16_pos: self.u16_pos,
      u16_line: 0,
      u16_column: 0
    }
  }
  pub fn set_pos(&mut self, pos: &Position) {
    self.pos = pos.u8_pos;
    self.u16_pos = pos.u16_pos;
    self.u16_line = pos.u16_line;
    self.u16_column = pos.u16_column;
  }

  pub fn new(source: &'a str) -> StringScanner<'a> {
    StringScanner {
      source: source.as_bytes(),
      pos: 0,
      u16_pos: 0,
      u16_line: 0,
      u16_column: 0
    }
  }
  pub fn new_from_bytes(source: &'a [u8], pos: &Position) -> StringScanner<'a> {
    StringScanner {
      source: source,
      pos: 0,
      u16_pos: 0,
      u16_line: 0,
      u16_column: 0
    }
  }
  pub fn forward(&mut self, pos: usize) {
    self.pos += pos;
    self.u16_pos += pos;
  }
  pub fn next_char(&mut self) -> Char<'a> {
    let c = self.curr_byte();
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
      Char::Byte(c)
    } else {
      let utf8_pos = self.u16_pos;
      let buffer = &self.source[self.pos..(self.pos + len)];
      self.forward(len);
      self.u16_pos = utf8_pos + utf8_step;
      Char::Cluster(buffer)
    }
  }
  pub fn curr_byte(&self) -> u8 {
    self.source[self.pos]
  }
  pub fn is_eof(&self) -> bool {
    self.pos >= self.source.len()
  }

  pub fn search<FF>(&mut self, test: FF) -> &'a str
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
    while !self.is_eof() {
      let c = self.source[self.pos];
      self.pos += 1;
      self.u16_pos += 1;
      if !test(c) {
        self.pos -= 1;
        self.u16_pos -= 1;
        break;
      }
    }
  }
}