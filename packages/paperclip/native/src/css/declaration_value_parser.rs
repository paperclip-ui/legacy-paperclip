// https://www.w3schools.com/cssref/css_selectors.asp
// https://www.w3schools.com/cssref/css3_pr_mediaquery.asp
// https://www.w3schools.com/cssref/css3_pr_animation-keyframes.asp
// https://www.w3schools.com/cssref/pr_charset_rule.asp

use super::declaration_value_ast::*;
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
pub fn parse<'a>(source: &'a str, id_seed: &'a str) -> Result<Expression, ParseError> {
  let mut tokenizer = Tokenizer::new(&source);
  parse_with_tokenizer(&mut tokenizer, id_seed, |_token| Ok(false))
}

pub fn parse_with_tokenizer<'a>(
  tokenizer: &mut Tokenizer<'a>,
  id_seed: &'a str,
  until: FUntil<'a>,
) -> Result<Expression, ParseError> {
  let mut context = Context {
    tokenizer,
    until,
    id_generator: IDGenerator::new(id_seed.to_string()),
  };

  parse_expression(&mut context)
}

// red, blue
fn parse_expression<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<Expression, ParseError> {
  let mut list = parse_list(context)?;
  if list.items.len() == 1 {
    match list.items.pop().unwrap() {
      ListItem::Group(group) => {
        Ok(Expression::Group(group))
      },
      ListItem::Value(value) => {
        Ok(Expression::Value(value))
      }
    }
  } else {
    Ok(Expression::List(list))
  }
}


// red, blue
fn parse_list<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<List, ParseError> {
  let mut items: Vec<ListItem> = vec![];

  loop {

    items.push(parse_list_item(context)?);

    if context.ended()? {
      break;
    }

    context.tokenizer.eat_whitespace();
    if context.tokenizer.peek(1) == Ok(Token::Comma) {
      context.tokenizer.next()?;
    }
  }

  Ok(List { items })
}

fn parse_list_item<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<ListItem, ParseError> {
  let mut parameters: Vec<Value> = vec![];
  while !context.ended()? && context.tokenizer.peek(1)? != Token::Comma {
    
    parameters.push(parse_value(context)?);
  }

  if parameters.len() == 1 {
    Ok(ListItem::Value(parameters.pop().unwrap()))
  } else {
    Ok(ListItem::Group(Group { parameters }))
  }
}


fn parse_value<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<Value, ParseError> {
  context.tokenizer.eat_whitespace();
  let pos = context.tokenizer.utf16_pos;

  match context.tokenizer.next()? {

    // 10px, 10%, 10em
    Token::Number(value) => {
      let number = Number {
        value: value.to_string()
      };


      context.tokenizer.eat_whitespace();
      if !context.ended()? {
        let next = context.tokenizer.peek(1)?;



        let unit_option = match next {
          Token::Keyword(keyword) => Some(keyword.to_string()),
          Token::Byte(b'%') => Some("%".to_string()),
          _ => {
            None
          }
        };

        if let Some(unit) = unit_option {
          context.tokenizer.next()?;
          return Ok(Value::Dimension(Dimension {
            value: number,
            unit
          }));
        }
      }
      

      return Ok(Value::Number(number));
    },
    _ => {
    }
  }

  return Err(ParseError::unexpected_token(pos));
}


#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn can_smoke_parse_various_declaration_values() {
    let cases = ["10px", "100rem", "10%"];

    for case in cases.iter() {
      parse(case, "id").unwrap();
    }
  }
}
