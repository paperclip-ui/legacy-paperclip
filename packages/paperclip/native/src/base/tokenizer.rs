use super::parser::{ParseError};


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

  // /*
  ScriptCommentOpen,

  // */
  ScriptCommentClose,

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
}

pub struct Tokenizer<'a> {
  pub source: &'a [u8],
  pub pos: usize
}

impl<'a> Tokenizer<'a> {

  pub fn eat_whitespace(&mut self) {
    if self.is_eof() {
      return;
    }
    let is_whitepace = |c| -> bool { matches!(c, b' ' | b'\t' | b'\r' | b'\n') };
    while !self.is_eof() && is_whitepace(self.curr_char().unwrap()) {
      self.pos += 1;
    }
  }

  pub fn utf8_pos() {

  }

  pub fn peek(&mut self, steps: u8) -> Result<Token<'a>, ParseError> {
    let pos = self.pos;
    let mut i = 0;
    let mut result = Err(ParseError::unknown());
    while i < steps {
      result = self.next();
      i += 1;
    }
    self.pos = pos;
    result
  }
  pub fn peek_eat_whitespace(&mut self, steps: u8) -> Result<Token<'a>, ParseError> {
    let pos = self.pos;
    let mut i = 0;
    let mut result = Err(ParseError::unknown());
    while i < steps {
      self.eat_whitespace();
      result = self.next();
      i += 1;
    }
    self.pos = pos;
    result
  }

  pub fn next_expect(&mut self, expected_token: Token) -> Result<Token<'a>, ParseError> {
    let pos = self.pos;
    let token = self.next()?;
    if token == expected_token {
      return Ok(token);
    } else {
      return Err(ParseError::unexpected_token(pos));
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

    let c = self.curr_char()?;

    match c {
      b'/' => { 
        if self.starts_with(b"//") {
          self.forward(2);
          Ok(Token::LineCommentOpen)
        } else if self.starts_with(b"/>") {
          self.forward(2);
          Ok(Token::SelfTagClose)
        } else if self.starts_with(b"/*") {
          self.forward(2);
          Ok(Token::ScriptCommentOpen)
        } else {
          self.forward(1);
          Ok(Token::Backslash)
        }
      },
      b'>' => { self.forward(1); Ok(Token::GreaterThan) },
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
      },
      b'-' => {
        if self.starts_with(b"-->") {
          self.forward(3);
          Ok(Token::HtmlCommentClose)
        } else {
          self.forward(1);
          Ok(Token::Minus)
        }
      },
      b'*' => {
        if self.starts_with(b"*/") {
          self.forward(2);
          Ok(Token::ScriptCommentClose)
        } else {
          self.forward(1);
          Ok(Token::Star)
        }
      },
      b'!' => {
        self.forward(1);
        Ok(Token::Bang)
      },
      b'+' => {
        self.forward(1);
        Ok(Token::Plus)
      },
      b'~' => {
        self.forward(1);
        Ok(Token::Squiggle)
      },
      b'@' => {
        self.forward(1);
        Ok(Token::At)
      },
      b',' => {
        self.forward(1);
        Ok(Token::Comma)
      },
      b':' => {
        self.forward(1);
        Ok(Token::Colon)
      },
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
          let is_number = |c| { matches!(c, b'0'..=b'9') };

          if !self.is_eof() && is_number(self.curr_char().unwrap()) {
            let start = self.pos - 1;
            self.scan(is_number);
            Ok(Token::Number(self.since(start)))
          } else {
            Ok(Token::Dot)
          }          
        }
      },
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
      },
      b'}' => {
        self.forward(1);
        Ok(Token::CurlyClose)
      },
      b'0'..=b'9' => {
        let start = self.pos;
        let is_number = |c| { matches!(c, b'0'..=b'9') };
        self.scan(is_number);
        if self.starts_with(b".") {
          self.forward(1);
          self.scan(is_number);
        }

        Ok(Token::Number(self.since(start)))
      },
      b'[' => { self.forward(1); Ok(Token::SquareOpen) },
      b']' => { self.forward(1); Ok(Token::SquareClose) },
      b'(' => { self.forward(1); Ok(Token::ParenOpen) },
      b')' => { self.forward(1); Ok(Token::ParenClose) },
      b'#' => { self.forward(1); Ok(Token::Hash) },
      b'"' => { self.forward(1); Ok(Token::DoubleQuote) },
      b'\'' => { self.forward(1); Ok(Token::SingleQuote) },
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
      },
      b'a'..=b'z' | b'A'..=b'Z' => Ok(Token::Word(self.search(|c| -> bool { matches!(c, b'a'..=b'z' | b'A'..=b'Z') }))),
      b' ' | b'\t' | b'\r' | b'\n' => { self.scan(|c| -> bool { matches!(c, b' ' | b'\t' | b'\r' | b'\n') }); Ok(Token::Whitespace) },
      _ => { self.forward(1); Ok(Token::Byte(c)) }
    }

  }

  fn starts_with(&mut self, pattern: &[u8]) -> bool {
    self.source[self.pos..].starts_with(pattern)
  }
  fn forward(&mut self, pos: usize) {
    self.pos += pos;
  }
  pub fn curr_char(&mut self) -> Result<u8, ParseError> {
    if self.is_eof() {
      Err(ParseError::eof())
    } else {
      Ok(self.source[self.pos])
    }
  }
  fn search<FF>(&mut self, test: FF) -> &'a str where 
    FF: Fn(u8) -> bool {
    let start = self.pos;
    self.scan(test);
    self.since(start)
  }

  fn since(&mut self, start: usize) -> &'a str {
    std::str::from_utf8(&self.source[start..self.pos]).unwrap()
  }
  
  fn scan<FF>(&mut self, test: FF) where 
    FF: Fn(u8) -> bool {
    while !self.is_eof() {
      let c = self.source[self.pos];
      self.pos += 1;
      if !test(c) {
        self.pos-=1;
        break;
      }
    }
  }
  pub fn is_eof(&mut self) -> bool {
    self.pos >= self.source.len()
  }
  pub fn new(source: &'a str) -> Tokenizer {
      Tokenizer { source: source.as_bytes(), pos: 0 }
  }
}

