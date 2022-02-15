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

pub struct Tokenizer<'a> {
  pub scanner: StringScanner<'a>,
}

impl<'a> Tokenizer<'a> {
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
