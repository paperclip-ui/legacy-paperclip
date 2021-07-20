// https://www.w3schools.com/cssref/css_selectors.asp
// https://www.w3schools.com/cssref/css3_pr_mediaquery.asp
// https://www.w3schools.com/cssref/css3_pr_animation-keyframes.asp
// https://www.w3schools.com/cssref/pr_charset_rule.asp

use super::ast::*;
use super::tokenizer::{Token, Tokenizer};
use crate::base::ast::{BasicRaws, Location};
use crate::base::parser::{get_buffer, ParseError};
use crate::core::id_generator::generate_seed;
use crate::core::id_generator::IDGenerator;

type FUntil<'a> = for<'r> fn(&mut Tokenizer<'a>) -> Result<bool, ParseError>;

pub struct Context<'a, 'b> {
  tokenizer: &'b mut Tokenizer<'a>,
  until: FUntil<'a>,
  id_generator: IDGenerator,
}

impl<'a, 'b> Context<'a, 'b> {
  pub fn ended(&mut self) -> Result<bool, ParseError> {
    Ok(self.tokenizer.is_eof() || (self.until)(self.tokenizer)?)
  }
}


pub fn parse<'a>(source: &'a str, id_seed: &'a str) -> Result<Sheet, ParseError> {
  let mut tokenizer = Tokenizer::new(&source);
  parse_with_tokenizer(&mut tokenizer, id_seed, |_token| Ok(false))
}

pub fn parse_selector<'a>(selector: &'a str, id_seed: Option<String>) -> Result<Selector, ParseError> {
  let rule = format!("{}{{}}", selector);

  let id_seed2 = id_seed.unwrap_or(generate_seed());
  let ast: Sheet = if let Ok(ast) = parse(&rule, id_seed2.as_str()) {
    ast
  } else {
    return Err(ParseError::unexpected(format!("Unable to parse selector \"{}\"", selector), 0, 0));
  };
  
  let rule = ast.rules.get(0).unwrap();

  match rule {
    Rule::Style(style) => {
      return Ok(style.selector.clone());
    }
    _ => {
      return Err(ParseError::unknown());
    }
  }
}

pub fn parse_with_tokenizer<'a>(
  tokenizer: &mut Tokenizer<'a>,
  id_seed: &'a str,
  until: FUntil<'a>,
) -> Result<Sheet, ParseError> {
  let mut context = Context {
    tokenizer,
    until,
    id_generator: IDGenerator::new(id_seed.to_string()),
  };

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

  let raw_before = eat_superfluous(context)?;

  let (rules, declarations) = parse_rules_and_declarations(context)?;
  Ok(Sheet {
    id: context.id_generator.new_id(),
    raws: BasicRaws::new(raw_before, None),
    rules,
    declarations,
    location: Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_rules_and_declarations<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<(Vec<Rule>, Vec<Declaration>), ParseError> {
  let mut rules = vec![];
  let mut declarations = vec![];
  let mut raw_before = eat_superfluous(context)?;

  while !context.ended()? {
    if is_next_key_value_declaration(context)? {
      declarations.push(parse_key_value_declaration(context, raw_before)?);
    } else {
      rules.push(parse_rule(context, raw_before)?);
    }

    // defensive coding. rules should be implementing eat_whitespace
    // themselves so that the ASTs can include raws.
    // TODO - need to test all cases for this, then remove.
    raw_before = eat_superfluous(context)?;
  }
  Ok((rules, declarations))
}

fn eat_superfluous<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Option<&'a [u8]>, ParseError> {
  let start = context.tokenizer.pos;

  if context.ended()? {
    return Ok(None);
  }

  while !context.ended()? {
    let tok = context.tokenizer.peek(1).unwrap();
    match tok {
      Token::Whitespace | Token::ScriptComment(_) | Token::LineComment(_) => {
        context.tokenizer.next()?;
      }
      _ => {
        break;
      }
    }
  }
  Ok(Some(
    &context.tokenizer.source
      [start..std::cmp::min(context.tokenizer.pos, context.tokenizer.source.len() - 1)],
  ))
}

fn parse_comment<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Rule, ParseError> {
  let raw_before = context.tokenizer.eat_whitespace();
  let start = context.tokenizer.utf16_pos;
  let start_tok = context.tokenizer.next()?;

  let buffer = match start_tok {
    Token::LineComment(buffer) => buffer,
    Token::ScriptComment(buffer) => buffer,
    _ => return Err(ParseError::unexpected_token(start)),
  };

  let pos = context.tokenizer.utf16_pos;

  let raws_after = context.tokenizer.eat_whitespace();

  Ok(Rule::Comment(Comment {
    id: context.id_generator.new_id(),
    value: buffer.to_string(),
    location: Location::new(start, pos),
  }))
}

fn parse_rule<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'a [u8]>,
) -> Result<Rule, ParseError> {
  match context.tokenizer.peek(1)? {
    Token::LineComment(_) => parse_comment(context),
    Token::ScriptComment(_) => parse_comment(context),
    Token::At => parse_at_rule(context),
    _ => parse_style_rule(context, raw_before),
  }
}

fn parse_style_rule<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'a [u8]>,
) -> Result<Rule, ParseError> {
  Ok(Rule::Style(parse_style_rule2(context, raw_before, false)?))
}