#[cfg(test)]
mod tests {

  use super::*;

  #[test]
  fn can_tokenize_a_less_than_tag() {
    let mut tokenizer = Tokenizer::new("<");
    assert_eq!(tokenizer.next(), Ok(Token::LessThan));
    
  }
  #[test]
  fn can_tokenize_a_word() {
    let mut tokenizer = Tokenizer::new("div");
    assert_eq!(tokenizer.next(), Ok(Token::Word("div")));
    
  }
  #[test]
  fn can_tokenize_a_char() {
    let mut tokenizer = Tokenizer::new("$");
    assert_eq!(tokenizer.next(), Ok(Token::Byte(b'$')));
    
  }

  #[test]
  fn can_tokenize_a_self_close_tag() {
    let mut tokenizer = Tokenizer::new("</");
    assert_eq!(tokenizer.next(), Ok(Token::TagClose));
    
  }

  #[test]
  fn can_tokenize_a_self_closing_tag() {
    let mut tokenizer = Tokenizer::new("/>");
    assert_eq!(tokenizer.next(), Ok(Token::SelfTagClose));
    
  }

  #[test]
  fn can_tokenize_a_simple_self_closing_element() {
    let mut tokenizer = Tokenizer::new("<Ok-div />");
    assert_eq!(tokenizer.next(), Ok(Token::LessThan));
    assert_eq!(tokenizer.next(), Ok(Token::Word("Ok")));
    assert_eq!(tokenizer.next(), Ok(Token::Minus));
    assert_eq!(tokenizer.next(), Ok(Token::Word("div")));
    assert_eq!(tokenizer.next(), Ok(Token::Whitespace));
    assert_eq!(tokenizer.next(), Ok(Token::SelfTagClose));
    
  }
  #[test]
  fn can_tokenize_an_element_with_a_child() {
    let mut tokenizer = Tokenizer::new("<div><span /></div>");
    assert_eq!(tokenizer.next(), Ok(Token::LessThan));
    assert_eq!(tokenizer.next(), Ok(Token::Word("div")));
    assert_eq!(tokenizer.next(), Ok(Token::GreaterThan));
    assert_eq!(tokenizer.next(), Ok(Token::LessThan));
    assert_eq!(tokenizer.next(), Ok(Token::Word("span")));
    assert_eq!(tokenizer.next(), Ok(Token::Whitespace));
    assert_eq!(tokenizer.next(), Ok(Token::SelfTagClose));
    assert_eq!(tokenizer.next(), Ok(Token::TagClose));
    assert_eq!(tokenizer.next(), Ok(Token::Word("div")));
    assert_eq!(tokenizer.next(), Ok(Token::GreaterThan));
    
  }

