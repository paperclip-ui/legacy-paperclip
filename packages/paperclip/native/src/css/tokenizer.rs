use crate::base::parser::ParseError;
use crate::base::string_scanner::{Char, StringScanner};
use crate::base::tokenizer::BaseTokenizer;

#[derive(PartialEq, Debug)]
pub enum Token<'a> {
  // <
  LessThan,

  // -
  Minus,

  // *
  Star,

  // *=
  StarEqual,

  // +
  Plus,

  // ~
  Squiggle,

  // ~=
  SquiggleEqual,

  // |=
  PipeEqual,

  // |=
  DollarEqual,

  // ^=
  CaretEqual,

  // @
  At,

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
  Str((&'a str, &'a str)),
  Escape(u8),

  // =
  Equals,

  // ==
  DoubleEquals,

  // ===
  TrippleEquals,

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

  // /*
  ScriptComment(&'a str),

  // //
  LineComment(&'a str),

  // div, blay
  Keyword(&'a str),

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
    let pos = self.scanner.get_u16pos();
    let token = self.next()?;
    if token == expected_token {
      return Ok(token);
    } else {
      return Err(ParseError::unexpected_token(
        pos.range_from(self.scanner.get_u16pos()),
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
          let start = self.scanner.pos;
          self
            .scanner
            .scan(|c| -> bool { !matches!(c, b'\n' | b'\r') })
            .or_else(|_| Err(ParseError::eof()))?;
          let buffer = self.scanner.since(start);

          self.scanner.forward(1);
          Ok(Token::LineComment(buffer))
        } else if self.scanner.starts_with(b"/*") {
          self.scanner.forward(2);

          let start = self.scanner.pos;

          while !self.is_eof() {
            if self.scanner.pos < self.scanner.source.len() - 2
              && self.scanner.source[self.scanner.pos] == b'*'
              && self.scanner.source[self.scanner.pos + 1] == b'/'
            {
              break;
            }
            self
              .scanner
              .next_char()
              .or_else(|_| Err(ParseError::eof()))?;
          }
          let buffer = self.scanner.since(start);

          self.scanner.forward(2);

          Ok(Token::ScriptComment(buffer))
        } else {
          self.scanner.forward(1);
          Ok(Token::Byte(b'/'))
        }
      }
      b'*' => {
        if self.scanner.starts_with(b"*=") {
          self.scanner.forward(2);
          Ok(Token::StarEqual)
        } else {
          self.scanner.forward(1);
          Ok(Token::Star)
        }
      }
      b'-' => {
        if self.scanner.starts_with(b"- ") {
          self.scanner.forward(1);
          Ok(Token::Minus)
        } else {
          Ok(Token::Keyword(self.search_keyword()))
        }
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
        if self.scanner.starts_with(b"~=") {
          self.scanner.forward(2);
          Ok(Token::SquiggleEqual)
        } else {
          self.scanner.forward(1);
          Ok(Token::Squiggle)
        }
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
        if self.scanner.starts_with(b"#") {
          self.scanner.forward(1);
          Ok(Token::BlockOpen)
        } else if self.scanner.starts_with(b"/") {
          self.scanner.forward(1);
          Ok(Token::BlockClose)
        } else {
          Ok(Token::CurlyOpen)
        }
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
      b'|' => {
        if self.scanner.starts_with(b"|=") {
          self.scanner.forward(2);
          Ok(Token::PipeEqual)
        } else {
          self.scanner.forward(1);
          Ok(Token::Byte(b'|'))
        }
      }
      b'$' => {
        if self.scanner.starts_with(b"$=") {
          self.scanner.forward(2);
          Ok(Token::DollarEqual)
        } else {
          self.scanner.forward(1);
          Ok(Token::Byte(b'$'))
        }
      }
      b'^' => {
        if self.scanner.starts_with(b"^=") {
          self.scanner.forward(2);
          Ok(Token::CaretEqual)
        } else {
          self.scanner.forward(1);
          Ok(Token::Byte(b'^'))
        }
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
        let buffer = self.scanner.search(|c| -> bool { c != b'"' });
        self.scanner.forward(1); // eat "
        Ok(Token::Str((buffer, "\"")))
      }
      b'\'' => {
        self.scanner.forward(1);
        let buffer = self.scanner.search(|c| -> bool { c != b'\'' });
        self.scanner.forward(1); // eat "
        Ok(Token::Str((buffer, "'")))
      }
      b'\\' => {
        self.scanner.forward(1);
        let c = self
          .scanner
          .curr_byte()
          .or_else(|_| Err(ParseError::eof()))?;
        self.scanner.forward(1);
        Ok(Token::Escape(c))
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
      b'a'..=b'z' | b'_' | b'A'..=b'Z' => Ok(Token::Keyword(self.search_keyword())),
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

  fn search_keyword(&mut self) -> &'a str {
    self
      .scanner
      .search(|c| -> bool { matches!(c, b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9' | b'_' | b'-') })
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
