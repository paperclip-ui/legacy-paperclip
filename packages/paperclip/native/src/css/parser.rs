// https://www.w3schools.com/cssref/css_selectors.asp
// https://www.w3schools.com/cssref/css3_pr_mediaquery.asp
// https://www.w3schools.com/cssref/css3_pr_animation-keyframes.asp
// https://www.w3schools.com/cssref/pr_charset_rule.asp

use super::ast::*;
use super::tokenizer::{Token, Tokenizer};
use crate::base::ast::Location;
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

pub fn parse<'a>(source: &'a str) -> Result<Sheet, ParseError> {
  let mut tokenizer = Tokenizer::new(&source);
  parse_with_tokenizer(&mut tokenizer, |_token| Ok(false))
}

pub fn parse_with_tokenizer<'a>(
  tokenizer: &mut Tokenizer<'a>,
  until: FUntil<'a>,
) -> Result<Sheet, ParseError> {
  let mut context = Context { tokenizer, until };

  parse_sheet(&mut context)
}

fn eat_comments<'a, 'b>(
  context: &mut Context<'a, 'b>,
  start: Token,
  end: Token,
) -> Result<(), ParseError> {
  if context.ended()? || context.tokenizer.peek(1)? != start {
    return Ok(());
  }
  context.tokenizer.next()?; // eat <!--
  while !context.tokenizer.is_eof() {
    let curr = context.tokenizer.next()?;
    if curr == end {
      break;
    }
  }
  Ok(())
}

fn parse_sheet<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Sheet, ParseError> {
  Ok(Sheet {
    rules: parse_rules(context)?,
  })
}

fn parse_rules<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Vec<Rule>, ParseError> {
  let mut rules = vec![];
  eat_superfluous(context)?;
  while !context.ended()? {
    rules.push(parse_rule(context)?);
    eat_superfluous(context)?;
  }
  Ok(rules)
}

fn eat_superfluous<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<(), ParseError> {
  while !context.ended()? {
    let tok = context.tokenizer.peek(1).unwrap();
    if tok == Token::Whitespace {
      context.tokenizer.next()?;
    } else if tok == Token::ScriptCommentOpen {
      eat_script_comments(context)?;
    } else {
      break;
    }
  }
  Ok(())
}

fn parse_rule<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Rule, ParseError> {
  eat_superfluous(context)?;
  match context.tokenizer.peek(1)? {
    Token::At => parse_at_rule(context),
    _ => parse_style_rule(context),
  }
}

fn parse_style_rule<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Rule, ParseError> {
  Ok(Rule::Style(parse_style_rule2(context)?))
}

fn parse_style_rule2<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<StyleRule, ParseError> {
  let selector = parse_selector(context)?;
  let (declarations, children) = parse_declaration_body(context)?;
  Ok(StyleRule {
    selector,
    declarations,
    children,
  })
}

fn parse_declaration_body<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<(Vec<Declaration>, Vec<StyleRule>), ParseError> {
  eat_superfluous(context)?;
  let block_start = context.tokenizer.pos;
  context.tokenizer.next_expect(Token::CurlyOpen)?; // eat {
  let declarations = parse_declarations_and_children(context)?;

  eat_superfluous(context)?;
  context
    .tokenizer
    .next_expect(Token::CurlyClose)
    .or(Err(ParseError::unterminated(
      "Unterminated bracket.".to_string(),
      block_start,
      context.tokenizer.pos,
    )))?;

  eat_superfluous(context)?;
  Ok((declarations))
}

fn parse_at_rule<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Rule, ParseError> {
  context.tokenizer.next_expect(Token::At)?;
  let name = parse_selector_name(context)?;
  eat_superfluous(context)?;
  match name {
    "charset" => {
      let value = parse_string(context)?;
      context.tokenizer.next_expect(Token::Semicolon)?;
      Ok(Rule::Charset(value.to_string()))
    }
    "namespace" => {
      let value = get_buffer(context.tokenizer, |tokenizer| {
        Ok(tokenizer.peek(1)? != Token::Semicolon)
      })?;
      context.tokenizer.next_expect(Token::Semicolon)?;
      Ok(Rule::Namespace(value.to_string()))
    }
    "supports" => Ok(Rule::Supports(parse_condition_rule(
      name.to_string(),
      context,
    )?)),
    "mixin" => Ok(Rule::Mixin(parse_mixin_rule(context)?)),
    "media" => Ok(Rule::Media(parse_condition_rule(
      name.to_string(),
      context,
    )?)),
    "export" => Ok(Rule::Export(parse_export_rule(context)?)),
    "keyframes" => Ok(Rule::Keyframes(parse_keyframes_rule(context)?)),
    "font-face" => Ok(Rule::FontFace(parse_font_face_rule(context)?)),
    "document" => Ok(Rule::Document(parse_condition_rule(
      name.to_string(),
      context,
    )?)),
    "page" => Ok(Rule::Page(parse_condition_rule(name.to_string(), context)?)),
    _ => Err(ParseError::unexpected_token(context.tokenizer.pos)),
  }
}

