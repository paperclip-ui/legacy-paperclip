use super::ast;
use super::tokenizer::{Token, Tokenizer};
use crate::base::ast::Location;
use crate::base::parser::{get_buffer, ParseError};
use crate::pc::parser::parse_tag;
use crate::pc::tokenizer::{Token as PCToken, Tokenizer as PCTokenizer};

struct Context<'a, 'b> {
  tokenizer: &'b mut Tokenizer<'a>,
  id_seed: String,
}

pub fn _parse<'a>(source: &'a str) -> Result<ast::Expression, ParseError> {
  let mut tokenizer = Tokenizer::new(source);
  parse_with_tokenizer(&mut tokenizer, "".to_string(), |_token| true)
}

pub fn parse_with_tokenizer<'a, FUntil>(
  tokenizer: &mut Tokenizer<'a>,
  id_seed: String,
  _until: FUntil,
) -> Result<ast::Expression, ParseError>
where
  FUntil: Fn(Token) -> bool,
{
  let mut context = Context { tokenizer, id_seed };

  parse_top(&mut context)
}

fn parse_top<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  parse_conjunction(context)
}

fn parse_conjunction<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  context.tokenizer.eat_whitespace();
  let start = context.tokenizer.utf16_pos;
  let left: ast::Expression = parse_expression(context)?;

  if context.tokenizer.is_eof() {
    return Ok(left);
  }

  let operator_option = match context.tokenizer.peek(1)? {
    Token::LogicalAnd => Some(ast::ConjunctionOperatorKind::And),
    Token::LogicalOr => Some(ast::ConjunctionOperatorKind::Or),
    _ => None,
  };

  if let Some(operator) = operator_option {
    context.tokenizer.next()?;
    let right = parse_top(context)?;
    Ok(ast::Expression::Conjunction(ast::Conjunction {
      left: Box::new(left),
      operator,
      right: Box::new(right),
      location: Location::new(start, context.tokenizer.utf16_pos),
    }))
  } else {
    Ok(left)
  }
}

fn parse_expression<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  context.tokenizer.eat_whitespace();

  let result = match context.tokenizer.peek(1)? {
    //  Token::Minus  - TODO - negate. Need to consider refs too
    Token::LessThan => parse_node(context),
    Token::Bang => parse_not(context),
    Token::DoubleQuote | Token::SingleQuote => parse_string(context),
    Token::Number(_) => parse_number(context),
    Token::Minus => parse_negative_number(context),
    Token::SquareOpen => parse_array(context),
    Token::CurlyOpen => parse_object(context),
    Token::ParenOpen => parse_group(context),
    _ => parse_word(context),
  };

  context.tokenizer.eat_whitespace();
  result
}
fn parse_not<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let start = context.tokenizer.utf16_pos;
  context.tokenizer.next()?;
  Ok(ast::Expression::Not(ast::Not {
    location: Location::new(start, context.tokenizer.utf16_pos),
    expression: Box::new(parse_expression(context)?),
  }))
}

fn parse_node<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let mut pc_tokenizer =
    PCTokenizer::new_from_bytes(&context.tokenizer.source, context.tokenizer.get_pos());
  let node = ast::Expression::Node(Box::new(parse_tag(
    &mut pc_tokenizer,
    vec![context.id_seed.to_string()],
    None,
  )?));
  context.tokenizer.set_pos(&pc_tokenizer.get_pos());
  Ok(node)
}

fn parse_number<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let start = context.tokenizer.utf16_pos;
  let buffer = get_number_buffer(context)?;

  Ok(ast::Expression::Number(ast::Number {
    value: buffer,
    location: Location::new(start, context.tokenizer.utf16_pos),
  }))
}

fn parse_negative_number<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<ast::Expression, ParseError> {
  let start = context.tokenizer.utf16_pos;
  context.tokenizer.next_expect(Token::Minus)?;
  let num_buffer = get_number_buffer(context)?;

  Ok(ast::Expression::Number(ast::Number {
    value: format!("-{}", num_buffer),
    location: Location::new(start, context.tokenizer.utf16_pos),
  }))
}

fn get_number_buffer<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<String, ParseError> {
  let mut buffer = String::new();

  while !context.tokenizer.is_eof() {
    match context.tokenizer.peek(1)? {
      Token::Number(value) => {
        context.tokenizer.next()?;
        buffer.extend(value.chars());
      }
      _ => {
        break;
      }
    }
  }

  Ok(buffer)
}

