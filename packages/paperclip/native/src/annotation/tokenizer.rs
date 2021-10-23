use crate::base::parser::ParseError;
use crate::base::string_scanner::{Char, Position as StringScannerPosition, StringScanner};
use crate::base::tokenizer::BaseTokenizer;

#[derive(PartialEq, Debug)]
pub enum Token<'a> {
  // @
  At,

  Word(&'a str),

  Byte(u8),
  Escape(u8),

  Cluster(&'a [u8]),
}

pub struct Tokenizer<'b, 'c> {
  pub scanner: &'b mut StringScanner<'c>,
}

impl<'b, 'c> Tokenizer<'b, 'c> {

  pub fn u16_pos(&self) -> usize {
    self.scanner.u16_pos
  }

  pub fn get_pos(&self) -> StringScannerPosition {
    self.scanner.get_pos()
  }

  pub fn peek(&mut self, steps: u8) -> Result<Token<'c>, ParseError> {
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
  pub fn peek_eat_whitespace(&mut self, steps: u8) -> Result<Token<'c>, ParseError> {
    let pos = self.get_pos();
    let mut i = 0;
    let mut result = Err(ParseError::unknown());
    while i < steps {
      self.scanner.eat_whitespace();
      result = self.next();
      i += 1;
    }
    self.set_pos(&pos);
    result
  }

  pub fn next_expect(&mut self, expected_token: Token) -> Result<Token<'c>, ParseError> {
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

  pub fn next(&mut self) -> Result<Token<'c>, ParseError> {
    if self.is_eof() {
      return Err(ParseError::eof());
    }

    let c = self
      .scanner
      .curr_byte()
      .or_else(|_| Err(ParseError::eof()))?;

    match c {
      b'\\' => {
        self.scanner.forward(1); // eat slash
        let c = self
          .scanner
          .curr_byte()
          .or_else(|_| Err(ParseError::eof()))?;
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

  pub fn set_pos(&mut self, pos: &StringScannerPosition) {
    self.scanner.set_pos(pos);
  }

  pub fn is_eof(&mut self) -> bool {
    self.scanner.is_eof()
  }
  pub fn new_from_scanner<'a>(scanner: &'b mut StringScanner<'c>) -> Tokenizer<'b, 'c> {
    Tokenizer { scanner: scanner }
  }
}

impl<'a, 'b> BaseTokenizer<'b> for Tokenizer<'a, 'b> {
  fn is_eof(&self) -> bool {
    self.scanner.is_eof()
  }
  fn skip(&mut self) -> Result<(), ParseError> {
    self.next()?;
    Ok(())
  }
  fn get_source(&self) -> &'b [u8] {
    self.scanner.source
  }
  fn get_pos(&self) -> usize {
    self.scanner.pos
  }
}