fn parse_export_rule<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ExportRule, ParseError> {
  context.tokenizer.next_expect(Token::CurlyOpen)?;
  eat_superfluous(context)?;

  let mut rules = vec![];

  while context.tokenizer.peek(1)? != Token::CurlyClose {
    rules.push(parse_rule(context)?);
  }

  context.tokenizer.next_expect(Token::CurlyClose)?;

  Ok(ExportRule { rules })
}

fn parse_condition_rule<'a, 'b>(
  name: String,
  context: &mut Context<'a, 'b>,
) -> Result<ConditionRule, ParseError> {
  let condition_text = get_buffer(context.tokenizer, |tokenizer| {
    Ok(tokenizer.peek(1)? != Token::CurlyOpen)
  })?
  .to_string();

  context.tokenizer.next_expect(Token::CurlyOpen)?;
  eat_superfluous(context)?;

  let mut rules = vec![];

  while context.tokenizer.peek(1)? != Token::CurlyClose {
    rules.push(parse_style_rule2(context)?);
  }
  context.tokenizer.next_expect(Token::CurlyClose)?;

  Ok(ConditionRule {
    name,
    condition_text,
    rules,
  })
}

fn parse_mixin_rule<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<MixinRule, ParseError> {
  let name = parse_selector_name(context)?.to_string();
  eat_superfluous(context)?;
  let (declarations, _) = parse_declaration_body(context)?;
  Ok(MixinRule { name, declarations })
}

fn parse_font_face_rule<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<FontFaceRule, ParseError> {
  let (declarations, _children) = parse_declaration_body(context)?;
  Ok(FontFaceRule { declarations })
}

fn parse_keyframes_rule<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<KeyframesRule, ParseError> {
  let name = parse_selector_name(context)?.to_string();

  let mut rules = vec![];
  eat_superfluous(context)?;
  context.tokenizer.next_expect(Token::CurlyOpen)?;

  while context.tokenizer.peek(1)? != Token::CurlyClose {
    rules.push(parse_keyframe_rule(context)?);
  }

  context.tokenizer.next_expect(Token::CurlyClose)?;

  Ok(KeyframesRule { name, rules })
}

fn parse_keyframe_rule<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<KeyframeRule, ParseError> {
  let key = parse_selector_name(context)?.to_string();
  let (declarations, _children) = parse_declaration_body(context)?;

  Ok(KeyframeRule { key, declarations })
}

fn parse_selector<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Selector, ParseError> {
  parse_group_selector(context)
}

// select, select, select
fn parse_group_selector<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Selector, ParseError> {
  let mut selectors: Vec<Selector> = vec![];
  loop {
    eat_superfluous(context)?;
    selectors.push(parse_pair_selector(context)?);
    eat_superfluous(context)?;
    if context.tokenizer.peek(1)? == Token::Comma {
      context.tokenizer.next()?; // eat ,
    } else {
      break;
    }
  }
  if selectors.len() == 1 {
    Ok(selectors.pop().unwrap())
  } else {
    Ok(Selector::Group(GroupSelector { selectors }))
  }
}

// // parent > child
fn parse_pair_selector<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Selector, ParseError> {
  let selector = parse_psuedo_element_selector(context)?;
  parse_next_pair_selector(selector, context)
}

