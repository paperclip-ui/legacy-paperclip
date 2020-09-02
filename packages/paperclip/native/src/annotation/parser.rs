use super::ast;
use super::tokenizer::{Token, Tokenizer};
use crate::base::ast as base_ast;
use crate::base::parser::{get_buffer, ParseError};

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
  context.tokenizer.eat_whitespace();
  match context.tokenizer.peek(0)? {
    Token::Word(_) | Token::Byte(_) | Token::Cluster(_) => parse_text_annotation(context),
    Token::At => parse_declaration_property(context),
  }
}

fn parse_text_annotation<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<ast::AnnotationProperty, ParseError> {
  Err(ParseError::unexpected_token(0))
}

fn parse_declaration_property<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<ast::AnnotationProperty, ParseError> {
  Err(ParseError::unexpected_token(0))
}
