// https://tympanus.net/codrops/css_reference/

use super::ast as pc_ast;
use super::tokenizer::{Token, Tokenizer};
use crate::annotation::parser::parse_with_tokenizer as parse_annotation_with_tokenizer;
use crate::annotation::tokenizer::{Token as AnnotationToken, Tokenizer as AnnotationTokenizer};
use crate::base::ast::{BasicRaws, Range};
use crate::base::parser::{get_buffer, ParseError};
use crate::base::string_scanner::StringScanner;
use crate::base::string_scanner::U16Position;
use crate::base::utils::get_document_id;
use crate::core::id_generator::IDGenerator;
use crate::css::parser::parse_with_tokenizer as parse_css_with_tokenizer;
use crate::css::tokenizer::{Token as CSSToken, Tokenizer as CSSTokenizer};
use crate::script::ast as script_ast;
use crate::script::parser::parse_with_tokenizer as parse_js_with_tokenizer;
use crate::script::tokenizer::Tokenizer as JSTokenizer;
use crc::crc32;
use std::str;

/*

void elements: [ 'area',
  'base',
  'basefont',
  'bgsound',
  'br',
  'col',
  'command',
  'embed',
  'frame',
  'hr',
  'image',
  'img',
  'input',
  'isindex',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'nextid',
  'param',
  'source',
  'track',
  'wbr' ]
*/

pub fn parse<'a, 'b>(
  source: &'a str,
  source_uri: &'a str,
  id_seed: &'b str,
) -> Result<pc_ast::Node, ParseError> {
  let mut scanner = StringScanner::new(source);
  let mut tokenizer = Tokenizer::new_from_scanner(scanner);

  parse_fragment(
    &mut Context {
      tokenizer: tokenizer,
      scope_id: get_document_id(&source_uri.to_string()),
      id_generator: IDGenerator::new(id_seed.to_string()),
    },
    vec![],
  )
}

pub struct Context<'a> {
  pub tokenizer: Tokenizer<'a>,
  pub scope_id: String,
  pub id_generator: IDGenerator,
}

fn parse_fragment<'a>(
  context: &mut Context<'a>,
  path: Vec<String>,
) -> Result<pc_ast::Node, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();
  let mut children: Vec<pc_ast::Node> = vec![];
  let mut raw_before = context.tokenizer.scanner.eat_whitespace();

  while !context.tokenizer.scanner.is_eof() {
    let mut child_path = path.clone();
    child_path.push(children.len().to_string());
    children.push(parse_include_declaration(context, child_path, raw_before)?);
    raw_before = context.tokenizer.scanner.eat_whitespace();
  }

  Ok(pc_ast::Node::Fragment(pc_ast::Fragment {
    id: context.id_generator.new_id(),
    children,
    range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
  }))
}

