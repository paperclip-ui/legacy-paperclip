use super::ast;
use super::tokenizer::{Token, Tokenizer};
use crate::base::ast as base_ast;
use crate::base::parser::{get_buffer, ParseError};
use crate::js::parser::parse_with_tokenizer as parse_js_with_tokenizer;
use crate::js::tokenizer::{Token as JSToken, Tokenizer as JSTokenizer};

type FUntil<'a> = for<'r> fn(&mut Tokenizer<'a>) -> Result<bool, ParseError>;

pub struct Context<'a, 'b> {
  tokenizer: &'b mut Tokenizer<'a>,
  until: FUntil<'a>,
}

impl<'a, 'b> Context<'a, 'b> {
  pub fn ended(&mut self) -> Result<bool, ParseError> {
    Ok(self.tokenizer.is_eof() || (self.until)(self.tokenizer)?)
  }
}

pub fn parse_with_tokenizer<'a>(
  tokenizer: &mut Tokenizer<'a>,
  until: FUntil<'a>,
) -> Result<ast::Annotation, ParseError> {
  let mut context = Context { tokenizer, until };

  parse_annotation(&mut context)
}

fn parse_annotation<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ast::Annotation, ParseError> {
  let start = context.tokenizer.utf16_pos;
  let mut properties: Vec<ast::AnnotationProperty> = vec![];

  while !context.ended()? {
    properties.push(parse_annotation_property(context)?);
  }

  Ok(ast::Annotation {
    properties,
    location: base_ast::Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_annotation_property<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<ast::AnnotationProperty, ParseError> {
  let raw_before = context.tokenizer.eat_whitespace();
  match context.tokenizer.peek(1)? {
    Token::Word(_) | Token::Byte(_) | Token::Cluster(_) => {
      parse_text_annotation(context, raw_before)
    }
    Token::At => parse_declaration_property(context, raw_before),
  }
}

fn parse_text_annotation<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'a [u8]>,
) -> Result<ast::AnnotationProperty, ParseError> {
  let start = context.tokenizer.utf16_pos;

  let start = context.tokenizer.get_pos();
  let start_u8 = context.tokenizer.get_pos().u8_pos;

  while !context.ended()? {
    let token = context.tokenizer.next()?;
    if token == Token::Byte(b'\n') {
      break;
    }
  }
  let end = context.tokenizer.get_pos();
  let end_u8 = context.tokenizer.get_pos().u8_pos;

  let buffer = std::str::from_utf8(&context.tokenizer.source[start_u8..end_u8]).unwrap();

  Ok(ast::AnnotationProperty::Text(ast::Text {
    raws: base_ast::BasicRaws::new(raw_before, None),
    value: buffer.to_string(),
    location: base_ast::Location::new(start.u16_pos, end.u8_pos),
  }))
}

fn parse_declaration_property<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'a [u8]>,
) -> Result<ast::AnnotationProperty, ParseError> {
  let start = context.tokenizer.utf16_pos;

  context.tokenizer.next_expect(Token::At)?;
  let name = get_buffer(context.tokenizer, |tokenizer| {
    Ok(tokenizer.peek(1)? != Token::Byte(b' '))
  })?
  .to_string();

  let mut js_tokenizer =
    JSTokenizer::new_from_bytes(&context.tokenizer.source, context.tokenizer.get_pos());
  let value = parse_js_with_tokenizer(&mut js_tokenizer, "".to_string(), |token| {
    token != JSToken::CurlyClose
  })?;

  context.tokenizer.set_pos(&js_tokenizer.get_pos());

  Ok(ast::AnnotationProperty::Declaration(ast::Declaration {
    name,
    raws: base_ast::BasicRaws::new(raw_before, None),
    value,
    location: base_ast::Location::new(start, context.tokenizer.utf16_pos),
  }))
}