// // parent > child
fn parse_next_pair_selector<'a, 'b>(
  selector: Selector,
  context: &mut Context<'a, 'b>,
) -> Result<Selector, ParseError> {
  eat_superfluous(context)?;
  let delim = context.tokenizer.peek(1)?;
  match delim {
    Token::Byte(b'>') => {
      context.tokenizer.next()?; // eat >
      eat_superfluous(context)?;
      let child = parse_pair_selector(context)?;
      Ok(Selector::Child(ChildSelector {
        parent: Box::new(selector),
        child: Box::new(child),
      }))
    }
    Token::Plus => {
      context.tokenizer.next()?; // eat +
      eat_superfluous(context)?;
      let sibling = parse_pair_selector(context)?;
      Ok(Selector::Adjacent(AdjacentSelector {
        selector: Box::new(selector),
        next_sibling_selector: Box::new(sibling),
      }))
    }
    Token::Squiggle => {
      context.tokenizer.next()?; // eat ~
      eat_superfluous(context)?;
      let sibling = parse_pair_selector(context)?;
      Ok(Selector::Sibling(SiblingSelector {
        selector: Box::new(selector),
        sibling_selector: Box::new(sibling),
      }))
    }
    Token::CurlyOpen => Ok(selector),
    _ => {
      // try parsing child
      let descendent_result = parse_pair_selector(context);
      if let Ok(descendent) = descendent_result {
        Ok(Selector::Descendent(DescendentSelector {
          parent: Box::new(selector),
          descendent: Box::new(descendent),
        }))
      } else {
        Ok(selector)
      }
    }
  }
}

// div.combo[attr][another]
fn parse_combo_selector<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Selector, ParseError> {
  let pos = context.tokenizer.pos;
  let mut selectors = vec![];
  loop {
    let result = parse_element_selector(context);
    if let Ok(child_selector) = result {
      selectors.push(child_selector);
    } else {
      break;
    }
  }
  if selectors.len() == 0 {
    return Err(ParseError::unexpected_token(pos));
  }

  if selectors.len() == 1 {
    Ok(selectors.pop().unwrap())
  } else {
    Ok(Selector::Combo(ComboSelector { selectors }))
  }
}
fn parse_combo_selector_selectors<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<Vec<Selector>, ParseError> {
  let pos = context.tokenizer.pos;
  let mut selectors = vec![];
  loop {
    let result = parse_element_selector(context);
    if let Ok(child_selector) = result {
      selectors.push(child_selector);
    } else {
      break;
    }
  }
  Ok(selectors)
}

// fn parse_prefixed_selector<'a, 'b>(
//   context: &mut Context<'a, 'b>,
// ) -> Result<Selector, ParseError> {
//   eat_superfluous(context)?;
//   if context.tokenizer.peek(1)? == Token::Byte(b'&') {
//     context.tokenizer.next_expect(Token::Byte(b'&'))?; // eat &
//     let mut connector = context.tokenizer.peek(1)? == Token::Whitespace {
//       context.tokenizer.next()?;
//       " ".to_string()
//     } else {
//       "".to_string()
//     }

//     eat_superfluous(context)?;

//     let postfix_selector = if context.tokenizer.peek(1)? == Token::CurlyOpen || context.tokenizer.peek(1)? == Token::Comma {
//       None
//     } else {
//       Some(Box::new(parse_next_pair_selector(Selector::None, context)?))
//     };

//     Ok(Selector::Prefixed(PrefixedSelector {
//       connector,
//       postfix_selector
//     }))
//   } else {
//     parse_psuedo_element_selector(context)
//   }
// }

fn parse_psuedo_element_selector<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<Selector, ParseError> {
  let mut colon_count = 1;

  let target: Option<Box<Selector>> = if context.tokenizer.peek(1)? != Token::Colon {
    Some(Box::new(parse_combo_selector(context)?))
  } else {
    None
  };

  if context.tokenizer.peek(1)? != Token::Colon {
    if let Some(selector) = target {
      return Ok(*selector);
    } else {
      return Err(ParseError::unexpected_token(context.tokenizer.pos));
    }
  }

  context.tokenizer.next()?;
  if context.tokenizer.peek(1)? == Token::Colon {
    colon_count += 1;
    context.tokenizer.next()?;
  }
  let name = parse_selector_name(context)?.to_string();
  eat_superfluous(context)?;
  let selector: Selector = if context.tokenizer.peek(1)? == Token::ParenOpen {
    context.tokenizer.next()?;
    let selector = if name == "not" {
      let sel = parse_pair_selector(context)?;
      Selector::Not(NotSelector {
        selector: Box::new(sel),
      })
    } else if name == "global" {
      let sel = parse_group_selector(context)?;
      Selector::Global(GlobalSelector {
        selector: Box::new(sel),
      })
    } else {
      let param = get_buffer(context.tokenizer, |tokenizer| {
        Ok(tokenizer.peek(1)? != Token::ParenClose)
      })?
      .to_string();

      Selector::PseudoParamElement(PseudoParamElementSelector {
        target,
        name,
        param,
      })
    };

    context.tokenizer.next_expect(Token::ParenClose)?;
    selector
  } else {
    Selector::PseudoElement(PseudoElementSelector {
      separator: ":".to_string().repeat(colon_count),
      target,
      name,
    })
  };

  Ok(selector)
}