fn parse_include_declaration<'a>(
  context: &mut Context<'a>,
  path: Vec<String>,
  raw_before: Option<&'a [u8]>,
) -> Result<pc_ast::Node, ParseError> {
  let start = context.tokenizer.scanner.get_pos();

  // Kinda ick, but cover case where last node is whitespace.
  let token = context.tokenizer.peek_eat_whitespace(1).or_else(|_| {
    context.tokenizer.scanner.set_pos(&start);
    context.tokenizer.peek(1)
  })?;

  match token {
    Token::CurlyOpen => parse_slot(context, &path, raw_before, 0),
    Token::LessThan => parse_tag(context, path, raw_before),
    Token::HtmlCommentOpen => parse_annotation(context, raw_before),
    Token::TagClose => {
      context.tokenizer.scanner.eat_whitespace();
      let start = context.tokenizer.scanner.get_u16pos();
      context.tokenizer.next_expect(Token::TagClose)?;
      let tag_name = parse_tag_name(context)?;
      context.tokenizer.next_expect(Token::GreaterThan)?;

      Err(ParseError::unexpected(
        "Closing tag doesn't have an open tag.".to_string(),
        start.range_from(context.tokenizer.scanner.get_u16pos()),
      ))
    }
    _ => {
      // reset pos to ensure text doesn't get chopped (e.g: `{children} text`)
      context.tokenizer.scanner.set_pos(&start);
      let value = get_buffer(&mut context.tokenizer, |tokenizer| {
        let tok = tokenizer.peek(1)?;
        Ok(
          tok != Token::CurlyOpen
            && tok != Token::LessThan
            && tok != Token::TagClose
            && tok != Token::HtmlCommentOpen,
        )
      })?
      .to_string();

      if value.len() == 0 {
        Err(ParseError::unexpected_token(
          start
            .to_u16()
            .range_from(context.tokenizer.scanner.get_u16pos()),
        ))
      } else {
        Ok(pc_ast::Node::Text(pc_ast::ValueObject {
          id: context.id_generator.new_id(),
          // keep raws on text to make it easier creating printers
          raws: BasicRaws::new(None, None),

          // want to include raws with text node to make it easier on rendering
          value: if let Some(before) = raw_before {
            format!("{}{}", str::from_utf8(before).unwrap(), value)
          } else {
            value.clone()
          },
          range: start
            .to_u16()
            .range_from(context.tokenizer.scanner.get_u16pos()),
        }))
      }
    }
  }
}

fn parse_slot<'a>(
  context: &mut Context<'a>,
  path: &Vec<String>,
  raw_before: Option<&'a [u8]>,
  index: usize,
) -> Result<pc_ast::Node, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();
  let omit_from_compilation = parse_omit_from_compilation(context)?;
  context.tokenizer.next_expect(Token::CurlyOpen)?;
  let script = parse_slot_script(context, Some((path, index)))?;
  Ok(pc_ast::Node::Slot(pc_ast::Slot {
    id: context.id_generator.new_id(),
    omit_from_compilation,
    raws: BasicRaws::new(raw_before, None),
    script,
    range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
  }))
}

fn parse_slot_script<'a>(
  context: &mut Context<'a>,
  id_seed_info_option: Option<(&Vec<String>, usize)>,
) -> Result<script_ast::Expression, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();
  let mut js_tokenizer = JSTokenizer::new_from_scanner(context.tokenizer.scanner.clone());
  let id_seed = if let Some((path, index)) = id_seed_info_option {
    format!("{}{}", path.join("-"), index)
  } else {
    "".to_string()
  };

  let stmt = parse_js_with_tokenizer(
    &mut js_tokenizer,
    id_seed,
    context.scope_id.to_string().as_str(),
  )
  .and_then(|script| {
    context
      .tokenizer
      .scanner
      .set_pos(&js_tokenizer.scanner.get_pos());
    context.tokenizer.scanner.eat_whitespace();

    context.tokenizer.next_expect(Token::CurlyClose)?;
    Ok(script)
  })
  .or(Err(ParseError::unterminated(
    "Unterminated slot.".to_string(),
    start.range_from(context.tokenizer.scanner.get_u16pos()),
  )));

  stmt
}

pub fn parse_annotation<'a>(
  context: &mut Context<'a>,
  raw_before: Option<&'a [u8]>,
) -> Result<pc_ast::Node, ParseError> {
  let start = context.tokenizer.scanner.get_pos();

  context.tokenizer.next()?; // eat HTML comment open
  let mut scanner = context.tokenizer.scanner.clone();
  let mut annotation_tokenizer = AnnotationTokenizer::new_from_scanner(scanner);

  let annotation = parse_annotation_with_tokenizer(
    &mut annotation_tokenizer,
    &context.scope_id,
    |tokenizer| -> Result<bool, ParseError> {
      Ok(
        tokenizer.peek(1)? == AnnotationToken::Byte(b'-')
          && tokenizer.peek(2)? == AnnotationToken::Byte(b'-')
          && tokenizer.peek(3)? == AnnotationToken::Byte(b'>'),
      )
    },
  )?;

  context
    .tokenizer
    .scanner
    .set_pos(&annotation_tokenizer.scanner.get_pos());

  context.tokenizer.next()?; // eat -->

  Ok(pc_ast::Node::Comment(pc_ast::Comment {
    id: context.id_generator.new_id(),
    raws: BasicRaws::new(raw_before, None),
    range: Range::new(start.to_u16(), context.tokenizer.scanner.get_u16pos()),
    annotation,
  }))
}

