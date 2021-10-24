use super::ast;
use super::tokenizer::{Token, Tokenizer};
use crate::base::ast::Range;
use crate::base::parser::{get_buffer, ParseError};
use crate::base::string_scanner::StringScanner;
use crate::core::id_generator::IDGenerator;
use crate::pc::parser::parse_tag;
use crate::pc::parser::Context as PCContext;
use crate::pc::tokenizer::Tokenizer as PCTokenizer;

struct Context<'a, 'b> {
  tokenizer: &'a mut Tokenizer<'b>,
  scope_id: String,
  id_generator: IDGenerator,
}

pub fn _parse<'a>(source: &'a str, scope_id: &'a str) -> Result<ast::Expression, ParseError> {
  let mut tokenizer = Tokenizer::new_from_scanner(StringScanner::new(source));
  parse_with_tokenizer(&mut tokenizer, "".to_string(), scope_id)
}

pub fn parse_with_tokenizer<'a, 'b, 'c>(
  tokenizer: &'a mut Tokenizer<'b>,
  id_seed: String,
  scope_id: &'c str,
) -> Result<ast::Expression, ParseError> {
  let mut context = Context {
    tokenizer,
    scope_id: scope_id.to_string(),
    id_generator: IDGenerator::new(id_seed),
  };
  parse_top(&mut context)
}

fn parse_top<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  parse_conjunction(context)
}

fn parse_conjunction<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  context.tokenizer.scanner.eat_whitespace();
  let start = context.tokenizer.scanner.get_u16pos();
  let left: ast::Expression = parse_expression(context)?;

  if context.tokenizer.scanner.is_eof() {
    return Ok(left);
  }

  let operator_option = match context.tokenizer.peek_eat_whitespace(1)? {
    Token::LogicalAnd => Some(ast::ConjunctionOperatorKind::And),
    Token::LogicalOr => Some(ast::ConjunctionOperatorKind::Or),
    _ => None,
  };

  if let Some(operator) = operator_option {
    context.tokenizer.scanner.eat_whitespace();
    context.tokenizer.next()?;
    let right = parse_top(context)?;
    Ok(ast::Expression::Conjunction(ast::Conjunction {
      id: context.id_generator.new_id(),
      left: Box::new(left),
      operator,
      right: Box::new(right),
      range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
    }))
  } else {
    Ok(left)
  }
}

fn parse_expression<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  context.tokenizer.scanner.eat_whitespace();

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

  result
}
fn parse_not<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();
  context.tokenizer.next()?;
  Ok(ast::Expression::Not(ast::Not {
    id: context.id_generator.new_id(),
    range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
    expression: Box::new(parse_expression(context)?),
  }))
}

fn parse_node<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let seed = context.id_generator.new_seed();
  let mut scanner = context.tokenizer.scanner.clone();
  let mut pc_tokenizer = PCTokenizer::new_from_scanner(scanner);
  let mut pc_context = PCContext {
    scope_id: context.scope_id.to_string(),
    tokenizer: pc_tokenizer,
    id_generator: IDGenerator::new(seed.to_string()),
  };

  let node = ast::Expression::Node(Box::new(parse_tag(
    &mut pc_context,
    vec![context.id_generator.seed.to_string()],
    None,
  )?));

  context
    .tokenizer
    .scanner
    .set_pos(&pc_context.tokenizer.scanner.get_pos());
  Ok(node)
}

fn parse_number<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();
  let buffer = get_number_buffer(context)?;

  Ok(ast::Expression::Number(ast::Number {
    id: context.id_generator.new_id(),
    value: buffer,
    range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
  }))
}

fn parse_negative_number<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<ast::Expression, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();
  context.tokenizer.next_expect(Token::Minus)?;
  let num_buffer = get_number_buffer(context)?;

  Ok(ast::Expression::Number(ast::Number {
    id: context.id_generator.new_id(),
    value: format!("-{}", num_buffer),
    range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
  }))
}

fn get_number_buffer<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<String, ParseError> {
  let mut buffer = String::new();

  while !context.tokenizer.scanner.is_eof() {
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
  let start_pos = context.tokenizer.scanner.get_u16pos();
  let start = context.tokenizer.next()?;
  let value = get_buffer(context.tokenizer, |tokenizer| {
    Ok(tokenizer.peek(1)? != start)
  })?
  .to_string();
  context.tokenizer.next_expect(start)?;
  Ok(ast::Expression::String(ast::Str {
    id: context.id_generator.new_id(),
    value,
    range: Range::new(start_pos, context.tokenizer.scanner.get_u16pos()),
  }))
}

fn parse_group<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();
  context.tokenizer.next()?; // eat (
  let expression = parse_top(context)?;
  context.tokenizer.scanner.eat_whitespace();
  context.tokenizer.next_expect(Token::ParenClose)?; // eat )

  Ok(ast::Expression::Group(ast::Group {
    id: context.id_generator.new_id(),
    range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
    expression: Box::new(expression),
  }))
}