fn parse_element_selector<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Selector, ParseError> {
  let pos = context.tokenizer.pos;
  let token = context.tokenizer.peek(1)?;
  let selector: Selector = match token {
    Token::Star => {
      context.tokenizer.next()?; // eat *
      Selector::AllSelector
    }
    Token::Byte(b'&') => {
      context.tokenizer.next()?; // eat &

      let mut connector: String = if context.tokenizer.peek(1)? == Token::Whitespace {
        " ".to_string()
      } else {
        get_buffer(context.tokenizer, |tokenizer| {
          Ok(match tokenizer.peek(1)? {
            Token::Keyword(_) => true,
            _ => false,
          })
        })?
        .to_string()
      };

      eat_superfluous(context)?;

      let postfix_selector = if context.tokenizer.peek(1)? == Token::Colon {
        Some(Box::new(parse_psuedo_element_selector(context)?))
      } else {
        let mut postfix_selectors = parse_combo_selector_selectors(context)?;
        if postfix_selectors.len() == 0 {
          None
        } else if postfix_selectors.len() == 1 {
          Some(Box::new(postfix_selectors.pop().unwrap()))
        } else {
          Some(Box::new(Selector::Combo(ComboSelector {
            selectors: postfix_selectors,
          })))
        }
      };

      Selector::Prefixed(PrefixedSelector {
        connector,
        postfix_selector,
      })
    }
    Token::Dot => {
      context.tokenizer.next()?;
      Selector::Class(ClassSelector {
        class_name: parse_selector_name(context)?.to_string(),
      })
    }
    Token::Hash => {
      context.tokenizer.next()?;
      Selector::Id(IdSelector {
        id: parse_selector_name(context)?.to_string(),
      })
    }
    Token::SquareOpen => {
      context.tokenizer.next()?;
      parse_attribute_selector(context)?
    }
    Token::Keyword(_) => Selector::Element(ElementSelector {
      tag_name: parse_selector_name(context)?.to_string(),
    }),
    _ => {
      return Err(ParseError::unexpected_token(pos));
    }
  };
  Ok(selector)
}

fn parse_attribute_selector<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Selector, ParseError> {
  let name = parse_attribute_name(context)?.to_string();
  let mut value = None;
  if context.tokenizer.peek(1)? == Token::Equals {
    context.tokenizer.next()?; // eat =
    value = Some(parse_attribute_selector_value(context)?);
  }

  context.tokenizer.next_expect(Token::SquareClose)?;

  Ok(Selector::Attribute(AttributeSelector { name, value }))
}

fn parse_string<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<String, ParseError> {
  let initial = context.tokenizer.next()?; // eat quote
  let qoute = if initial == Token::SingleQuote {
    "'"
  } else {
    "\""
  };

  let buffer = get_buffer(context.tokenizer, |tokenizer| {
    Ok(tokenizer.peek(1)? != initial)
  })?;
  context.tokenizer.next_expect(initial)?; // eat quote
  Ok(format!("{}{}{}", qoute, buffer, qoute))
}

fn parse_attribute_selector_value<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<String, ParseError> {
  let initial = context.tokenizer.peek(1)?;
  let value = if initial == Token::SingleQuote || initial == Token::DoubleQuote {
    parse_string(context)?
  } else {
    get_buffer(context.tokenizer, |tokenizer| {
      Ok(tokenizer.peek(1)? != Token::SquareClose)
    })?
    .to_string()
  };

  Ok(value)
}

fn part_of_selector_name(token: &Token) -> bool {
  match token {
    Token::Whitespace
    | Token::Comma
    | Token::Colon
    | Token::ParenOpen
    | Token::Semicolon
    | Token::ParenClose
    | Token::SingleQuote
    | Token::DoubleQuote
    | Token::Dot
    | Token::Hash
    | Token::Squiggle
    | Token::Byte(b'>')
    | Token::Byte(b'&')
    | Token::CurlyOpen
    | Token::SquareOpen
    | Token::SquareClose => false,
    _ => true,
  }
}