pub fn parse_tag<'a>(
  context: &mut Context<'a>,
  path: Vec<String>,
  raw_before: Option<&'a [u8]>,
) -> Result<pc_ast::Node, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();

  context.tokenizer.next_expect(Token::LessThan)?;
  parse_element(context, raw_before, path, start)
}

fn parse_element<'a>(
  context: &mut Context<'a>,
  el_raw_before: Option<&'a [u8]>,
  path: Vec<String>,
  start: U16Position,
) -> Result<pc_ast::Node, ParseError> {
  let tag_name_start = context.tokenizer.scanner.get_u16pos();
  let tag_name = parse_tag_name(context)?;
  let tag_name_end = context.tokenizer.scanner.get_u16pos();

  let tag_name_range = Range::new(tag_name_start, tag_name_end);

  let attributes = parse_attributes(context, &path)?;

  if tag_name == "style" {
    parse_next_style_element_parts(tag_name_range, attributes, el_raw_before, context, start)
  } else if tag_name == "script" {
    parse_next_script_element_parts(
      tag_name_range,
      attributes,
      el_raw_before,
      context,
      path,
      start,
    )
  } else {
    parse_next_basic_element_parts(
      tag_name,
      tag_name_range,
      attributes,
      el_raw_before,
      context,
      path,
      start,
    )
  }
}

fn parse_next_basic_element_parts<'a>(
  tag_name: String,
  tag_name_range: Range,
  attributes: Vec<pc_ast::Attribute>,
  el_raw_before: Option<&'a [u8]>,
  context: &mut Context<'a>,
  path: Vec<String>,
  start: U16Position,
) -> Result<pc_ast::Node, ParseError> {
  let mut children: Vec<pc_ast::Node> = vec![];

  context.tokenizer.scanner.eat_whitespace();
  let mut end = context.tokenizer.scanner.get_u16pos();

  match context.tokenizer.peek(1)? {
    Token::SelfTagClose => {
      context.tokenizer.next()?;
      end = context.tokenizer.scanner.get_u16pos();
    }
    Token::GreaterThan => {
      context.tokenizer.next()?;
      end = context.tokenizer.scanner.get_u16pos();
      let mut raw_before = context.tokenizer.scanner.eat_whitespace();
      while !context.tokenizer.scanner.is_eof()
        && context.tokenizer.peek_eat_whitespace(1)? != Token::TagClose
      {
        let mut child_path = path.clone();
        child_path.push(children.len().to_string());
        children.push(parse_include_declaration(context, child_path, raw_before)?);
        raw_before = context.tokenizer.scanner.eat_whitespace();
      }

      parse_close_tag(tag_name.as_str(), context, &start, &end)?;
    }
    _ => {
      return Err(ParseError::unexpected_token(
        start.range_from(context.tokenizer.scanner.get_u16pos()),
      ))
    }
  }

  let el = pc_ast::Element {
    raws: pc_ast::ElementRaws::new(el_raw_before.unwrap_or(b"")),
    id: get_element_id(context, path),
    tag_name_range,
    open_tag_range: start.range_from(end),
    range: start.range_from(context.tokenizer.scanner.get_u16pos()),
    tag_name: tag_name.to_string(),
    attributes,
    children,
  };
  Ok(pc_ast::Node::Element(el))
}

