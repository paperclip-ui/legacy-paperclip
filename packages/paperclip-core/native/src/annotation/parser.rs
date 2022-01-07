use super::ast;
use super::tokenizer::{Token, Tokenizer};
use crate::base::ast as base_ast;
use crate::base::parser::{get_buffer, ParseError};
use crate::script::parser::parse_with_tokenizer as parse_js_with_tokenizer;
use crate::script::tokenizer::Tokenizer as JSTokenizer;

type FUntil<'a> = for<'r> fn(&mut Tokenizer<'a>) -> Result<bool, ParseError>;

pub struct Context<'a, 'b> {
  tokenizer: &'a mut Tokenizer<'b>,
  scope_id: String,
  until: FUntil<'b>,
}

impl<'a, 'b> Context<'a, 'b> {
  pub fn ended(&mut self) -> Result<bool, ParseError> {
    Ok(self.tokenizer.is_eof() || (self.until)(self.tokenizer)?)
  }
}

pub fn parse_with_tokenizer<'a, 'b>(
  tokenizer: &'a mut Tokenizer<'b>,
  scope_id: &String,
  until: FUntil<'b>,
) -> Result<ast::Annotation, ParseError> {
  let mut context = Context {
    tokenizer,
    until,
    scope_id: scope_id.to_string(),
  };

  parse_annotation(&mut context)
}

fn parse_annotation<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Annotation, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();
  let mut properties: Vec<ast::AnnotationProperty> = vec![];

  let mut raw_before = context.tokenizer.scanner.eat_whitespace();

  while !context.ended()? {
    properties.push(parse_annotation_property(context, raw_before)?);
    raw_before = None;
  }

  Ok(ast::Annotation {
    properties,
    range: base_ast::Range::new(start, context.tokenizer.scanner.get_u16pos()),
  })
}

fn parse_annotation_property<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'b [u8]>,
) -> Result<ast::AnnotationProperty, ParseError> {
  match context.tokenizer.peek(1)? {
    Token::At => parse_declaration_property(context, raw_before),
    _ => parse_text_annotation(context, raw_before),
  }
}

fn parse_text_annotation<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'a [u8]>,
) -> Result<ast::AnnotationProperty, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();

  let start_u8 = context.tokenizer.get_pos().u8_pos;

  // Take everything except @ sign
  while !context.ended()? && context.tokenizer.peek(1)? != Token::At {
    let token = context.tokenizer.next()?;
  }
  let end = context.tokenizer.scanner.get_u16pos();
  let end_u8 = context.tokenizer.get_pos().u8_pos;

  let buffer = std::str::from_utf8(&context.tokenizer.scanner.source[start_u8..end_u8]).unwrap();

  Ok(ast::AnnotationProperty::Text(ast::Text {
    raws: base_ast::BasicRaws::new(raw_before, None),
    value: buffer.to_string(),
    range: start.range_from(end),
  }))
}

fn parse_declaration_property<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'b [u8]>,
) -> Result<ast::AnnotationProperty, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();

  context.tokenizer.next_expect(Token::At)?;
  let name = get_buffer(context.tokenizer, |tokenizer| {
    Ok(tokenizer.peek(1)? != Token::Byte(b' '))
  })?
  .to_string();

  let mut js_tokenizer = JSTokenizer::new_from_scanner(context.tokenizer.scanner.clone());
  let value =
    parse_js_with_tokenizer(&mut js_tokenizer, "".to_string(), context.scope_id.as_str())?;

  context.tokenizer.set_pos(&js_tokenizer.scanner.get_pos());

  Ok(ast::AnnotationProperty::Declaration(ast::Declaration {
    name,
    raws: base_ast::BasicRaws::new(raw_before, None),
    value,
    range: base_ast::Range::new(start, context.tokenizer.scanner.get_u16pos()),
  }))
}