fn parse_selector_name<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<&'a str, ParseError> {
  eat_superfluous(context)?;
  get_buffer(context.tokenizer, |tokenizer| {
    let tok = tokenizer.peek(1)?;
    Ok(part_of_selector_name(&tok))
  })
}

fn parse_attribute_name<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<&'a str, ParseError> {
  get_buffer(context.tokenizer, |tokenizer| {
    let tok = tokenizer.peek(1)?;
    Ok(match tok {
      Token::Whitespace
      | Token::Comma
      | Token::Colon
      | Token::ParenOpen
      | Token::ParenClose
      | Token::Equals
      | Token::SingleQuote
      | Token::DoubleQuote
      | Token::Dot
      | Token::Hash
      | Token::Squiggle
      | Token::Byte(b'>')
      | Token::Byte(b'&')
      | Token::CurlyOpen
      | Token::SquareOpen
      | Token::SquareClose => false,
      _ => true,
    })
  })
}

fn parse_declarations_and_children<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<(Vec<Declaration>, Vec<StyleRule>), ParseError> {
  let mut declarations = vec![];
  let mut children = vec![];
  eat_superfluous(context)?;
  while !context.ended()? {
    if context.tokenizer.peek(1)? == Token::CurlyClose {
      break;
    }

    // ick ick.
    if let Token::Keyword(_) = context.tokenizer.peek(1)? {
      if context.tokenizer.peek(2)? == Token::Colon {
        declarations.push(parse_key_value_declaration(context)?);
      } else {
        children.push(parse_style_rule2(context)?);
      }
    } else if context.tokenizer.peek(1)? == Token::At {
      declarations.push(parse_include_declaration(context)?);
    } else {
      children.push(parse_style_rule2(context)?);
    }

    eat_superfluous(context)?;
  }

  Ok((declarations, children))
}

fn eat_script_comments<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<(), ParseError> {
  eat_comments(context, Token::ScriptCommentOpen, Token::ScriptCommentClose)
}

// fn parse_child_style_rule2<'a, 'b>(
//   context: &mut Context<'a, 'b>,
// ) -> Result<ChildStyleRule, ParseError> {
//   let selector = parse_group_selector(context)?;

//   while !context.tokenizer.is_eof() {
//     // look for things like &--primary
//     let connector = if context.tokenizer.peek(1)? == Token::Byte(b'&') {
//       context.tokenizer.next()?;
//       get_buffer(context.tokenizer, |tokenizer| {
//         let token = tokenizer.peek(1)?;
//         Ok(part_of_selector_name(&token) || token == Token::Whitespace)
//       })?
//       .to_string()
//     } else {
//       " ".to_string()
//     };

//     eat_superfluous(context)?;

//     let selector: Option<Selector> = if context.tokenizer.peek(1)? == Token::CurlyOpen {
//       None
//     } else {
//       Some(parse_next_pair_selector(Selector::None, context)?)
//     };

//     selectors.push(ChildRuleSelector {
//       connector,
//       selector,
//     });

//     eat_superfluous(context)?;

//     if context.tokenizer.peek(1)? != Token::Comma {
//       break;
//     }
//     context.tokenizer.next()?;

//     eat_superfluous(context)?;
//   }

//   context.tokenizer.next_expect(Token::CurlyOpen)?; // eat {

//   let (declarations, children) = parse_declarations_and_children(context)?;
//   context.tokenizer.next_expect(Token::CurlyClose)?; // eat }
//   eat_superfluous(context)?;

//   Ok(ChildStyleRule {
//     selectors,
//     declarations,
//     children,
//   })
// }

fn parse_declaration<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Declaration, ParseError> {
  if context.tokenizer.peek(1)? == Token::At {
    parse_include_declaration(context)
  } else {
    parse_key_value_declaration(context)
  }
}
fn parse_include_declaration<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<Declaration, ParseError> {
  context.tokenizer.next_expect(Token::At)?;
  context.tokenizer.next_expect(Token::Keyword("include"))?;
  eat_superfluous(context)?;
  let mut mixins: Vec<Vec<String>> = vec![];

  while !context.tokenizer.is_eof() {
    let mut mixin_path: Vec<String> = vec![];

    while !context.tokenizer.is_eof() {
      let start = context.tokenizer.pos;
      if let Token::Keyword(keyword) = context.tokenizer.next()? {
        mixin_path.push(keyword.to_string());
        if context.tokenizer.peek(1)? != Token::Dot {
          break;
        }
        context.tokenizer.next();
      } else {
        return Err(ParseError::unexpected_token(start));
      }
    }
    mixins.push(mixin_path);

    if context.tokenizer.peek(1)? != Token::Whitespace {
      break;
    }

    context.tokenizer.next()?;
  }

  if context.tokenizer.peek(1)? == Token::Semicolon {
    context.tokenizer.next()?; // eat ;
  }

  Ok(Declaration::Include(IncludeDeclaration { mixins }))
}

