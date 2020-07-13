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
  let start = context.tokenizer.utf16_pos;
  Ok(Sheet {
    rules: parse_rules(context)?,
    location: Location::new(start, context.tokenizer.utf16_pos),
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
    } else if tok == Token::LineCommentOpen {
      context.tokenizer.next()?;
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
  let start = context.tokenizer.utf16_pos;
  let selector = parse_selector(context)?;
  let (declarations, children) = parse_declaration_body(context)?;
  Ok(StyleRule {
    selector,
    declarations,
    children,
    location: Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_declaration_body<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<(Vec<Declaration>, Vec<StyleRule>), ParseError> {
  eat_superfluous(context)?;
  let block_start = context.tokenizer.utf16_pos;
  context.tokenizer.next_expect(Token::CurlyOpen)?; // eat {
  let declarations = parse_declarations_and_children(context)?;

  eat_superfluous(context)?;
  context
    .tokenizer
    .next_expect(Token::CurlyClose)
    .or(Err(ParseError::unterminated(
      "Unterminated bracket.".to_string(),
      block_start,
      context.tokenizer.utf16_pos,
    )))?;

  eat_superfluous(context)?;
  Ok((declarations))
}

fn parse_at_rule<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Rule, ParseError> {
  let start = context.tokenizer.utf16_pos;
  context.tokenizer.next_expect(Token::At)?;
  let name = parse_selector_name(context)?;
  eat_superfluous(context)?;
  match name {
    "charset" => {
      let start = context.tokenizer.utf16_pos;
      if let Token::Str((value, boundary)) = context.tokenizer.next()? {
        context.tokenizer.next_expect(Token::Semicolon)?;
        Ok(Rule::Charset(value.to_string()))
      } else {
        Err(ParseError::unexpected_token(start))
      }
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
    "mixin" => Ok(Rule::Mixin(parse_mixin_rule(start, context)?)),
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
    _ => Err(ParseError::unexpected_token(context.tokenizer.utf16_pos)),
  }
}

fn parse_export_rule<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<ExportRule, ParseError> {
  let start = context.tokenizer.utf16_pos;
  context.tokenizer.next_expect(Token::CurlyOpen)?;
  eat_superfluous(context)?;

  let mut rules = vec![];

  while context.tokenizer.peek(1)? != Token::CurlyClose {
    rules.push(parse_rule(context)?);
  }

  context.tokenizer.next_expect(Token::CurlyClose)?;

  Ok(ExportRule {
    rules,
    location: Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_condition_rule<'a, 'b>(
  name: String,
  context: &mut Context<'a, 'b>,
) -> Result<ConditionRule, ParseError> {
  let start = context.tokenizer.utf16_pos;
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
    location: Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_mixin_rule<'a, 'b>(
  start: usize,
  context: &mut Context<'a, 'b>,
) -> Result<MixinRule, ParseError> {
  eat_superfluous(context)?;
  let name_start = context.tokenizer.utf16_pos;
  let name = parse_selector_name(context)?.to_string();
  let name_location = Location {
    start: name_start,
    end: context.tokenizer.utf16_pos,
  };

  eat_superfluous(context)?;
  let (declarations, _) = parse_declaration_body(context)?;
  Ok(MixinRule {
    location: Location::new(start, context.tokenizer.utf16_pos),
    name: MixinName {
      value: name,
      location: name_location,
    },
    declarations,
  })
}

fn parse_font_face_rule<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<FontFaceRule, ParseError> {
  let start = context.tokenizer.utf16_pos;
  let (declarations, _children) = parse_declaration_body(context)?;
  Ok(FontFaceRule {
    declarations,
    location: Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_keyframes_rule<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<KeyframesRule, ParseError> {
  let start = context.tokenizer.utf16_pos;
  let name = parse_selector_name(context)?.to_string();

  let mut rules = vec![];
  eat_superfluous(context)?;
  context.tokenizer.next_expect(Token::CurlyOpen)?;

  while !context.tokenizer.is_eof() {
    eat_superfluous(context)?;
    if context.tokenizer.peek(1)? == Token::CurlyClose {
      break;
    }
    rules.push(parse_keyframe_rule(context)?);
  }

  context.tokenizer.next_expect(Token::CurlyClose)?;
  eat_superfluous(context)?;

  Ok(KeyframesRule {
    name,
    rules,

    location: Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_keyframe_rule<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<KeyframeRule, ParseError> {
  let start = context.tokenizer.utf16_pos;

  let key = parse_selector_name(context)?.to_string();
  let (declarations, _children) = parse_declaration_body(context)?;

  Ok(KeyframeRule {
    key,
    declarations,
    location: Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_selector<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Selector, ParseError> {
  parse_group_selector(context)
}

// select, select, select
fn parse_group_selector<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Selector, ParseError> {
  let start = context.tokenizer.utf16_pos;

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
    Ok(Selector::Group(GroupSelector {
      selectors,
      location: Location::new(start, context.tokenizer.utf16_pos),
    }))
  }
}

// // parent > child
fn parse_pair_selector<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Selector, ParseError> {
  let selector = parse_combo_selector(context)?;
  parse_next_pair_selector(selector, context)
}

// // parent > child
fn parse_next_pair_selector<'a, 'b>(
  selector: Selector,
  context: &mut Context<'a, 'b>,
) -> Result<Selector, ParseError> {
  eat_superfluous(context)?;
  let start = context.tokenizer.utf16_pos;
  let delim = context.tokenizer.peek(1)?;
  match delim {
    Token::Byte(b'>') => {
      context.tokenizer.next()?; // eat >
      eat_superfluous(context)?;
      let child = parse_pair_selector(context)?;
      Ok(Selector::Child(ChildSelector {
        parent: Box::new(selector),
        child: Box::new(child),
        location: Location::new(start, context.tokenizer.utf16_pos),
      }))
    }
    Token::Plus => {
      context.tokenizer.next()?; // eat +
      eat_superfluous(context)?;
      let sibling = parse_pair_selector(context)?;
      Ok(Selector::Adjacent(AdjacentSelector {
        selector: Box::new(selector),
        next_sibling_selector: Box::new(sibling),
        location: Location::new(start, context.tokenizer.utf16_pos),
      }))
    }
    Token::Squiggle => {
      context.tokenizer.next()?; // eat ~
      eat_superfluous(context)?;
      let sibling = parse_pair_selector(context)?;
      Ok(Selector::Sibling(SiblingSelector {
        selector: Box::new(selector),
        sibling_selector: Box::new(sibling),
        location: Location::new(start, context.tokenizer.utf16_pos),
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
          location: Location::new(start, context.tokenizer.utf16_pos),
        }))
      } else {
        Ok(selector)
      }
    }
  }
}

// div.combo[attr][another]
fn parse_combo_selector<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Selector, ParseError> {
  let pos = context.tokenizer.utf16_pos;
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
    Ok(Selector::Combo(ComboSelector {
      selectors,
      location: Location::new(pos, context.tokenizer.utf16_pos),
    }))
  }
}
fn parse_combo_selector_selectors<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<Vec<Selector>, ParseError> {
  let pos = context.tokenizer.utf16_pos;
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

fn parse_pseudo_element_selector<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<Selector, ParseError> {
  let mut colon_count = 1;
  let start = context.tokenizer.utf16_pos;
  context.tokenizer.next_expect(Token::Colon)?;

  if context.tokenizer.peek(1)? == Token::Colon {
    colon_count += 1;
    context.tokenizer.next()?;
  }
  let name = parse_selector_name(context)?.to_string();
  let selector: Selector = if context.tokenizer.peek(1)? == Token::ParenOpen {
    context.tokenizer.next()?;
    let selector = if name == "not" {
      let sel = parse_pair_selector(context)?;
      Selector::Not(NotSelector {
        selector: Box::new(sel),
        location: Location::new(start, context.tokenizer.utf16_pos),
      })
    } else if name == "global" {
      let sel = parse_group_selector(context)?;
      Selector::Global(GlobalSelector {
        selector: Box::new(sel),
        location: Location::new(start, context.tokenizer.utf16_pos),
      })
    } else {
      let param = get_buffer(context.tokenizer, |tokenizer| {
        Ok(tokenizer.peek(1)? != Token::ParenClose)
      })?
      .to_string();

      Selector::PseudoParamElement(PseudoParamElementSelector {
        name,
        param,
        location: Location::new(start, context.tokenizer.utf16_pos),
      })
    };

    context.tokenizer.next_expect(Token::ParenClose)?;
    selector
  } else {
    Selector::PseudoElement(PseudoElementSelector {
      separator: ":".to_string().repeat(colon_count),
      name,
      location: Location::new(start, context.tokenizer.utf16_pos),
    })
  };

  Ok(selector)
}

fn parse_element_selector<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Selector, ParseError> {
  let pos = context.tokenizer.utf16_pos;
  let token = context.tokenizer.peek(1)?;
  let selector: Selector = match token {
    Token::Star => {
      context.tokenizer.next()?; // eat *
      Selector::AllSelector
    }
    Token::Colon => parse_pseudo_element_selector(context)?,
    Token::Byte(b'&') => {
      context.tokenizer.next()?; // eat &

      let connector: String = if context.tokenizer.peek(1)? == Token::Whitespace {
        " ".to_string()
      } else {
        get_buffer(context.tokenizer, |tokenizer| {
          Ok(match tokenizer.peek(1)? {
            Token::Keyword(_) | Token::Minus => true,
            _ => false,
          })
        })?
        .to_string()
      };

      let mut postfix_selectors = parse_combo_selector_selectors(context)?;
      let postfix_selector = if postfix_selectors.len() == 0 {
        None
      } else if postfix_selectors.len() == 1 {
        Some(Box::new(postfix_selectors.pop().unwrap()))
      } else {
        Some(Box::new(Selector::Combo(ComboSelector {
          selectors: postfix_selectors,
          location: Location::new(pos, context.tokenizer.utf16_pos),
        })))
      };

      Selector::Prefixed(PrefixedSelector {
        connector,
        postfix_selector,
        location: Location::new(pos, context.tokenizer.utf16_pos),
      })
    }
    Token::Dot => {
      context.tokenizer.next()?;
      Selector::Class(ClassSelector {
        class_name: parse_selector_name(context)?.to_string(),
        location: Location::new(pos, context.tokenizer.utf16_pos),
      })
    }
    Token::Hash => {
      context.tokenizer.next()?;
      Selector::Id(IdSelector {
        id: parse_selector_name(context)?.to_string(),
        location: Location::new(pos, context.tokenizer.utf16_pos),
      })
    }
    Token::SquareOpen => {
      context.tokenizer.next()?;
      parse_attribute_selector(context)?
    }
    Token::Keyword(_) => Selector::Element(ElementSelector {
      tag_name: parse_selector_name(context)?.to_string(),
      location: Location::new(pos, context.tokenizer.utf16_pos),
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

  let start = context.tokenizer.utf16_pos;
  let mut operator: Option<String> = None;

  match context.tokenizer.peek(1)? {
    Token::Equals
    | Token::SquiggleEqual
    | Token::PipeEqual
    | Token::CaretEqual
    | Token::DollarEqual
    | Token::StarEqual => {
      context.tokenizer.next();

      // ick, but okay.
      operator = Some(
        std::str::from_utf8(&context.tokenizer.get_source()[start..context.tokenizer.utf16_pos])
          .unwrap()
          .to_string(),
      );

      value = Some(parse_attribute_selector_value(context)?);
    }
    Token::SquareClose => {
      // do nothing
    }
    _ => {
      return Err(ParseError::unexpected_token(start));
    }
  };

  context.tokenizer.next_expect(Token::SquareClose)?;

  Ok(Selector::Attribute(AttributeSelector {
    name,
    operator,
    value,
    location: Location::new(start, context.tokenizer.utf16_pos),
  }))
}

fn parse_attribute_selector_value<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<String, ParseError> {
  let initial = context.tokenizer.peek(1)?;
  let value = if let Token::Str((value, boundary)) = initial {
    context.tokenizer.next()?;
    format!("{}{}{}", boundary, value, boundary)
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
    | Token::Str(_)
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
      Token::Keyword(_) => true,
      _ => false,
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

    if let Token::Byte(b'&') = context.tokenizer.peek(1)? {
      children.push(parse_style_rule2(context)?);
    } else if context.tokenizer.peek(1)? == Token::At {
      declarations.push(parse_include_declaration(context)?);
    } else {
      declarations.push(parse_key_value_declaration(context)?);

      // NOTE - some scenarios require & to be used (like "& > .child"), so
      // this is turned off until that's resolved (if it ever is).

      // let pos = context.tokenizer.get_pos();
      // let mut is_declaration = true;

      // while !context.ended()? {
      //   let tok = context.tokenizer.next()?;
      //   if tok== Token::Colon {
      //     break;
      //   } else if tok == Token::CurlyOpen {
      //     is_declaration = false;
      //     break;
      //   }
      // }

      // context.tokenizer.set_pos(pos);

      // if is_declaration {
      //   declarations.push(parse_key_value_declaration(context)?);
      // } else {
      //   children.push(parse_style_rule2(context)?);
      // }
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
  let start = context.tokenizer.utf16_pos;
  context.tokenizer.next_expect(Token::At)?;
  context.tokenizer.next_expect(Token::Keyword("include"))?;
  eat_superfluous(context)?;
  let mut mixins: Vec<IncludeDeclarationReference> = vec![];

  while !context.tokenizer.is_eof() {
    let ref_start = context.tokenizer.utf16_pos;
    let mut mixin_path: Vec<IncludeDeclarationPart> = vec![];

    while !context.tokenizer.is_eof() {
      let start = context.tokenizer.get_pos();
      if let Token::Keyword(keyword) = context.tokenizer.next()? {
        mixin_path.push(IncludeDeclarationPart {
          name: keyword.to_string(),
          location: Location::new(start.u16_pos, context.tokenizer.utf16_pos),
        });
        if context.tokenizer.peek(1)? != Token::Dot {
          break;
        }
        context.tokenizer.next();
      } else {
        return Err(ParseError::unexpected_token(start.u16_pos));
      }
    }
    mixins.push(IncludeDeclarationReference {
      parts: mixin_path,
      location: Location::new(ref_start, context.tokenizer.utf16_pos),
    });

    if context.tokenizer.peek(1)? != Token::Whitespace {
      break;
    }

    context.tokenizer.next()?;
  }

  if context.tokenizer.peek(1)? == Token::Semicolon {
    context.tokenizer.next()?; // eat ;
  }

  Ok(Declaration::Include(IncludeDeclaration {
    mixins,
    location: Location::new(start, context.tokenizer.utf16_pos),
  }))
}

fn parse_key_value_declaration<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<Declaration, ParseError> {
  let start = context.tokenizer.utf16_pos;
  if let Token::Keyword(keyword) = context.tokenizer.next()? {
    let name = keyword.to_string();
    let name_end = context.tokenizer.utf16_pos;
    context.tokenizer.next_expect(Token::Colon)?; // eat :
    eat_superfluous(context)?;

    let value_start = context.tokenizer.utf16_pos;
    let value = parse_declaration_value(context)?;
    let value_end = context.tokenizer.utf16_pos;

    if context.tokenizer.peek(1)? == Token::Semicolon {
      context.tokenizer.next()?; // eat ;
    }

    let end = context.tokenizer.utf16_pos;

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
      Token::Str((value, boundary)) => {
        context.tokenizer.next();
        buffer.push_str(format!("{}{}{}", boundary, value, boundary).as_str());
      }
      _ => {
        buffer.push(context.tokenizer.curr_byte()? as char);
        context.tokenizer.forward(1);
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
    [attr~=value] {}
    [attr|=value] {}
    [attr^=value] {}
    [attr$=value] {}
    [attr*=value] {}
    [attr='value'] {}
    [attr=\"value\"] {}

    // comment

    /* don't not work */

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
    .selector {
      &__test {}
    }
    // comment
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
        & div {
          color: red;
        }
        & .span {
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
        &.child {
          
        }
      }

      a {
        & b, c {
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
