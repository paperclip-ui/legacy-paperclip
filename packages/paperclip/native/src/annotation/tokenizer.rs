use crate::base::parser::ParseError;
use crate::base::string_scanner::{StringScanner, Position as StringScannerPosition, Char};
use crate::base::tokenizer::{BaseTokenizer, Position};

#[derive(PartialEq, Debug)]
pub enum Token<'a> {
  // @
  At,

  Word(&'a str),

  Byte(u8),
  Escape(u8),

  Cluster(&'a [u8]),
}

pub struct Tokenizer<'a> {
  pub scanner: StringScanner<'a>
}

impl<'a> Tokenizer<'a> {
  pub fn eat_whitespace(&mut self) -> Option<&'a [u8]> {
    self.scanner.eat_whitespace()
  }

  pub fn u16_pos(&self) -> usize {
    self.scanner.u16_pos
  }

  pub fn get_pos(&self) -> StringScannerPosition {
    self.scanner.get_pos()
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
    let utf16_pos = self.scanner.u16_pos;
    let token = self.next()?;
    if token == expected_token {
      return Ok(token);
    } else {
      return Err(ParseError::unexpected_token(utf16_pos));
    }
  }

  pub fn next_word_value(&mut self) -> Result<String, ParseError> {
    let pos = self.scanner.pos;
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

    let c = self.scanner.curr_byte();

    match c {
      b'\\' => {
        self.scanner.forward(1); // eat slash
        let c = self.scanner.curr_byte();
        self.scanner.forward(1); // eat escaped
        Ok(Token::Escape(c))
      }
      b'@' => {
        self.scanner.forward(1);
        Ok(Token::At)
      }
      b'a'..=b'z' | b'A'..=b'Z' => {
        Ok(Token::Word(self.scanner.search(|c| -> bool {
          matches!(c, b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9')
        })))
      }
      _ => {
        Ok(match self.scanner.next_char() {
          Char::Byte(b) => Token::Byte(b),
          Char::Cluster(chars) => Token::Cluster(chars)
        })
      },
    }
  }

  pub fn set_pos(&mut self, pos: &StringScannerPosition) {
    self.scanner.set_pos(pos);
  }

  pub fn is_eof(&mut self) -> bool {
    self.scanner.is_eof()
  }
  pub fn new(source: &'a str) -> Tokenizer {
    Tokenizer {
      scanner: StringScanner::new(source)
    }
  }
  pub fn new_from_bytes(source: &'a [u8], pos: Position) -> Tokenizer {
    Tokenizer {
      scanner: StringScanner::new_from_bytes(source, &StringScannerPosition { u8_pos: pos.u8_pos, u16_pos: pos.u16_pos, u16_line: 0, u16_column: 0 })
    }
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
  fn get_source(&self) -> &'a [u8] {
    self.scanner.source
  }
  fn get_pos(&self) -> usize {
    self.scanner.pos
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
