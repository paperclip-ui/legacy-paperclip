#[derive(Debug)]
pub struct Position {
  pub u8_pos: usize,
  pub u16_pos: usize,
  pub u16_line: usize,
  pub u16_column: usize,
}

pub enum Char<'a> {
  Byte(u8),
  Cluster(&'a [u8]),
}

#[derive(Clone)]
pub struct StringScanner<'a> {
  pub source: &'a [u8],
  pub pos: usize,
  pub u16_pos: usize,
  pub u16_line: usize,
  pub u16_column: usize,
}

#[derive(Debug)]
pub enum StringScannerError {
  EOF,
}

impl<'a> StringScanner<'a> {
  pub fn eat_whitespace(&mut self) -> Option<&'a [u8]> {
    if self.is_eof() {
      return None;
    }
    let is_whitepace = |c| -> bool { matches!(c, b' ' | b'\t' | b'\r' | b'\n') };
    let start = self.pos;

    while !self.is_eof() && is_whitepace(self.curr_byte().unwrap()) {
      self.forward(1);
    }
    Some(&self.source[start..self.pos])
  }

  // pub fn clone(&self) -> StringScanner {
  //   StringScanner::new_from_bytes(&self.source, &self.get_pos())
  // }

  pub fn starts_with(&mut self, pattern: &[u8]) -> bool {
    self.source[self.pos..].starts_with(pattern)
  }

  pub fn get_pos(&self) -> Position {
    Position {
      u8_pos: self.pos,
      u16_pos: self.u16_pos,
      u16_line: 0,
      u16_column: 0,
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
      u16_column: 0,
    }
  }
  pub fn new_from_bytes(source: &'a [u8], pos: &Position) -> StringScanner<'a> {
    StringScanner {
      source: source,
      pos: 0,
      u16_pos: 0,
      u16_line: 0,
      u16_column: 0,
    }
  }
  pub fn forward(&mut self, pos: usize) {
    self.pos += pos;
    self.u16_pos += pos;
  }
  pub fn next_char(&mut self) -> Result<Char<'a>, StringScannerError> {
    let c = self.curr_byte()?;
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
      Ok(Char::Byte(c))
    } else {
      let utf8_pos = self.u16_pos;
      let buffer = &self.source[self.pos..(self.pos + len)];
      self.forward(len);
      self.u16_pos = utf8_pos + utf8_step;
      Ok(Char::Cluster(buffer))
    }
  }
  pub fn curr_byte(&self) -> Result<u8, StringScannerError> {
    if self.pos < self.source.len() {
      Ok(self.source[self.pos])
    } else {
      Err(StringScannerError::EOF)
    }
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

  pub fn since(&mut self, start: usize) -> &'a str {
    std::str::from_utf8(&self.source[start..self.pos]).unwrap()
  }

  pub fn scan<FF>(&mut self, test: FF) -> Result<(), StringScannerError>
  where
    FF: Fn(u8) -> bool,
  {
    while !self.is_eof() {
      let pos = self.get_pos();
      let c = self.next_char()?;

      match c {
        Char::Byte(b) => {
          if !test(b) {
            self.set_pos(&pos);
            break;
          }
        }
        _ => {}
      }
    }
    Ok(())
  }
}