fn get_element_id(context: &Context, path: Vec<String>) -> String {
  let buff = format!("{}{}", context.scope_id, path.join("-"));
  format!("{:x}", crc32::checksum_ieee(buff.as_bytes())).to_string()
}

fn parse_next_style_element_parts<'a>(
  tag_name_range: Range,
  attributes: Vec<pc_ast::Attribute>,
  raw_before: Option<&'a [u8]>,
  context: &mut Context<'a>,
  start: U16Position,
) -> Result<pc_ast::Node, ParseError> {
  context.tokenizer.next_expect(Token::GreaterThan)?; // eat >
  let end = context.tokenizer.scanner.get_u16pos();
  let mut css_tokenizer = CSSTokenizer::new_from_scanner(context.tokenizer.scanner.clone());

  let seed = context.id_generator.new_seed();
  let sheet = parse_css_with_tokenizer(
    &mut css_tokenizer,
    seed.as_str(),
    |tokenizer| -> Result<bool, ParseError> {
      Ok(tokenizer.peek(1)? == CSSToken::Byte(b'<') && tokenizer.peek(2)? == CSSToken::Byte(b'/'))
    },
  )?;
  context
    .tokenizer
    .scanner
    .set_pos(&css_tokenizer.scanner.get_pos());

  // TODO - assert tokens equal these
  parse_close_tag("style", context, &start, &end)?;

  Ok(pc_ast::Node::StyleElement(pc_ast::StyleElement {
    id: context.id_generator.new_id(),
    raws: pc_ast::ElementRaws::new(raw_before.unwrap_or(b"")),
    attributes,
    sheet,
    range: start.range_from(context.tokenizer.scanner.get_u16pos()),
  }))
}

fn parse_close_tag<'a, 'b>(
  tag_name: &'a str,
  context: &mut Context<'b>,
  start: &U16Position,
  end: &U16Position,
) -> Result<(), ParseError> {
  let end_tag_name_start = context.tokenizer.scanner.get_u16pos();

  context.tokenizer.scanner.eat_whitespace();

  context
    .tokenizer
    .next_expect(Token::TagClose)
    .or(Err(ParseError::unterminated(
      "Unterminated element.".to_string(),
      start.range_from(end.clone()),
    )))?;

  parse_tag_name(context)
    // TODO - assert tag name
    .and_then(|end_tag_name| {
      if tag_name != end_tag_name {
        Err(ParseError::unterminated(
          "Incorrect closing tag.".to_string(),
          end_tag_name_start.range_from(context.tokenizer.scanner.get_u16pos()),
        ))
      } else {
        Ok(())
      }
    })?;

  context
    .tokenizer
    .next_expect(Token::GreaterThan)
    .or(Err(ParseError::unterminated(
      "Unterminated element.".to_string(),
      start.range_from(end.clone()),
    )))?;

  Ok(())
}

fn parse_next_script_element_parts<'a>(
  tag_name_range: Range,
  attributes: Vec<pc_ast::Attribute>,
  raw_before: Option<&'a [u8]>,
  context: &mut Context<'a>,
  path: Vec<String>,
  start: U16Position,
) -> Result<pc_ast::Node, ParseError> {
  context.tokenizer.next_expect(Token::GreaterThan)?; // eat >
  let end = context.tokenizer.scanner.get_u16pos();

  get_buffer(&mut context.tokenizer, |tokenizer| {
    Ok(tokenizer.peek(1)? != Token::TagClose)
  })?;

  parse_close_tag("script", context, &start, &end)?;

  Ok(pc_ast::Node::Element(pc_ast::Element {
    raws: pc_ast::ElementRaws::new(raw_before.unwrap_or(b"")),
    id: path
      .iter()
      .map(|i| i.to_string())
      .collect::<Vec<String>>()
      .join("-"),
    tag_name_range,
    open_tag_range: start.range_from(end),
    range: start.range_from(context.tokenizer.scanner.get_u16pos()),
    tag_name: "script".to_string(),
    attributes,
    children: vec![],
  }))
}