  #[test]
  fn can_tokenize_curly_open() {
    let mut tokenizer = Tokenizer::new("{");
    assert_eq!(tokenizer.next(), Ok(Token::CurlyOpen));
    
  }


  #[test]
  fn can_tokenize_curly_close() {
    let mut tokenizer = Tokenizer::new("}");
    assert_eq!(tokenizer.next(), Ok(Token::CurlyClose));
    
  }

  #[test]
  fn can_tokenize_comment_parts() {
    let mut tokenizer = Tokenizer::new("<!---->/**/");
    assert_eq!(tokenizer.next(), Ok(Token::HtmlCommentOpen));
    assert_eq!(tokenizer.next(), Ok(Token::HtmlCommentClose));
    assert_eq!(tokenizer.next(), Ok(Token::ScriptCommentOpen));
    assert_eq!(tokenizer.next(), Ok(Token::ScriptCommentClose));
    
  }

  #[test]
  fn can_tokenize_spread_operator() {
    let mut tokenizer = Tokenizer::new("...");
    assert_eq!(tokenizer.next(), Ok(Token::Spread));
    
  }

  #[test]
  fn can_tokenize_comma() {
    let mut tokenizer = Tokenizer::new(",");
    assert_eq!(tokenizer.next(), Ok(Token::Comma));
    
  }

  #[test]
  fn can_tokenize_colon() {
    let mut tokenizer = Tokenizer::new(":");
    assert_eq!(tokenizer.next(), Ok(Token::Colon));
    
  }

  #[test]
  fn can_tokenize_dot() {
    let mut tokenizer = Tokenizer::new(".");
    assert_eq!(tokenizer.next(), Ok(Token::Dot));
    
  }

  #[test]
  fn can_tokenize_double_quote() {
    let mut tokenizer = Tokenizer::new("\"");
    assert_eq!(tokenizer.next(), Ok(Token::DoubleQuote));
    
  }

  #[test]
  fn can_tokenize_single_quote() {
    let mut tokenizer = Tokenizer::new("'");
    assert_eq!(tokenizer.next(), Ok(Token::SingleQuote));
    
  }

  #[test]
  fn can_tokenize_double_equals() {
    let mut tokenizer = Tokenizer::new("==");
    assert_eq!(tokenizer.next(), Ok(Token::DoubleEquals));
    
  }

  #[test]
  fn can_tokenize_tripple_equals() {
    let mut tokenizer = Tokenizer::new("===");
    assert_eq!(tokenizer.next(), Ok(Token::TrippleEquals));
    
  }

  #[test]
  fn can_tokenize_equals() {
    let mut tokenizer = Tokenizer::new("=");
    assert_eq!(tokenizer.next(), Ok(Token::Equals));
  }

  #[test]
  fn can_tokenize_open_block() {
    let mut tokenizer = Tokenizer::new("{#");
    assert_eq!(tokenizer.next(), Ok(Token::BlockOpen));
  }

  #[test]
  fn can_tokenize_close_block() {
    let mut tokenizer = Tokenizer::new("{/");
    assert_eq!(tokenizer.next(), Ok(Token::BlockClose));
  }

  #[test]
  fn can_tokenize_a_number() {
    let mut tokenizer = Tokenizer::new("56 3.2 .5 4.4.10 -32 533-9");
    assert_eq!(tokenizer.next(), Ok(Token::Number("56")));
    assert_eq!(tokenizer.next(), Ok(Token::Whitespace));
    assert_eq!(tokenizer.next(), Ok(Token::Number("3.2")));
    assert_eq!(tokenizer.next(), Ok(Token::Whitespace));
    assert_eq!(tokenizer.next(), Ok(Token::Number(".5")));
    assert_eq!(tokenizer.next(), Ok(Token::Whitespace));
    assert_eq!(tokenizer.next(), Ok(Token::Number("4.4")));
    assert_eq!(tokenizer.next(), Ok(Token::Number(".10")));
    assert_eq!(tokenizer.next(), Ok(Token::Whitespace));
    assert_eq!(tokenizer.next(), Ok(Token::Minus));
    assert_eq!(tokenizer.next(), Ok(Token::Number("32")));
    assert_eq!(tokenizer.next(), Ok(Token::Whitespace));
    assert_eq!(tokenizer.next(), Ok(Token::Number("533")));
    assert_eq!(tokenizer.next(), Ok(Token::Minus));
    assert_eq!(tokenizer.next(), Ok(Token::Number("9")));
  }
} 