fn parse_style_rule2<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'a [u8]>,
  is_child_without_amp_prefix: bool,
) -> Result<StyleRule, ParseError> {
  let raw_before = context.tokenizer.eat_whitespace();
  let start = context.tokenizer.utf16_pos;
  let selector = parse_selector2(context, is_child_without_amp_prefix)?;
  let (declarations, children, raw_after) = parse_declaration_body(context)?;
  Ok(StyleRule {
    id: context.id_generator.new_id(),
    raws: BasicRaws::new(raw_before, raw_after),
    selector,
    declarations,
    children,
    location: Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_declaration_body<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<(Vec<Declaration>, Vec<StyleRule>, Option<&'a [u8]>), ParseError> {
  eat_superfluous(context)?;
  let block_start = context.tokenizer.utf16_pos;
  context.tokenizer.next_expect(Token::CurlyOpen)?; // eat {
  let (declarations, rules) = parse_declarations_and_children(context)?;

  eat_superfluous(context)?;
  context
    .tokenizer
    .next_expect(Token::CurlyClose)
    .or(Err(ParseError::unterminated(
      "Unterminated bracket.".to_string(),
      block_start,
      context.tokenizer.utf16_pos,
    )))?;

  let raw_after = context.tokenizer.eat_whitespace();

  Ok((declarations, rules, raw_after))
}

fn parse_at_rule<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Rule, ParseError> {
  let raw_before = context.tokenizer.eat_whitespace();
  let start = context.tokenizer.utf16_pos;
  context.tokenizer.next_expect(Token::At)?;
  let name = parse_selector_name(context)?;
  context.tokenizer.eat_whitespace();
  match name {
    "charset" => {
      let start = context.tokenizer.utf16_pos;
      if let Token::Str((value, boundary)) = context.tokenizer.next()? {
        context.tokenizer.next_expect(Token::Semicolon)?;
        let raw_after = context.tokenizer.eat_whitespace();
        Ok(Rule::Charset(CharsetRule {
          id: context.id_generator.new_id(),
          value: value.to_string(),
          raws: BasicRaws::new(raw_before, raw_after),
          location: Location::new(start, context.tokenizer.utf16_pos),
        }))
      } else {
        Err(ParseError::unexpected_token(start))
      }
    }
    // "namespace" => {
    //   let value = get_buffer(context.tokenizer, |tokenizer| {
    //     Ok(tokenizer.peek(1)? != Token::Semicolon)
    //   })?;
    //   context.tokenizer.next_expect(Token::Semicolon)?;
    //   Ok(Rule::Namespace(value.to_string()))
    // }
    "supports" => Ok(Rule::Supports(parse_condition_rule(
      name.to_string(),
      raw_before,
      context,
    )?)),
    "mixin" => Ok(Rule::Mixin(parse_mixin_rule(start, raw_before, context)?)),
    "media" => Ok(Rule::Media(parse_condition_rule(
      name.to_string(),
      raw_before,
      context,
    )?)),
    "include" => Ok(Rule::Include(parse_include(context, raw_before)?)),
    "export" => Ok(Rule::Export(parse_export_rule(context, raw_before)?)),
    "keyframes" => Ok(Rule::Keyframes(parse_keyframes_rule(context, raw_before)?)),
    "-webkit-keyframes" => Ok(Rule::Keyframes(parse_keyframes_rule(context, raw_before)?)),
    "font-face" => Ok(Rule::FontFace(parse_font_face_rule(context, raw_before)?)),
    "document" => Ok(Rule::Document(parse_condition_rule(
      name.to_string(),
      raw_before,
      context,
    )?)),
    "page" => Ok(Rule::Page(parse_condition_rule(
      name.to_string(),
      raw_before,
      context,
    )?)),
    _ => Err(ParseError::unexpected_token(context.tokenizer.utf16_pos)),
  }
}

fn parse_export_rule<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'a [u8]>,
) -> Result<ExportRule, ParseError> {
  let start = context.tokenizer.utf16_pos;
  context.tokenizer.next_expect(Token::CurlyOpen)?;

  let mut rules = vec![];
  let mut raw_nested_before = context.tokenizer.eat_whitespace();

  while context.tokenizer.peek(1)? != Token::CurlyClose {
    rules.push(parse_rule(context, raw_nested_before)?);

    // set to none since rules define after prop
    raw_nested_before = None;
  }

  context.tokenizer.next_expect(Token::CurlyClose)?;

  let raw_after = context.tokenizer.eat_whitespace();

  Ok(ExportRule {
    id: context.id_generator.new_id(),
    rules,
    raws: BasicRaws::new(raw_before, raw_after),
    location: Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_condition_rule<'a, 'b>(
  name: String,
  raw_before: Option<&'a [u8]>,
  context: &mut Context<'a, 'b>,
) -> Result<ConditionRule, ParseError> {
  let start = context.tokenizer.utf16_pos;
  let condition_text = get_buffer(context.tokenizer, |tokenizer| {
    Ok(tokenizer.peek(1)? != Token::CurlyOpen)
  })?
  .to_string();

  let (declarations, rules, raw_after) = parse_declaration_body(context)?;

  Ok(ConditionRule {
    name,
    id: context.id_generator.new_id(),
    condition_text,
    declarations,
    raws: BasicRaws::new(raw_before, raw_after),
    rules,
    location: Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_mixin_rule<'a, 'b>(
  start: usize,
  raw_start: Option<&'a [u8]>,
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
  let (declarations, rules, raw_after) = parse_declaration_body(context)?;
  Ok(MixinRule {
    id: context.id_generator.new_id(),
    location: Location::new(start, context.tokenizer.utf16_pos),
    raws: BasicRaws::new(raw_start, raw_after),
    name: MixinName {
      value: name,
      location: name_location,
    },
    declarations,
    rules,
  })
}

fn parse_font_face_rule<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'a [u8]>,
) -> Result<FontFaceRule, ParseError> {
  let start = context.tokenizer.utf16_pos;
  let (declarations, _children, raw_after) = parse_declaration_body(context)?;
  Ok(FontFaceRule {
    id: context.id_generator.new_id(),
    raws: BasicRaws::new(raw_before, raw_after),
    declarations,
    location: Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_keyframes_rule<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'a [u8]>,
) -> Result<KeyframesRule, ParseError> {
  let start = context.tokenizer.utf16_pos;
  let name = parse_selector_name(context)?.to_string();

  let mut rules = vec![];
  eat_superfluous(context)?;
  context.tokenizer.next_expect(Token::CurlyOpen)?;

  while !context.tokenizer.is_eof() {
    let kf_raw_before = eat_superfluous(context)?;
    if context.tokenizer.peek(1)? == Token::CurlyClose {
      break;
    }
    rules.push(parse_keyframe_rule(context, kf_raw_before)?);
  }

  context.tokenizer.next_expect(Token::CurlyClose)?;
  let raw_after = context.tokenizer.eat_whitespace();
  eat_superfluous(context)?;

  Ok(KeyframesRule {
    id: context.id_generator.new_id(),
    name,
    rules,
    raws: BasicRaws::new(raw_before, raw_after),
    location: Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_keyframe_rule<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'a [u8]>,
) -> Result<KeyframeRule, ParseError> {
  let start = context.tokenizer.utf16_pos;

  eat_superfluous(context)?;

  // cover 0%, 50%, 75% {
  let key = get_buffer(context.tokenizer, |tokenizer| {
    let tok = tokenizer.peek(1)?;
    Ok(tok != Token::CurlyOpen)
  })?
  .to_string();

  let (declarations, _children, raw_after) = parse_declaration_body(context)?;

  Ok(KeyframeRule {
    raws: BasicRaws::new(raw_before, raw_after),
    key,
    declarations,
    location: Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_selector2<'a, 'b>(
  context: &mut Context<'a, 'b>,
  is_child_without_amp_prefix: bool,
) -> Result<Selector, ParseError> {
  parse_group_selector(context, is_child_without_amp_prefix)
}

// select, select, select
fn parse_group_selector<'a, 'b>(
  context: &mut Context<'a, 'b>,
  is_child_without_amp_prefix: bool,
) -> Result<Selector, ParseError> {
  let start = context.tokenizer.utf16_pos;

  let mut selectors: Vec<Selector> = vec![];

  // don't handle for now
  // if is_child_without_amp_prefix && context.tokenizer.peek(1)? == Token::Comma {
  //   selectors.push(Selector::Prefixed(PrefixedSelector {
  //     connector: " ".to_string(),
  //     postfix_selector: None,
  //     location: Location::new(context.tokenizer.utf16_pos, context.tokenizer.utf16_pos)
  //   }));
  //   context.tokenizer.next()?;
  // }

  loop {
    eat_superfluous(context)?;
    selectors.push(parse_pair_selector(context, is_child_without_amp_prefix)?);
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
fn parse_pair_selector<'a, 'b>(
  context: &mut Context<'a, 'b>,
  is_child_without_amp_prefix: bool,
) -> Result<Selector, ParseError> {
  let selector = if is_child_without_amp_prefix
    && matches!(
      context.tokenizer.peek(1)?,
      Token::Byte(b'>') | Token::Plus | Token::Squiggle
    ) {
    // TODO - change to BlankSelector
    Selector::Prefixed(PrefixedSelector {
      connector: " ".to_string(),
      postfix_selector: None,
      location: Location::new(context.tokenizer.utf16_pos, context.tokenizer.utf16_pos),
    })
  } else {
    parse_combo_selector(context)?
  };

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
      let child = parse_pair_selector(context, false)?;
      Ok(Selector::Child(ChildSelector {
        parent: Box::new(selector),
        child: Box::new(child),
        location: Location::new(start, context.tokenizer.utf16_pos),
      }))
    }
    Token::Plus => {
      context.tokenizer.next()?; // eat +
      eat_superfluous(context)?;
      let sibling = parse_pair_selector(context, false)?;
      Ok(Selector::Adjacent(AdjacentSelector {
        selector: Box::new(selector),
        next_sibling_selector: Box::new(sibling),
        location: Location::new(start, context.tokenizer.utf16_pos),
      }))
    }
    Token::Squiggle => {
      context.tokenizer.next()?; // eat ~
      eat_superfluous(context)?;
      let sibling = parse_pair_selector(context, false)?;
      Ok(Selector::Sibling(SiblingSelector {
        selector: Box::new(selector),
        sibling_selector: Box::new(sibling),
        location: Location::new(start, context.tokenizer.utf16_pos),
      }))
    }
    Token::CurlyOpen => Ok(selector),
    _ => {
      // try parsing child
      let descendent_result = parse_pair_selector(context, false);
      if let Ok(descendent) = descendent_result {
        Ok(Selector::Descendent(DescendentSelector {
          ancestor: Box::new(selector),
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
      let sel = parse_pair_selector(context, false)?;
      Selector::Not(NotSelector {
        selector: Box::new(sel),
        location: Location::new(start, context.tokenizer.utf16_pos),
      })
    } else if name == "within" {
      let sel = parse_group_selector(context, false)?;
      Selector::Within(WithinSelector {
        selector: Box::new(sel),
        location: Location::new(start, context.tokenizer.utf16_pos),
      })
    } else if name == "global" {
      let sel = parse_group_selector(context, false)?;
      Selector::Global(GlobalSelector {
        selector: Box::new(sel),
        location: Location::new(start, context.tokenizer.utf16_pos),
      })
    } else if name == "self" {
      let sel = parse_group_selector(context, false)?;
      Selector::This(SelfSelector {
        selector: Some(Box::new(sel)),
        location: Location::new(start, context.tokenizer.utf16_pos),
      })
    } else if name == "has" {
      let sel = parse_pair_selector(context, false)?;
      Selector::SubElement(SubElementSelector {
        name,
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
    if name == "self" {
      Selector::This(SelfSelector {
        selector: None,
        location: Location::new(start, context.tokenizer.utf16_pos),
      })
    } else {
      Selector::PseudoElement(PseudoElementSelector {
        separator: ":".to_string().repeat(colon_count),
        name,
        location: Location::new(start, context.tokenizer.utf16_pos),
      })
    }
  };

  Ok(selector)
}

fn parse_element_selector<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<Selector, ParseError> {
  let pos = context.tokenizer.utf16_pos;
  let token = context.tokenizer.peek(1)?;
  let selector: Selector = match token {
    Token::Star => {
      context.tokenizer.next()?; // eat *
      Selector::AllSelector(AllSelector {
        location: Location::new(pos, pos + 1),
      })
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
    | Token::Byte(b'-')
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
    let mut tok = tokenizer.peek(1)?;

    // skip escape
    if tok == Token::Byte(b'\\') {
      tokenizer.next();
      tok = tokenizer.peek(1)?;
    }

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

  // START HERE - need to remove superfluous
  let mut raw_before = eat_superfluous(context)?;

  while !context.ended()? {
    if context.tokenizer.peek(1)? == Token::CurlyClose {
      break;
    }

    let tok = context.tokenizer.peek(1)?;

    if let Token::Byte(b'&') = tok {
      children.push(parse_style_rule2(context, raw_before, false)?);
    } else if tok == Token::At {
      declarations.push(parse_at_declaration(context, raw_before)?);
    } else {
      if is_next_declaration(context)? {
        declarations.push(parse_key_value_declaration(context, raw_before)?);
      } else {
        children.push(parse_style_rule2(context, raw_before, true)?);
      }
    }
    raw_before = eat_superfluous(context)?;
  }

  Ok((declarations, children))
}

fn is_next_declaration<'a, 'b>(context: &mut Context<'a, 'b>) -> Result<bool, ParseError> {
  let pos = context.tokenizer.get_pos();
  let mut is_declaration = true;

  while !context.ended()? {
    let tok = context.tokenizer.next()?;

    if tok == Token::Semicolon || tok == Token::CurlyClose {
      is_declaration = true;
      break;
    } else if tok == Token::CurlyOpen {
      is_declaration = false;
      break;
    }
  }

  context.tokenizer.set_pos(pos);

  return Ok(is_declaration);
}

fn is_next_key_value_declaration<'a, 'b>(
  context: &mut Context<'a, 'b>,
) -> Result<bool, ParseError> {
  let pos = context.tokenizer.get_pos();
  let mut found_semicolon = false;
  let mut found_colon = false;
  let mut found_curly_open = false;
  context.tokenizer.eat_whitespace();

  while !context.ended()? {
    let tok = context.tokenizer.next()?;

    if tok == Token::Colon {
      found_colon = true;
    } else if tok == Token::Semicolon {
      found_semicolon = true;
      break;
    } else if tok == Token::CurlyOpen {
      found_curly_open = true;
      break;
    }
  }

  context.tokenizer.set_pos(pos);

  return Ok((found_colon && found_semicolon) && !(found_curly_open));
}

fn parse_at_declaration<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'a [u8]>,
) -> Result<Declaration, ParseError> {
  let start = context.tokenizer.utf16_pos;

  context.tokenizer.next_expect(Token::At)?;
  let keyword = context.tokenizer.next()?;

  match keyword {
    Token::Keyword("include") => Ok((Declaration::Include(parse_include(context, raw_before)?))),
    Token::Keyword("media") => Ok(
      (Declaration::Media(parse_condition_rule(
        "media".to_string(),
        raw_before,
        context,
      )?)),
    ),
    Token::Keyword("content") => {
      context.tokenizer.next_expect(Token::Semicolon);
      let end = context.tokenizer.utf16_pos;
      Ok(Declaration::Content(Content {
        id: context.id_generator.new_id(),
        raws: BasicRaws::new(raw_before, context.tokenizer.eat_whitespace()),
        location: Location::new(start, end),
      }))
    }
    _ => {
      return Err(ParseError::unexpected_token(context.tokenizer.utf16_pos));
    }
  }
}

fn parse_include<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'a [u8]>,
) -> Result<Include, ParseError> {
  let start = context.tokenizer.utf16_pos;
  eat_superfluous(context)?;
  let mut mixin_path: Vec<IncludeReferencePart> = vec![];
  let ref_start = context.tokenizer.utf16_pos;

  while !context.tokenizer.is_eof() {
    let start = context.tokenizer.get_pos();
    if let Token::Keyword(keyword) = context.tokenizer.next()? {
      mixin_path.push(IncludeReferencePart {
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

  let mixin_name = IncludeReference {
    parts: mixin_path,
    location: Location::new(ref_start, context.tokenizer.utf16_pos),
  };

  eat_superfluous(context);

  let (declarations, rules, raw_after) = if context.tokenizer.peek(1)? == Token::Semicolon {
    context.tokenizer.next()?; // eat ;
    (vec![], vec![], None)
  } else if context.tokenizer.peek(1)? == Token::CurlyOpen {
    parse_declaration_body(context)?
  } else {
    return Err(ParseError::unexpected_token(context.tokenizer.utf16_pos));
  };

  Ok(Include {
    id: context.id_generator.new_id(),
    mixin_name,
    raws: BasicRaws::new(raw_before, raw_after),
    rules,
    declarations,
    location: Location::new(start, context.tokenizer.utf16_pos),
  })
}

fn parse_key_value_declaration<'a, 'b>(
  context: &mut Context<'a, 'b>,
  raw_before: Option<&'a [u8]>,
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

    eat_superfluous(context)?;

    // ; or } must be present
    if context.tokenizer.peek(1)? == Token::Semicolon {
      context.tokenizer.next()?; // eat ;

    // check for { color: red }, if not, then probably dealing with this: { color: red background: blue; }
    } else if context.tokenizer.peek(1)? != Token::CurlyClose {
      return Err(ParseError::unexpected_token(context.tokenizer.pos));
    }

    let end = context.tokenizer.utf16_pos;
    let raw_after = eat_superfluous(context)?;

    Ok(Declaration::KeyValue(KeyValueDeclaration {
      id: context.id_generator.new_id(),
      name,
      value,
      raws: BasicRaws::new(raw_before, raw_after),
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
      Token::Semicolon | Token::CurlyClose | Token::Colon => {
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
    @keyframes {
      0%, 10% {

      }
    }
    // comment
    ";

    parse(source, "id").unwrap();
  }

  #[test]
  fn can_smoke_parse_various_at_rules() {
    // let source = "
    //   div {
    //     color: blue;
    //   }
    //   @charset \"utf-8\";
    //   @namespace svg \"http://google.com\";
    //   @font-face {
    //     font-family: 'abcd';
    //   }
    //   @keyframes abc {
    //   }
    //   @keyframes abc {
    //     0% {
    //       color: red;
    //     }
    //     100% {
    //       color: red;
    //     }
    //   }
    //   @media (max-width:640px){._3nRJIwLuth2pKYrXnr2jPN{width:360px } }
    //   @media print {
    //     & div {
    //       color: red;
    //     }
    //     & .span {
    //       color: blue;
    //     }
    //   }
    //   @page :first {

    //   }
    //   @supports (display: flex) {
    //     .el {
    //       display: flex;
    //     }
    //   }

    //   @media ab {._a{a:b;}}

    //   .test {
    //     background: url(';');
    //   }
    //   @mixin a {
    //     color: red;
    //   }
    //   @export {
    //     @mixin a {
    //       color: red;
    //     }
    //     .a {
    //       color: c;
    //     }
    //   }
    //   .a {
    //     @include a.b;
    //   }

    //   .parent {
    //     &-child {

    //     }
    //     >.child {

    //     }
    //     &.child {

    //     }
    //   }

    //   a {
    //     b, c {
    //       color: red;
    //     }
    //     &--d, &--e {

    //     }
    //   }
    // ";

    let source = "
      div {
        color: blue;
      }
    ";

    parse(source, "id").unwrap();
  }

  ///
  /// Error handling
  ///

  #[test]
  fn displays_an_error_for_unterminated_curly_bracket() {
    assert_eq!(
      parse("div { ", "id"),
      Err(ParseError::unterminated(
        "Unterminated bracket.".to_string(),
        4,
        6
      ))
    );
  }
}
