use super::ast;
use super::tokenizer::{Token, Tokenizer};
use crate::base::parser::{get_buffer, ParseError};

pub fn parse<'a>(source: &'a str) -> Result<ast::Expression, ParseError> {
  parse_group(Tokenizer::new(source))
}