fn parse_array<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();
  context.tokenizer.next_expect(Token::SquareOpen)?;
  let mut values = vec![];

  while !context.tokenizer.scanner.is_eof()
    && context.tokenizer.peek_eat_whitespace(1)? != Token::SquareClose
  {
    values.push(parse_top(context)?);
    if context.tokenizer.peek(1)? == Token::SquareClose {
      break;
    }
    context.tokenizer.next_expect(Token::Comma)?;
  }

  context.tokenizer.scanner.eat_whitespace();
  context.tokenizer.next_expect(Token::SquareClose)?;

  Ok(ast::Expression::Array(ast::Array {
    id: context.id_generator.new_id(),
    values,
    range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
  }))
}

fn parse_object<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();

  context.tokenizer.next_expect(Token::CurlyOpen)?;
  let mut properties = vec![];

  while !context.tokenizer.scanner.is_eof()
    && context.tokenizer.peek_eat_whitespace(1)? != Token::CurlyClose
  {
    let key = parse_top(context)?;

    context.tokenizer.scanner.eat_whitespace();
    let value = if context.tokenizer.peek(1)? == Token::Colon {
      let colon = context.tokenizer.next_expect(Token::Colon)?;
      context.tokenizer.scanner.eat_whitespace();
      parse_top(context)?
    } else {
      key.clone()
    };

    properties.push(ast::Property {
      key: key.to_string(),
      value,
    });

    context.tokenizer.scanner.eat_whitespace();
    if context.tokenizer.peek(1)? == Token::CurlyClose {
      break;
    }
    context.tokenizer.next_expect(Token::Comma)?;
  }

  context.tokenizer.scanner.eat_whitespace();
  context.tokenizer.next_expect(Token::CurlyClose)?;

  Ok(ast::Expression::Object(ast::Object {
    id: context.id_generator.new_id(),
    properties,
    range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
  }))
}

fn parse_boolean<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let pos = context.tokenizer.scanner.get_u16pos();
  if let Token::Word(name) = context.tokenizer.next()? {
    if name == "true" || name == "false" {
      return Ok(ast::Expression::Boolean(ast::Boolean {
        id: context.id_generator.new_id(),
        value: name == "true",
        range: Range::new(pos, context.tokenizer.scanner.get_u16pos()),
      }));
    }
  }

  Err(ParseError::unexpected_token(
    pos.range_from(context.tokenizer.scanner.get_u16pos()),
  ))
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
  let pos = context.tokenizer.scanner.get_u16pos();
  let part = parse_reference_part(context)?;
  let mut path = vec![part];
  while !context.tokenizer.scanner.is_eof() && context.tokenizer.peek(1)? == Token::Dot {
    context.tokenizer.next()?; // eat .
    let pos = context.tokenizer.scanner.get_u16pos();
    if token_matches_var_start(&context.tokenizer.peek(1)?) {
      path.push(parse_reference_part(context)?);
    } else {
      return Err(ParseError::unexpected_token(
        pos.range_from(context.tokenizer.scanner.get_u16pos()),
      ));
    }
  }
  Ok(ast::Expression::Reference(ast::Reference {
    id: context.id_generator.new_id(),
    path,
    range: Range::new(pos, context.tokenizer.scanner.get_u16pos()),
  }))
}

fn parse_reference_part<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<ast::ReferencePart, ParseError> {
  let pos = context.tokenizer.scanner.get_u16pos();
  let name = parse_reference_name(context)?;
  let optional =
    if !context.tokenizer.scanner.is_eof() && context.tokenizer.peek(1)? == Token::Byte(b'?') {
      context.tokenizer.next();
      true
    } else {
      false
    };

  Ok(ast::ReferencePart { name, optional })
}

fn parse_word<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Expression, ParseError> {
  let pos = context.tokenizer.scanner.get_u16pos();
  let token = context.tokenizer.peek(1)?;
  if let Token::Word(name) = token {
    if name == "true" || name == "false" {
      return parse_boolean(context);
    }
  }

  if token_matches_var_start(&token) {
    return parse_reference(context);
  }

  Err(ParseError::unexpected_token(
    pos.range_from(context.tokenizer.scanner.get_u16pos()),
  ))
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
      let _ast = _parse(case, "").unwrap();
      println!("{:?}", _ast);
    }
  }
}
