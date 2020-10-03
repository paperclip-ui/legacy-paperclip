use super::ast;
use super::tokenizer::{Token, Tokenizer};
use crate::base::ast::Location;
use crate::base::parser::{get_buffer, ParseError};
use crate::pc::parser::parse_tag;
use crate::pc::tokenizer::{Token as PCToken, Tokenizer as PCTokenizer};

pub fn _parse<'a>(source: &'a str) -> Result<ast::Statement, ParseError> {
  let mut tokenizer = Tokenizer::new(source);
  parse_with_tokenizer(&mut tokenizer, |_token| true)
}

pub fn parse_with_tokenizer<'a, FUntil>(
  tokenizer: &mut Tokenizer<'a>,
  _until: FUntil,
) -> Result<ast::Statement, ParseError>
where
  FUntil: Fn(Token) -> bool,
{
  parse_statement(tokenizer)
}

fn parse_statement<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {
  tokenizer.eat_whitespace();
  let result = match tokenizer.peek(1)? {
    //  Token::Minus  - TODO - negate. Need to consider refs too
    Token::LessThan => parse_node(tokenizer),
    Token::DoubleQuote | Token::SingleQuote => parse_string(tokenizer),
    Token::Number(_) => parse_number(tokenizer),
    Token::SquareOpen => parse_array(tokenizer),
    Token::CurlyOpen => parse_object(tokenizer),
    _ => parse_word(tokenizer),
  };

  tokenizer.eat_whitespace();
  result
}

fn parse_node<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {
  let mut pc_tokenizer = PCTokenizer::new_from_bytes(&tokenizer.source, tokenizer.get_pos());
  let node = ast::Statement::Node(Box::new(parse_tag(&mut pc_tokenizer, vec![])?));
  tokenizer.set_pos(&pc_tokenizer.get_pos());
  Ok(node)
}

fn parse_number<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {
  let mut buffer = String::new();
  let start = tokenizer.utf16_pos;

  while !tokenizer.is_eof() {
    match tokenizer.peek(1)? {
      Token::Number(value) => {
        tokenizer.next()?;
        buffer.extend(value.chars());
      }
      _ => {
        break;
      }
    }
  }

  Ok(ast::Statement::Number(ast::Number {
    value: buffer,
    location: Location::new(start, tokenizer.utf16_pos),
  }))
}

fn parse_string<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {
  let start_pos = tokenizer.utf16_pos;
  let start = tokenizer.next()?;
  let value = get_buffer(tokenizer, |tokenizer| Ok(tokenizer.peek(1)? != start))?.to_string();
  tokenizer.next_expect(start)?;
  Ok(ast::Statement::String(ast::Str {
    value,
    location: Location::new(start_pos, tokenizer.utf16_pos),
  }))
}

fn parse_array<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {
  let start = tokenizer.utf16_pos;
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
    values,
    location: Location::new(start, tokenizer.utf16_pos),
  }))
}

fn parse_object<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {
  let start = tokenizer.utf16_pos;

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

    properties.push(ast::Property {
      key: key.to_string(),
      value,
    });

    tokenizer.eat_whitespace();
    if tokenizer.peek(1)? == Token::CurlyClose {
      break;
    }
    tokenizer.next_expect(Token::Comma)?;
  }

  tokenizer.eat_whitespace();
  tokenizer.next_expect(Token::CurlyClose)?;

  Ok(ast::Statement::Object(ast::Object {
    properties,
    location: Location::new(start, tokenizer.utf16_pos),
  }))
}

fn parse_boolean<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {
  let pos = tokenizer.utf16_pos;
  if let Token::Word(name) = tokenizer.next()? {
    if name == "true" || name == "false" {
      return Ok(ast::Statement::Boolean(ast::Boolean {
        value: name == "true",
        location: Location::new(pos, tokenizer.utf16_pos),
      }));
    }
  }

  Err(ParseError::unexpected_token(pos))
}

fn token_matches_var_start(token: &Token) -> bool {
  match token {
    Token::Byte(b'_') | Token::Byte(b'$') => true,
    Token::Word(_) => true,
    _ => false,
  }
}

fn token_matches_var_part(token: &Token) -> bool {
  token_matches_var_start(token)
    || if let Token::Number(v) = token {
      true
    } else {
      false
    }
}
fn parse_reference_name<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<String, ParseError> {
  Ok(
    get_buffer(tokenizer, |tokenizer| {
      Ok(token_matches_var_part(&tokenizer.peek(1)?))
    })?
    .to_string(),
  )
}

fn parse_reference<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {
  let pos = tokenizer.utf16_pos;
  let part = parse_reference_part(tokenizer)?;
  let mut path = vec![part];
  while !tokenizer.is_eof() && tokenizer.peek(1)? == Token::Dot {
    tokenizer.next()?; // eat .
    let pos = tokenizer.utf16_pos;
    if token_matches_var_start(&tokenizer.peek(1)?) {
      path.push(parse_reference_part(tokenizer)?);
    } else {
      return Err(ParseError::unexpected_token(pos));
    }
  }
  Ok(ast::Statement::Reference(ast::Reference {
    path,
    location: Location::new(pos, tokenizer.utf16_pos),
  }))
}

fn parse_reference_part<'a>(
  tokenizer: &mut Tokenizer<'a>,
) -> Result<ast::ReferencePart, ParseError> {
  let pos = tokenizer.utf16_pos;
  let name = parse_reference_name(tokenizer)?;
  let optional = if !tokenizer.is_eof() && tokenizer.peek(1)? == Token::Byte(b'?') {
    tokenizer.next();
    true
  } else {
    false
  };

  Ok(ast::ReferencePart { name, optional })
}

fn parse_word<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<ast::Statement, ParseError> {
  let pos = tokenizer.utf16_pos;
  let token = tokenizer.peek(1)?;
  if let Token::Word(name) = token {
    if name == "true" || name == "false" {
      return parse_boolean(tokenizer);
    }
  }

  if token_matches_var_start(&token) {
    return parse_reference(tokenizer);
  }

  Err(ParseError::unexpected_token(pos))
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn can_smoke_parse_various_statements() {
    let cases = vec![
      "[{a:1}]",
      "someReference",
      "someR3f",
      "_someRef",
      "$$someRef",
      "some.nested.reference",
      "somethingOptional?",
      "maybe?.exists?",
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
      "{ }",
    ];

    for case in cases {
      let _ast = _parse(case).unwrap();
      println!("{:?}", _ast);
    }
  }
}
