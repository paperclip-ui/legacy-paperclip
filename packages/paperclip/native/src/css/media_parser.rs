// https://www.w3schools.com/cssref/css_selectors.asp
// https://www.w3schools.com/cssref/css3_pr_mediaquery.asp
// https://www.w3schools.com/cssref/css3_pr_animation-keyframes.asp
// https://www.w3schools.com/cssref/pr_charset_rule.asp

use super::declaration_value_parser::parse_with_tokenizer as parse_decl_value_with_tokenizer;
use super::media_ast::*;
use super::tokenizer::{Token, Tokenizer};
use crate::base::ast::{BasicRaws, Location};
use crate::base::parser::{get_buffer, ParseError};
use crate::core::id_generator::generate_seed;
use crate::core::id_generator::IDGenerator;

type FUntil<'a> = for<'r> fn(&mut Tokenizer<'a>) -> Result<bool, ParseError>;

pub struct Context<'a, 'b> {
  tokenizer: &'b mut Tokenizer<'a>,
  id_generator: IDGenerator,
  until: FUntil<'a>,
}

impl<'a, 'b> Context<'a, 'b> {
  pub fn ended(&mut self) -> Result<bool, ParseError> {
    Ok(self.tokenizer.is_eof() || (self.until)(self.tokenizer)?)
  }
}

// screen and
pub fn parse<'a>(source: &'a str, id_seed: &'a str) -> Result<MediaQueryList, ParseError> {
  let mut tokenizer = Tokenizer::new(&source);
  parse_with_tokenizer(&mut tokenizer, id_seed, |_token| Ok(false))
}

pub fn parse_with_tokenizer<'a>(
  tokenizer: &mut Tokenizer<'a>,
  id_seed: &'a str,
  until: FUntil<'a>,
) -> Result<MediaQueryList, ParseError> {
  let mut context = Context {
    tokenizer,
    until,
    id_generator: IDGenerator::new(id_seed.to_string()),
  };

  parse_media_query_list(&mut context)
}

// screen, print, screen and (max-width: 400px)
fn parse_media_query_list<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<MediaQueryList, ParseError> {
  let mut queries: Vec<MediaQuery> = vec![];

  loop {
    queries.push(parse_media_query(context)?);
    if !context.ended()? {
      context.tokenizer.eat_whitespace();
      context.tokenizer.next_expect(Token::Comma)?;
    } else {
      break;
    }
  }

  Ok(MediaQueryList { queries })
}

fn parse_media_query<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<MediaQuery, ParseError> {
  context.tokenizer.eat_whitespace();

  // only | not
  let only = if let Token::Keyword(keyword) = context.tokenizer.peek(1)? {
    if keyword == "only" {
      context.tokenizer.next()?;
      Some(true)
    } else if keyword == "not" {
      context.tokenizer.next()?;
      Some(false)
    } else {
      None
    }
  } else {
    None
  };

  context.tokenizer.eat_whitespace();

  let media_pos = context.tokenizer.utf16_pos;

  // print, screen, etc
  let media_type = if let Token::Keyword(ident) = context.tokenizer.next()? {
    ident
  } else {
    return Err(ParseError::unexpected_token(media_pos));
  };

  context.tokenizer.eat_whitespace();

  let and_condition = if !context.ended()? {
    if let Token::Keyword(and) = context.tokenizer.peek(1)? {
      if and == "and" {
        context.tokenizer.next()?; // eat "and"
        Some(parse_media_condition_without_or(context)?)
      } else {
        None
      }
    } else {
      None
    }
  } else {
    None
  };

  return Ok(MediaQuery::Ident(MediaIdent {
    only,
    media_type: media_type.to_string(),
    and_condition,
  }));
}

fn parse_media_condition_without_or<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<MediaConditionWithoutOr, ParseError> {
  context.tokenizer.eat_whitespace();

  let not = if context.tokenizer.peek(1)? == Token::Keyword("not") {
    context.tokenizer.next()?;
    true
  } else {
    false
  };

  let left = parse_media_in_parens(context)?;

  if not {
    return Ok(MediaConditionWithoutOr::MediaNot(MediaNot {
      condition: Box::new(left),
    }));
  }

  context.tokenizer.eat_whitespace();

  if !context.ended()? {
    Ok(MediaConditionWithoutOr::MediaAnd(MediaCompound {
      condition: Box::new(left),
      rest: parse_media_condition_rest("and", context)?,
    }))
  } else {
    Ok(MediaConditionWithoutOr::InParens(left))
  }
}

fn parse_media_condition_rest<'a, 'b, 'c>(
  keyword: &'a str,
  context: &mut Context<'a, 'b>,
) -> Result<Vec<MediaInParens>, ParseError> {
  let mut rest: Vec<MediaInParens> = vec![];
  loop {
    context.tokenizer.eat_whitespace();
    context.tokenizer.next_expect(Token::Keyword(keyword))?;
    context.tokenizer.eat_whitespace();
    rest.push(parse_media_in_parens(context)?);
    if context.ended()? {
      break;
    }
  }

  Ok(rest)
}

fn parse_media_in_parens<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<MediaInParens, ParseError> {
  context.tokenizer.eat_whitespace();
  if context.tokenizer.peek(1)? == Token::ParenOpen {
    context.tokenizer.next_expect(Token::ParenOpen)?;
    let inner = parse_media_in_parens_inner(context)?;
    context.tokenizer.next_expect(Token::ParenClose)?;
    Ok(inner)
  } else {
    parse_media_in_parens_inner(context)
  }
}

fn parse_media_in_parens_inner<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<MediaInParens, ParseError> {
  let left = parse_media_feature(context)?;
  Ok(MediaInParens::Feature(left))
}

fn parse_media_feature<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<MediaFeature, ParseError> {
  context.tokenizer.eat_whitespace();
  let pos = context.tokenizer.utf16_pos;
  let name = if let Token::Keyword(keyword) = context.tokenizer.next()? {
    keyword.to_string()
  } else {
    return Err(ParseError::unexpected_token(pos));
  };

  context.tokenizer.eat_whitespace();
  context.tokenizer.next_expect(Token::Colon)?;
  context.tokenizer.eat_whitespace();
  let value = parse_decl_value_with_tokenizer(context.tokenizer, "", |tokenizer| {
    Ok(matches!(
      tokenizer.peek(1)?,
      Token::Whitespace | Token::ParenClose
    ))
  })?;
  Ok(MediaFeature::Plain(MFPlain { name, value }))
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn can_smoke_parse_various_media_queries() {
    let cases = ["screen", "screen and (max-width: 100px)"];

    for case in cases.iter() {
      parse(case, "id").unwrap();
    }
  }
}