fn parse_string<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let start_pos = context.tokenizer.utf16_pos;
  let start = context.tokenizer.next()?;
  let value = get_buffer(context.tokenizer, |tokenizer| {
    Ok(tokenizer.peek(1)? != start)
  })?
  .to_string();
  context.tokenizer.next_expect(start)?;
  Ok(ast::Expression::String(ast::Str {
    value,
    location: Location::new(start_pos, context.tokenizer.utf16_pos),
  }))
}

fn parse_group<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let start = context.tokenizer.utf16_pos;
  context.tokenizer.next()?; // eat (
  let expression = parse_top(context)?;
  context.tokenizer.eat_whitespace();
  context.tokenizer.next_expect(Token::ParenClose)?; // eat )

  Ok(ast::Expression::Group(ast::Group {
    location: Location::new(start, context.tokenizer.utf16_pos),
    expression: Box::new(expression),
  }))
}

fn parse_array<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let start = context.tokenizer.utf16_pos;
  context.tokenizer.next_expect(Token::SquareOpen)?;
  let mut values = vec![];

  while !context.tokenizer.is_eof()
    && context.tokenizer.peek_eat_whitespace(1)? != Token::SquareClose
  {
    values.push(parse_top(context)?);
    if context.tokenizer.peek(1)? == Token::SquareClose {
      break;
    }
    context.tokenizer.next_expect(Token::Comma)?;
  }

  context.tokenizer.eat_whitespace();
  context.tokenizer.next_expect(Token::SquareClose)?;

  Ok(ast::Expression::Array(ast::Array {
    values,
    location: Location::new(start, context.tokenizer.utf16_pos),
  }))
}

fn parse_object<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let start = context.tokenizer.utf16_pos;

  context.tokenizer.next_expect(Token::CurlyOpen)?;
  let mut properties = vec![];

  while !context.tokenizer.is_eof()
    && context.tokenizer.peek_eat_whitespace(1)? != Token::CurlyClose
  {
    let key = parse_top(context)?;

    context.tokenizer.eat_whitespace();
    let value = if context.tokenizer.peek(1)? == Token::Colon {
      let colon = context.tokenizer.next_expect(Token::Colon)?;
      context.tokenizer.eat_whitespace();
      parse_top(context)?
    } else {
      key.clone()
    };

    properties.push(ast::Property {
      key: key.to_string(),
      value,
    });

    context.tokenizer.eat_whitespace();
    if context.tokenizer.peek(1)? == Token::CurlyClose {
      break;
    }
    context.tokenizer.next_expect(Token::Comma)?;
  }

  context.tokenizer.eat_whitespace();
  context.tokenizer.next_expect(Token::CurlyClose)?;

  Ok(ast::Expression::Object(ast::Object {
    properties,
    location: Location::new(start, context.tokenizer.utf16_pos),
  }))
}

fn parse_boolean<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let pos = context.tokenizer.utf16_pos;
  if let Token::Word(name) = context.tokenizer.next()? {
    if name == "true" || name == "false" {
      return Ok(ast::Expression::Boolean(ast::Boolean {
        value: name == "true",
        location: Location::new(pos, context.tokenizer.utf16_pos),
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
fn parse_reference_name<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<String, ParseError> {
  Ok(
    get_buffer(context.tokenizer, |tokenizer| {
      Ok(token_matches_var_part(&tokenizer.peek(1)?))
    })?
    .to_string(),
  )
}

fn parse_reference<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let pos = context.tokenizer.utf16_pos;
  let part = parse_reference_part(context)?;
  let mut path = vec![part];
  while !context.tokenizer.is_eof() && context.tokenizer.peek(1)? == Token::Dot {
    context.tokenizer.next()?; // eat .
    let pos = context.tokenizer.utf16_pos;
    if token_matches_var_start(&context.tokenizer.peek(1)?) {
      path.push(parse_reference_part(context)?);
    } else {
      return Err(ParseError::unexpected_token(pos));
    }
  }
  Ok(ast::Expression::Reference(ast::Reference {
    path,
    location: Location::new(pos, context.tokenizer.utf16_pos),
  }))
}

fn parse_reference_part<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<ast::ReferencePart, ParseError> {
  let pos = context.tokenizer.utf16_pos;
  let name = parse_reference_name(context)?;
  let optional = if !context.tokenizer.is_eof() && context.tokenizer.peek(1)? == Token::Byte(b'?') {
    context.tokenizer.next();
    true
  } else {
    false
  };

  Ok(ast::ReferencePart { name, optional })
}

fn parse_word<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let pos = context.tokenizer.utf16_pos;
  let token = context.tokenizer.peek(1)?;
  if let Token::Word(name) = token {
    if name == "true" || name == "false" {
      return parse_boolean(context);
    }
  }

  if token_matches_var_start(&token) {
    return parse_reference(context);
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