fn parse_tag_name<'a>(context: &mut Context<'a>) -> Result<String, ParseError> {
  Ok(
    get_buffer(&mut context.tokenizer, |tokenizer| {
      Ok(matches!(
        tokenizer.peek(1)?,
        Token::Word(_)
          | Token::Minus
          | Token::Dot
          | Token::Dollar
          | Token::Byte(b'_')
          | Token::Number(_)
      ))
    })?
    .to_string(),
  )
}

fn parse_attributes<'a>(
  context: &mut Context<'a>,
  path: &Vec<String>,
) -> Result<Vec<pc_ast::Attribute>, ParseError> {
  let mut attributes: Vec<pc_ast::Attribute> = vec![];

  loop {
    context.tokenizer.scanner.eat_whitespace();
    match context.tokenizer.peek(1)? {
      Token::SelfTagClose | Token::GreaterThan => break,
      _ => {
        attributes.push(parse_attribute(context, path, attributes.len())?);
      }
    }
  }

  Ok(attributes)
}

fn parse_attribute<'a>(
  context: &mut Context<'a>,
  path: &Vec<String>,
  index: usize,
) -> Result<pc_ast::Attribute, ParseError> {
  if context.tokenizer.peek(1)? == Token::CurlyOpen {
    parse_shorthand_attribute(context)
  } else {
    parse_key_value_attribute(context, path, index)
  }
}

fn parse_omit_from_compilation<'a>(context: &mut Context<'a>) -> Result<bool, ParseError> {
  Ok(if context.tokenizer.peek(1)? == Token::Bang {
    context.tokenizer.next()?;
    true
  } else {
    false
  })
}

fn parse_shorthand_attribute<'a>(
  context: &mut Context<'a>,
) -> Result<pc_ast::Attribute, ParseError> {
  let omit_from_compilation = parse_omit_from_compilation(context)?;
  let start = context.tokenizer.scanner.get_u16pos();
  context.tokenizer.next_expect(Token::CurlyOpen)?;
  if context.tokenizer.peek(1)? == Token::Spread {
    context.tokenizer.next_expect(Token::Spread)?;
    let script = parse_slot_script(context, None)?;
    Ok(pc_ast::Attribute::SpreadAttribute(
      pc_ast::SpreadAttribute {
        id: context.id_generator.new_id(),
        omit_from_compilation,
        script,
        range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
      },
    ))
  } else {
    let reference = parse_slot_script(context, None)?;
    Ok(pc_ast::Attribute::ShorthandAttribute(
      pc_ast::ShorthandAttribute {
        id: context.id_generator.new_id(),
        reference,
        range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
      },
    ))
  }
}

fn parse_key_value_attribute<'a>(
  context: &mut Context<'a>,
  path: &Vec<String>,
  index: usize,
) -> Result<pc_ast::Attribute, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();
  let name = parse_tag_name(context)?;

  if name.len() == 0 {
    return Err(ParseError::unexpected_token(
      start.range_from(context.tokenizer.scanner.get_u16pos()),
    ));
  }

  if context.tokenizer.peek(1)? == Token::Colon {
    context.tokenizer.next()?; // eat :
    let binding_name = parse_tag_name(context)?;

    let mut value = None;

    if context.tokenizer.peek(1)? == Token::Equals {
      context.tokenizer.next()?; // eat =
      value = Some(parse_attribute_value(context, path, index)?);

    // Fix https://github.com/paperclipui/paperclip/issues/306
    // Keep in case we want to turn this back on.
    } else {
      return Err(ParseError::unexpected_token(
        start.range_from(context.tokenizer.scanner.get_u16pos()),
      ));
    }

    Ok(pc_ast::Attribute::PropertyBoundAttribute(
      pc_ast::PropertyBoundAttribute {
        id: context.id_generator.new_id(),
        name,
        binding_name,
        value,
        range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
      },
    ))
  } else if context.tokenizer.peek(1)? == Token::Equals {
    context.tokenizer.next()?; // eat =
    let value = Some(parse_attribute_value(context, path, index)?);

    Ok(pc_ast::Attribute::KeyValueAttribute(
      pc_ast::KeyValueAttribute {
        id: context.id_generator.new_id(),
        name,
        value,
        range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
      },
    ))
  } else if context.tokenizer.peek(1)? == Token::Whitespace {
    context.tokenizer.next()?; // eat WS
    Ok(pc_ast::Attribute::KeyValueAttribute(
      pc_ast::KeyValueAttribute {
        id: context.id_generator.new_id(),
        name,
        value: None,
        range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
      },
    ))
  } else if matches!(
    context.tokenizer.peek(1)?,
    Token::SelfTagClose | Token::GreaterThan
  ) {
    Ok(pc_ast::Attribute::KeyValueAttribute(
      pc_ast::KeyValueAttribute {
        id: context.id_generator.new_id(),
        name,
        value: None,
        range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
      },
    ))
  } else {
    Err(ParseError::unexpected_token(
      start.range_from(context.tokenizer.scanner.get_u16pos()),
    ))
  }
}

