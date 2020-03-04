use crate::base::tokenizer::{Tokenizer, Token};
use crate::base::parser::{get_buffer, ParseError};
use super::ast;
use crate::pc::parser::parse_tag;
use std::collections::{HashMap};

pub fn _parse<'a>(source: &'a str) -> Result<ast::Statement, ParseError> {
  let mut tokenizer = Tokenizer::new(source);
  parse_with_tokenizer(&mut tokenizer, |_token| { true })
}

pub fn parse_with_tokenizer<'a, FUntil>(tokenizer: &mut Tokenizer<'a>, _until: FUntil) -> Result<ast::Statement, ParseError> where
FUntil: Fn(Token) -> bool {
  parse_statement(tokenizer)
}

fn parse_statement<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {

  tokenizer.eat_whitespace();
  let result = match tokenizer.peek(1)? {
    //  Token::Minus  - TODO - negate. Need to consider refs too
    Token::LessThan => parse_node(tokenizer),
    Token::DoubleQuote | Token::SingleQuote => parse_string(tokenizer),
    Token::Number(_)=> parse_number(tokenizer),
    Token::SquareOpen => parse_array(tokenizer),
    Token::CurlyOpen => parse_object(tokenizer),
    _ => parse_word(tokenizer)
  };

  tokenizer.eat_whitespace();
  result
}

fn parse_node<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {
  Ok(ast::Statement::Node(Box::new(parse_tag(tokenizer)?)))
}

fn parse_number<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {
  let mut buffer = String::new();

  while !tokenizer.is_eof() {
    match tokenizer.peek(1)? {
      Token::Number(value) => {
        tokenizer.next()?;
        buffer.extend(value.chars());
      },
      _ => {
        break;
      }
    }
  };

  Ok(ast::Statement::Number(ast::Number { value: buffer }))
}

fn parse_string<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {
  let start = tokenizer.next()?;
  let value = get_buffer(tokenizer, |tokenizer| {
    Ok(tokenizer.peek(1)? != start)
  })?.to_string();
  tokenizer.next_expect(start)?;
  Ok(ast::Statement::String(ast::Str { value }))
}

fn parse_array<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {

  
  tokenizer.next_expect(Token::SquareOpen)?;
  let mut values = vec![];

  while !tokenizer.is_eof() && tokenizer.peek_eat_whitespace(1)? != Token::SquareClose {

    values.push(parse_statement(tokenizer)?);
    if tokenizer.peek(1)? == Token::SquareClose {
      break;
    } 
    tokenizer.next_expect(Token::Comma)?;
  }

  tokenizer.eat_whitespace();
  tokenizer.next_expect(Token::SquareClose)?;

  Ok(ast::Statement::Array(ast::Array {
    values
  }))
}

fn parse_object<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {

  tokenizer.next_expect(Token::CurlyOpen)?;
  let mut properties = vec![];

  while !tokenizer.is_eof() && tokenizer.peek_eat_whitespace(1)? != Token::CurlyClose {

    let key = parse_statement(tokenizer)?;

    tokenizer.eat_whitespace();
    let value = if tokenizer.peek(1)? == Token::Colon {
      let colon = tokenizer.next_expect(Token::Colon)?;
      tokenizer.eat_whitespace();
      parse_statement(tokenizer)?
    } else {
      key.clone()
    };

    properties.push(ast::Property { key: key.to_string(), value });


    tokenizer.eat_whitespace();
    if tokenizer.peek(1)? == Token::CurlyClose {
      break;
    } 
    tokenizer.next_expect(Token::Comma)?;
  }
  
  tokenizer.eat_whitespace();
  tokenizer.next_expect(Token::CurlyClose)?;

  Ok(ast::Statement::Object(ast::Object {
    properties
  }))
}

fn parse_word<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {
  let pos = tokenizer.pos;
  if let Token::Word(name) = tokenizer.next()? {

    if name == "true" || name == "false" {
      return Ok(ast::Statement::Boolean(ast::Boolean { value: name == "true" }));
    }

    let mut path = vec![name.to_string()];
    while !tokenizer.is_eof() && tokenizer.peek(1)? == Token::Dot {
      tokenizer.next()?; // eat .
      let pos = tokenizer.pos;
      match tokenizer.next()? {
        Token::Word(part) => {
          path.push(part.to_string());
        }
        _ => {
          return Err(ParseError::unexpected_token(pos));
        }
      }
    }
    Ok(ast::Statement::Reference(ast::Reference { path: path }))
  } else {
    Err(ParseError::unexpected_token(pos))
  }
}


#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn can_smoke_parse_various_statements() {
    let cases = vec![
      "[{a:1}]",
      "someReference",
      "some.nested.reference",

      // nodes
      "<element />",

      // strings
      "'string'",
      "\"something\"",

      // numbers
      "1",

      // arrays
      "['ab', 'cd']",
      "[1, 2, [1, 2, 3, 4]]",

      // objects,
      "{ a: 1, b: 2, d: {e, f, g: 5}}",
      "[[1, {a, g, f, g: 1}], 2]",
      "[]",
      "{}",
      "[ ]",
      "{ }"
    ];

    for case in cases {
      let _ast = _parse(case).unwrap();
      println!("{:?}", _ast);
    }
  }
}