fn parse_key_value_declaration<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<Declaration, ParseError> {
  let start = context.tokenizer.pos;
  if let Token::Keyword(keyword) = context.tokenizer.next()? {
    let name = keyword.to_string();
    let name_end = context.tokenizer.pos;
    context.tokenizer.next_expect(Token::Colon)?; // eat :
    eat_superfluous(context)?;

    let value_start = context.tokenizer.pos;
    let value = parse_declaration_value(context)?;
    let value_end = context.tokenizer.pos;

    if context.tokenizer.peek(1)? == Token::Semicolon {
      context.tokenizer.next()?; // eat ;
    }

    let end = context.tokenizer.pos;

    eat_superfluous(context)?;

    Ok(Declaration::KeyValue(KeyValueDeclaration {
      name,
      value,
      location: Location { start, end },
      name_location: Location {
        start,
        end: name_end,
      },
      value_location: Location {
        start: value_start,
        end: value_end,
      },
    }))
  } else {
    return Err(ParseError::unexpected_token(start));
  }
}

fn parse_declaration_value<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<String, ParseError> {
  let mut buffer = String::new();
  while !context.tokenizer.is_eof() {
    match context.tokenizer.peek(1)? {
      Token::Semicolon | Token::CurlyClose => {
        break;
      }
      Token::SingleQuote | Token::DoubleQuote => {
        buffer.push_str(parse_string(context)?.as_str());
      }
      _ => {
        buffer.push(context.tokenizer.curr_char()? as char);
        context.tokenizer.pos += 1;
      }
    };
  }
  Ok(buffer)
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn can_smoke_parse_various_selectors() {
    let source = "
    .selector {}
    selector {}
    #id {}
    [attr] {}
    [attr=value] {}
    [attr='value'] {}
    [attr=\"value\"] {}

    /* TODO */
    /*[attr~=\"value\"] {}*/
    a, b {}
    a.b.c {}
    a#id {}
    a[attr] {}
    a[attr][ab] {}
    a5d, b, c, d {}
    a.b, c[d][e], [f], g, .h {}
    a > b {}
    a > b[attr] {}
    a > b, c, d {}
    a ~ b {}
    a + b {}
    a + b, c, d[e=f] {}
    :before {}
    ::after {}
    :not(:after) {}
    :not(.a.b > c ~ d + e) {}
    :global(.test) {}
    ";

    parse(source).unwrap();
  }

  #[test]
  fn can_smoke_parse_various_at_rules() {
    let source = "
      div {
        color: blue;
      }
      @charset \"utf-8\";
      @namespace svg \"http://google.com\";
      @font-face {
        font-family: 'abcd';
      }
      @keyframes abc {
        0% {
          color: red;
        }
        100% {
          color: red;
        }
      }
      @media (max-width:640px){._3nRJIwLuth2pKYrXnr2jPN{width:360px } }
      @media print {
        div {
          color: red;
        }
        .span {
          color: blue;
        }
      }
      @page :first {
  
      }
      @supports (display: flex) {
        .el {
          display: flex;
        }
      }

      @media ab {._a{a:b;}}

      .test {
        background: url(';');
      }
      @mixin a {
        color: red;
      }
      @export {
        @mixin a {
          color: red;
        }
        .a {
          color: c;
        }
      }
      .a {
        @include a.b;
      }


      .parent {
        &-child {

        }
        &>.child {

        }
        & .child {
          
        }
      }

      a {
        b, c {
          color: red;
        }
        &--d, &--e {

        }
      }
    ";

    parse(source).unwrap();
  }

  ///
  /// Error handling
  ///

  #[test]
  fn displays_an_error_for_unterminated_curly_bracket() {
    assert_eq!(
      parse("div { "),
      Err(ParseError::unterminated(
        "Unterminated bracket.".to_string(),
        4,
        6
      ))
    );
  }
}