fn parse_attribute_value<'a>(
  context: &mut Context<'a>,
  path: &Vec<String>,
  index: usize,
) -> Result<pc_ast::AttributeValue, ParseError> {
  let pos = context.tokenizer.scanner.get_u16pos();
  let parts: Vec<pc_ast::AttributeDynamicStringPart> = vec![];

  match context.tokenizer.peek(1)? {
    Token::SingleQuote | Token::DoubleQuote => parse_attribute_string_value(context),
    Token::CurlyOpen => parse_attribute_slot(context, path, index),
    _ => Err(ParseError::unexpected_token(
      pos.range_from(context.tokenizer.scanner.get_u16pos()),
    )),
  }
}

fn parse_attribute_string_value<'a>(
  context: &mut Context<'a>,
) -> Result<pc_ast::AttributeValue, ParseError> {
  let pos = context.tokenizer.scanner.get_u16pos();
  let mut parts: Vec<pc_ast::AttributeDynamicStringPart> = vec![];

  let quote = context.tokenizer.next()?;

  let inner_value_start_pos = context.tokenizer.scanner.get_u16pos();

  while !context.tokenizer.scanner.is_eof() {
    let curr = context.tokenizer.peek(1)?;

    if curr == quote {
      break;
    }

    if curr == Token::Pierce || curr == Token::Dollar {
      context.tokenizer.next()?; // eat $
      let class_name = get_buffer(&mut context.tokenizer, |tokenizer| {
        let tok = tokenizer.peek(1)?;
        Ok(
          !matches!(
            tok,
            Token::Whitespace | Token::Pierce | Token::Dollar | Token::CurlyOpen
          ) && tok != quote,
        )
      })?
      .to_string();

      parts.push(pc_ast::AttributeDynamicStringPart::ClassNamePierce(
        pc_ast::AttributeDynamicStringClassNamePierce {
          id: context.id_generator.new_id(),
          class_name,
          range: pos.range_from(context.tokenizer.scanner.get_u16pos()),
        },
      ));
    } else if curr == Token::CurlyOpen {
      context.tokenizer.next_expect(Token::CurlyOpen)?;
      let script = parse_slot_script(context, None)?;
      parts.push(pc_ast::AttributeDynamicStringPart::Slot(script));
    } else {
      let start = context.tokenizer.scanner.get_u16pos();
      let value = get_buffer(&mut context.tokenizer, |tokenizer| {
        let tok = tokenizer.peek(1)?;
        Ok(!matches!(tok, Token::Pierce | Token::Dollar | Token::CurlyOpen) && tok != quote)
      })?
      .to_string();
      parts.push(pc_ast::AttributeDynamicStringPart::Literal({
        pc_ast::AttributeDynamicStringLiteral {
          id: context.id_generator.new_id(),
          value,
          range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
        }
      }));
    }
  }

  let inner_value_end_pos = context.tokenizer.scanner.get_u16pos();

  context
    .tokenizer
    .next_expect(quote)
    .or(Err(ParseError::unterminated(
      "Unterminated string literal.".to_string(),
      pos.range_from(context.tokenizer.scanner.get_u16pos()),
    )))?;

  let range = Range::new(inner_value_start_pos, inner_value_end_pos);

  if parts.len() == 0 {
    return Ok(pc_ast::AttributeValue::String(
      pc_ast::AttributeStringValue {
        id: context.id_generator.new_id(),
        value: "".to_string(),
        range,
      },
    ));
  }

  if parts.len() == 1 {
    if let pc_ast::AttributeDynamicStringPart::Literal(value) = &parts[0] {
      return Ok(pc_ast::AttributeValue::String(
        pc_ast::AttributeStringValue {
          id: context.id_generator.new_id(),
          value: value.value.clone(),
          range,
        },
      ));
    }
  }

  return Ok(pc_ast::AttributeValue::DyanmicString(
    pc_ast::AttributeDynamicStringValue {
      id: context.id_generator.new_id(),
      values: parts,
      range,
    },
  ));
}

