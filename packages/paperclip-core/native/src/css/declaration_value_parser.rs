// https://www.w3schools.com/cssref/css_selectors.asp
// https://www.w3schools.com/cssref/css3_pr_mediaquery.asp
// https://www.w3schools.com/cssref/css3_pr_animation-keyframes.asp
// https://www.w3schools.com/cssref/pr_charset_rule.asp

use super::declaration_value_ast::*;
use super::tokenizer::{Token, Tokenizer};
use crate::base::parser::{get_buffer, ParseError};
use crate::base::string_scanner::StringScanner;
use crate::core::id_generator::IDGenerator;

type FUntil<'a> = for<'r> fn(&mut Tokenizer<'a>) -> Result<bool, ParseError>;

pub struct Context<'a, 'b> {
  tokenizer: &'a mut Tokenizer<'b>,
  id_generator: IDGenerator,
  until: FUntil<'b>,
}

impl<'a, 'b> Context<'a, 'b> {
  pub fn ended(&mut self) -> Result<bool, ParseError> {
    Ok(self.tokenizer.scanner.is_eof() || (self.until)(&mut self.tokenizer)?)
  }
}

// screen and
pub fn parse<'a>(source: &'a str, id_seed: &'a str) -> Result<Root, ParseError> {
  let scanner = StringScanner::new(source);
  let mut tokenizer = Tokenizer::new_from_scanner(scanner);
  parse_with_tokenizer(&mut tokenizer, id_seed, |_token| Ok(false))
}

pub fn parse_with_tokenizer<'a, 'b>(
  tokenizer: &'a mut Tokenizer<'b>,
  id_seed: &'a str,
  until: FUntil<'b>,
) -> Result<Root, ParseError> {
  let mut context = Context {
    tokenizer,
    until,
    id_generator: IDGenerator::new(id_seed.to_string()),
  };

  parse_root(&mut context)
}

fn parse_root<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Root, ParseError> {
  let value = parse_expression(context)?;
  context.tokenizer.scanner.eat_whitespace();
  let mut important = false;
  if !context.ended()? {
    if context.tokenizer.peek(1)? == Token::Bang
      && context.tokenizer.peek(2)? == Token::Keyword("important")
    {
      important = true;
    } else {
      return Err(ParseError::unexpected_token(
        context
          .tokenizer
          .scanner
          .get_u16pos()
          .range_from(context.tokenizer.scanner.get_u16pos()),
      ));
    }
  }
  Ok(Root { value, important })
}

// red, blue
fn parse_expression<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Expression, ParseError> {
  let mut list = parse_list(context)?;
  if list.items.len() == 1 {
    match list.items.pop().unwrap() {
      ListItem::Group(group) => Ok(Expression::Group(group)),
      ListItem::Value(value) => Ok(Expression::Value(value)),
    }
  } else {
    Ok(Expression::List(list))
  }
}

// red, blue
fn parse_list<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<List, ParseError> {
  let mut items: Vec<ListItem> = vec![];

  loop {
    items.push(parse_list_item(context)?);

    context.tokenizer.scanner.eat_whitespace();

    if context.ended()? || matches!(context.tokenizer.peek(1)?, Token::Bang | Token::ParenClose) {
      break;
    }

    if context.tokenizer.peek(1) == Ok(Token::Comma) {
      context.tokenizer.next()?;
    }
  }

  Ok(List { items })
}

fn parse_list_item<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ListItem, ParseError> {
  let mut parameters: Vec<Value> = vec![];
  context.tokenizer.scanner.eat_whitespace();

  while !context.ended()?
    && !matches!(
      context.tokenizer.peek(1)?,
      Token::Bang | Token::Comma | Token::ParenClose
    )
  {
    parameters.push(parse_add(context)?);
  }

  if parameters.len() == 1 {
    Ok(ListItem::Value(parameters.pop().unwrap()))
  } else {
    Ok(ListItem::Group(Group { parameters }))
  }
}

fn parse_add<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Value, ParseError> {
  let left = parse_mult(context)?;
  if !context.ended()? && matches!(context.tokenizer.peek(1)?, Token::Plus | Token::Minus) {
    return Ok(Value::Operation(Operation {
      left: Box::new(left),
      operation: if context.tokenizer.next()? == Token::Plus {
        "+".to_string()
      } else {
        "-".to_string()
      },
      right: Box::new(parse_add(context)?),
    }));
  } else {
    return Ok(left);
  }
}

fn parse_mult<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Value, ParseError> {
  context.tokenizer.scanner.eat_whitespace();
  let left = parse_value(context)?;
  context.tokenizer.scanner.eat_whitespace();
  if !context.ended()? && matches!(context.tokenizer.peek(1)?, Token::Star | Token::Byte(b'/')) {
    return Ok(Value::Operation(Operation {
      left: Box::new(left),
      operation: if context.tokenizer.next()? == Token::Star {
        "*".to_string()
      } else {
        "/".to_string()
      },
      right: Box::new(parse_mult(context)?),
    }));
  } else {
    return Ok(left);
  }
}

fn parse_value<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Value, ParseError> {
  let pos = context.tokenizer.scanner.get_u16pos();
  let pos2 = context.tokenizer.scanner.get_pos();

  match context.tokenizer.next()? {
    // 10px, 10%, 10em
    Token::Number(value) => {
      let number = Number {
        value: value.to_string(),
      };

      context.tokenizer.scanner.eat_whitespace();
      if !context.ended()? {
        let next = context.tokenizer.peek(1)?;

        let unit_option = match next {
          Token::Keyword(keyword) => Some(keyword.to_string()),
          Token::Byte(b'%') => Some("%".to_string()),
          _ => None,
        };

        if let Some(unit) = unit_option {
          context.tokenizer.next()?;
          return Ok(Value::Dimension(Dimension {
            value: number,
            unit,
          }));
        }
      }

      return Ok(Value::Number(number));
    }
    Token::Keyword(value) => {
      if !context.ended()? {
        let next = context.tokenizer.peek(1)?;
        if next == Token::Whitespace {
          return Ok(Value::Keyword(Keyword {
            value: value.to_string(),
          }));
        } else if next == Token::ParenOpen {
          context.tokenizer.next()?; // eat (
          let parameters = parse_list(context)?;
          context.tokenizer.next_expect(Token::ParenClose)?;
          return Ok(Value::FunctionCall(FunctionCall {
            name: value.to_string(),
            parameters,
          }));
        }
      }
    }
    _ => {}
  }

  context.tokenizer.scanner.set_pos(&pos2);

  let buffer = get_buffer(context.tokenizer, |tokenizer| {
    Ok(!matches!(tokenizer.peek(1)?, Token::Whitespace | Token::Bang | Token::Comma | Token::ParenClose))
  })?;

  return Ok(Value::Raw(Raw {
    value: buffer.to_string()
  }))
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn can_smoke_parse_various_declaration_values() {
    let cases = [
      "10px",
      "100rem",
      "10%",
      "red",
      "red !important",
      "rgba(0,0,0) !important",
      "calc(5rem + 6px * 5em / 5 - 3em)",
      "inset 0 1px 2px rgba(0, 0, 0, 0.15)",
      "15px calc(15px / 3) 4px 2px",
      "url('https://example.com/images/myImg.jpg')",
      "url(\"./arrowSmall-down.svg\")",
      "image(url(mask.png), skyblue, linear-gradient(rgba(0, 0, 0, 1.0), transparent))"
    ];

    for case in cases.iter() {
      let expr = parse(case, "").unwrap();
      // println!("{:?}", expr);
    }
    // panic!("blah");
  }
}