fn parse_attribute_slot<'a>(
  context: &mut Context<'a>,
  path: &Vec<String>,
  index: usize,
) -> Result<pc_ast::AttributeValue, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();
  context.tokenizer.next_expect(Token::CurlyOpen)?;
  let script = parse_slot_script(context, Some((path, index)))?;
  Ok(pc_ast::AttributeValue::Slot(pc_ast::AttributeSlotValue {
    id: context.id_generator.new_id(),
    script,
    range: Range::new(start, context.tokenizer.scanner.get_u16pos()),
  }))
}

fn parse_attribute_string<'a>(
  context: &mut Context<'a>,
) -> Result<pc_ast::AttributeValue, ParseError> {
  let start = context.tokenizer.scanner.get_u16pos();
  let quote = context.tokenizer.next()?;
  let inner_start = context.tokenizer.scanner.get_u16pos();
  let inner_end = context.tokenizer.scanner.get_u16pos();

  get_buffer(&mut context.tokenizer, |tokenizer| {
    Ok(tokenizer.peek(1)? != quote)
  })
  .and_then(|value| {
    context.tokenizer.next_expect(quote)?;
    Ok(value)
  })
  .or(Err(ParseError::unterminated(
    "Unterminated string literal.".to_string(),
    start.range_from(context.tokenizer.scanner.get_u16pos()),
  )))
  .and_then(|value| {
    Ok(pc_ast::AttributeValue::String(
      pc_ast::AttributeStringValue {
        id: context.id_generator.new_id(),
        value: value.to_string(),
        range: Range::new(inner_start, inner_end),
      },
    ))
  })
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn can_smoke_parse_various_nodes() {
    let source = "
      text
      <!-- comment -->
      <element></element>
      <self-closing-element />
      <element with-attribute />
      <element/>
      <element a/>
      <element {a}/>
      <element a b/>
      <element data-and-an-attribute=\"value\" />
      <part onClick={on7Click}>
      </part>
      
      {10.10.10}
      
      <!-- void tags -->
      <!-- @ab test -->
      <br />
      <import  />
      <logic />

      {block}

      <!-- y broken stuff -->
      <meta charSet=\"utf-8\" />\n   
      <form action=\"/search/\" autoComplete=\"off\" method=\"get\" role=\"search\">
        <!--input type=\"search\" id=\"header-search-bar\" name=\"q\" class=\"_2xQx4j6lBnDGQ8QsRnJEJa\" placeholder=\"Search\" value=\"\" /-->
      </form>\n 
      <div class:test=\"a\">
      </div>
    ";

    parse(source, "id", "url").unwrap();
  }
}
