// https://tympanus.net/codrops/css_reference/

use super::ast as pc_ast;
use super::tokenizer::{Token, Tokenizer};
use crate::base::ast::Location;
use crate::base::parser::{get_buffer, ParseError};
use crate::css::parser::parse_with_tokenizer as parse_css_with_tokenizer;
use crate::css::tokenizer::{Token as CSSToken, Tokenizer as CSSTokenizer};
use crate::js::ast as js_ast;
use crate::js::parser::parse_with_tokenizer as parse_js_with_tokenizer;
use crate::js::tokenizer::{Token as JSToken, Tokenizer as JSTokenizer};

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

pub fn parse<'a>(source: &'a str) -> Result<pc_ast::Node, ParseError> {
  parse_fragment(&mut Tokenizer::new(source))
}

fn parse_fragment<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<pc_ast::Node, ParseError> {
  let start = tokenizer.utf16_pos;
  let mut children: Vec<pc_ast::Node> = vec![];

  while !tokenizer.is_eof() {
    children.push(parse_node(tokenizer)?);
  }

  Ok(pc_ast::Node::Fragment(pc_ast::Fragment {
    children,
    location: Location::new(start, tokenizer.utf16_pos),
  }))
}

fn parse_node<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<pc_ast::Node, ParseError> {
  let start = tokenizer.get_pos();
  tokenizer.eat_whitespace();

  // Kinda ick, but cover case where last node is whitespace.
  let token = tokenizer.peek_eat_whitespace(1).or_else(|_| {
    tokenizer.set_pos(&start);
    tokenizer.peek(1)
  })?;

  match token {
    Token::CurlyOpen => parse_slot(tokenizer),
    Token::LessThan => parse_tag(tokenizer),
    Token::HtmlCommentOpen => {
      tokenizer.next()?; // eat HTML comment open
      let buffer = get_buffer(tokenizer, |tokenizer| {
        let tok = tokenizer.peek(1)?;
        Ok(tok != Token::HtmlCommentClose)
      })?
      .to_string();
      let end = tokenizer.get_pos();
      tokenizer.next()?; // eat -->
      Ok(pc_ast::Node::Comment(pc_ast::ValueObject {
        value: buffer.clone(),
        location: Location {
          start: start.u16_pos,
          end: end.u16_pos,
        },
      }))
    }
    Token::TagClose => {
      let start = tokenizer.utf16_pos;
      tokenizer.next_expect(Token::TagClose)?;
      let tag_name = parse_tag_name(tokenizer)?;
      tokenizer.next_expect(Token::GreaterThan)?;

      let message = if is_void_tag_name(tag_name.as_str()) {
        "Void tag's shouldn't be closed."
      } else {
        "Closing tag doesn't have an open tag."
      };

      Err(ParseError::unexpected(
        message.to_string(),
        start,
        tokenizer.utf16_pos,
      ))
    }
    _ => {
      // reset pos to ensure text doesn't get chopped (e.g: `{children} text`)
      tokenizer.set_pos(&start);
      let value = get_buffer(tokenizer, |tokenizer| {
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
        Err(ParseError::unexpected_token(tokenizer.utf16_pos))
      } else {
        Ok(pc_ast::Node::Text(pc_ast::ValueObject {
          value: value.clone(),
          location: Location {
            start: start.u8_pos,
            end: tokenizer.utf16_pos,
          },
        }))
      }
    }
  }
}

fn parse_slot<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<pc_ast::Node, ParseError> {
  let start = tokenizer.utf16_pos;
  let omit_from_compilation = parse_omit_from_compilation(tokenizer)?;
  tokenizer.next_expect(Token::CurlyOpen)?;
  let script = parse_slot_script(tokenizer)?;
  Ok(pc_ast::Node::Slot(pc_ast::Slot {
    omit_from_compilation,
    script,
    location: Location::new(start, tokenizer.utf16_pos),
  }))
}

fn parse_slot_script<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<js_ast::Statement, ParseError> {
  let start = tokenizer.utf16_pos;
  let mut js_tokenizer = JSTokenizer::new_from_bytes(&tokenizer.source, tokenizer.get_pos());
  let stmt = parse_js_with_tokenizer(&mut js_tokenizer, |token| token != JSToken::CurlyClose)
    .and_then(|script| {
      tokenizer.set_pos(&js_tokenizer.get_pos());
      tokenizer.next_expect(Token::CurlyClose)?;
      Ok(script)
    })
    .or(Err(ParseError::unterminated(
      "Unterminated slot.".to_string(),
      start,
      tokenizer.utf16_pos,
    )));

  stmt
}

pub fn parse_tag<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<pc_ast::Node, ParseError> {
  let start = tokenizer.utf16_pos;

  tokenizer.next_expect(Token::LessThan)?;
  parse_element(tokenizer, start)
}

fn parse_element<'a>(
  tokenizer: &mut Tokenizer<'a>,
  start: usize,
) -> Result<pc_ast::Node, ParseError> {
  let tag_name = parse_tag_name(tokenizer)?;
  let tag_name_end = tokenizer.utf16_pos;

  let attributes = parse_attributes(tokenizer)?;

  if tag_name == "style" {
    parse_next_style_element_parts(attributes, tokenizer, start)
  } else if tag_name == "script" {
    parse_next_script_element_parts(attributes, tokenizer, start)
  } else {
    parse_next_basic_element_parts(tag_name, tag_name_end, attributes, tokenizer, start)
  }
}

fn is_void_tag_name<'a>(tag_name: &'a str) -> bool {
  match tag_name {
    "area" | "base" | "basefont" | "bgsound" | "br" | "col" | "command" | "embed" | "frame"
    | "hr" | "image" | "import" | "img" | "input" | "isindex" | "keygen" | "link" | "menuitem"
    | "meta" | "property" | "logic" | "nextid" | "param" | "source" | "track" | "wbr" => true,
    _ => false,
  }
}

fn parse_next_basic_element_parts<'a>(
  tag_name: String,
  tag_name_end: usize,
  attributes: Vec<pc_ast::Attribute>,
  tokenizer: &mut Tokenizer<'a>,
  start: usize,
) -> Result<pc_ast::Node, ParseError> {
  let mut children: Vec<pc_ast::Node> = vec![];

  tokenizer.eat_whitespace();
  let mut end = tokenizer.utf16_pos;

  match tokenizer.peek(1)? {
    Token::SelfTagClose => {
      tokenizer.next()?;
      end = tokenizer.utf16_pos;
    }
    Token::GreaterThan => {
      tokenizer.next()?;
      end = tokenizer.utf16_pos;
      if !is_void_tag_name(tag_name.as_str()) {
        tokenizer.eat_whitespace();
        while !tokenizer.is_eof() && tokenizer.peek_eat_whitespace(1)? != Token::TagClose {
          children.push(parse_node(tokenizer)?);
        }

        parse_close_tag(&tag_name.as_str(), tokenizer, start, end)?;
      }
    }
    _ => return Err(ParseError::unexpected_token(tokenizer.utf16_pos)),
  }

  let el = pc_ast::Element {
    tag_name_location: Location {
      start: start + 1,
      end: tag_name_end,
    },
    open_tag_location: Location { start, end },
    location: Location {
      start,
      end: tokenizer.utf16_pos,
    },
    tag_name,
    attributes,
    children,
  };
  Ok(pc_ast::Node::Element(el))
}

fn parse_next_style_element_parts<'a>(
  attributes: Vec<pc_ast::Attribute>,
  tokenizer: &mut Tokenizer<'a>,
  start: usize,
) -> Result<pc_ast::Node, ParseError> {
  tokenizer.next_expect(Token::GreaterThan)?; // eat >
  let end = tokenizer.utf16_pos;
  let mut css_tokenizer = CSSTokenizer::new_from_bytes(&tokenizer.source, tokenizer.get_pos());

  let sheet = parse_css_with_tokenizer(
    &mut css_tokenizer,
    |tokenizer| -> Result<bool, ParseError> {
      Ok(tokenizer.peek(1)? == CSSToken::Byte(b'<') && tokenizer.peek(2)? == CSSToken::Byte(b'/'))
    },
  )?;
  tokenizer.set_pos(&css_tokenizer.get_pos());

  // TODO - assert tokens equal these
  parse_close_tag("style", tokenizer, start, end)?;

  Ok(pc_ast::Node::StyleElement(pc_ast::StyleElement {
    attributes,
    sheet,
    location: Location::new(start, tokenizer.utf16_pos),
  }))
}

fn parse_close_tag<'a, 'b>(
  tag_name: &'a str,
  tokenizer: &mut Tokenizer<'b>,
  start: usize,
  end: usize,
) -> Result<(), ParseError> {
  let end_tag_name_start = tokenizer.utf16_pos;

  tokenizer.eat_whitespace();

  tokenizer
    .next_expect(Token::TagClose)
    .or(Err(ParseError::unterminated(
      "Unterminated element.".to_string(),
      start,
      end,
    )))?;

  parse_tag_name(tokenizer)
    // TODO - assert tag name
    .and_then(|end_tag_name| {
      if tag_name != end_tag_name {
        Err(ParseError::unterminated(
          "Incorrect closing tag.".to_string(),
          end_tag_name_start,
          tokenizer.utf16_pos,
        ))
      } else {
        Ok(())
      }
    })?;

  tokenizer
    .next_expect(Token::GreaterThan)
    .or(Err(ParseError::unterminated(
      "Unterminated element.".to_string(),
      start,
      end,
    )))?;

  Ok(())
}

fn parse_next_script_element_parts<'a>(
  attributes: Vec<pc_ast::Attribute>,
  tokenizer: &mut Tokenizer<'a>,
  start: usize,
) -> Result<pc_ast::Node, ParseError> {
  tokenizer.next_expect(Token::GreaterThan)?; // eat >
  let end = tokenizer.utf16_pos;

  get_buffer(tokenizer, |tokenizer| {
    Ok(tokenizer.peek(1)? != Token::TagClose)
  })?;

  parse_close_tag("script", tokenizer, start, end)?;

  Ok(pc_ast::Node::Element(pc_ast::Element {
    tag_name_location: Location {
      start: start + 1,
      end: start + 7,
    },
    open_tag_location: Location { start, end },
    location: Location {
      start,
      end: tokenizer.utf16_pos,
    },
    tag_name: "script".to_string(),
    attributes,
    children: vec![],
  }))
}

fn parse_tag_name<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<String, ParseError> {
  Ok(
    get_buffer(tokenizer, |tokenizer| {
      Ok(!matches!(
        tokenizer.peek(1)?,
        Token::Whitespace | Token::GreaterThan | Token::Equals | Token::SelfTagClose | Token::Colon
      ))
    })?
    .to_string(),
  )
}

fn parse_attributes<'a>(
  tokenizer: &mut Tokenizer<'a>,
) -> Result<Vec<pc_ast::Attribute>, ParseError> {
  let mut attributes: Vec<pc_ast::Attribute> = vec![];

  loop {
    tokenizer.eat_whitespace();
    match tokenizer.peek(1)? {
      Token::SelfTagClose | Token::GreaterThan => break,
      _ => {
        attributes.push(parse_attribute(tokenizer)?);
      }
    }
  }

  Ok(attributes)
}

fn parse_attribute<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<pc_ast::Attribute, ParseError> {
  if tokenizer.peek(1)? == Token::CurlyOpen {
    parse_shorthand_attribute(tokenizer)
  } else {
    parse_key_value_attribute(tokenizer)
  }
}

fn parse_omit_from_compilation<'a>(tokenizer: &mut Tokenizer<'a>) -> Result<bool, ParseError> {
  Ok(if tokenizer.peek(1)? == Token::Bang {
    tokenizer.next()?;
    true
  } else {
    false
  })
}

fn parse_shorthand_attribute<'a>(
  tokenizer: &mut Tokenizer<'a>,
) -> Result<pc_ast::Attribute, ParseError> {
  let omit_from_compilation = parse_omit_from_compilation(tokenizer)?;
  let start = tokenizer.utf16_pos;
  tokenizer.next_expect(Token::CurlyOpen)?;
  if tokenizer.peek(1)? == Token::Spread {
    tokenizer.next_expect(Token::Spread)?;
    let script = parse_slot_script(tokenizer)?;
    Ok(pc_ast::Attribute::SpreadAttribute(
      pc_ast::SpreadAttribute {
        omit_from_compilation,
        script,
        location: Location::new(start, tokenizer.utf16_pos),
      },
    ))
  } else {
    let reference = parse_slot_script(tokenizer)?;
    Ok(pc_ast::Attribute::ShorthandAttribute(
      pc_ast::ShorthandAttribute {
        reference,
        location: Location::new(start, tokenizer.utf16_pos),
      },
    ))
  }
}

fn parse_key_value_attribute<'a>(
  tokenizer: &mut Tokenizer<'a>,
) -> Result<pc_ast::Attribute, ParseError> {
  let start = tokenizer.utf16_pos;
  let name = parse_tag_name(tokenizer)?;

  if tokenizer.peek(1)? == Token::Colon {
    tokenizer.next()?; // eat :
    let binding_name = parse_tag_name(tokenizer)?;

    let mut value = None;

    if tokenizer.peek(1)? == Token::Equals {
      tokenizer.next()?; // eat =
      value = Some(parse_attribute_value(tokenizer)?);
    }

    Ok(pc_ast::Attribute::PropertyBoundAttribute(
      pc_ast::PropertyBoundAttribute {
        name,
        binding_name,
        value,
        location: Location::new(start, tokenizer.utf16_pos),
      },
    ))
  } else {
    let mut value = None;

    if tokenizer.peek(1)? == Token::Equals {
      tokenizer.next()?; // eat =
      value = Some(parse_attribute_value(tokenizer)?);
    }

    Ok(pc_ast::Attribute::KeyValueAttribute(
      pc_ast::KeyValueAttribute {
        name,
        value,
        location: Location::new(start, tokenizer.utf16_pos),
      },
    ))
  }
}

fn parse_attribute_value<'a>(
  tokenizer: &mut Tokenizer<'a>,
) -> Result<pc_ast::AttributeValue, ParseError> {
  let pos = tokenizer.utf16_pos;
  let parts: Vec<pc_ast::AttributeDynamicStringPart> = vec![];

  match tokenizer.peek(1)? {
    Token::SingleQuote | Token::DoubleQuote => parse_attribute_string_value(tokenizer),
    Token::CurlyOpen => parse_attribute_slot(tokenizer),
    _ => Err(ParseError::unexpected_token(pos)),
  }
}

fn parse_attribute_string_value<'a>(
  tokenizer: &mut Tokenizer<'a>,
) -> Result<pc_ast::AttributeValue, ParseError> {
  let pos = tokenizer.utf16_pos;
  let mut parts: Vec<pc_ast::AttributeDynamicStringPart> = vec![];

  let quote = tokenizer.next()?;

  while !tokenizer.is_eof() {
    let curr = tokenizer.peek(1)?;

    if curr == quote {
      break;
    }

    if curr == Token::Pierce {
      tokenizer.next()?; // eat >>>
      let class_name = get_buffer(tokenizer, |tokenizer| {
        let tok = tokenizer.peek(1)?;
        Ok(!matches!(tok, Token::Whitespace | Token::Pierce | Token::CurlyOpen) && tok != quote)
      })?
      .to_string();

      parts.push(pc_ast::AttributeDynamicStringPart::ClassNamePierce(
        pc_ast::AttributeDynamicStringClassNamePierce { class_name },
      ));
    } else if curr == Token::CurlyOpen {
      tokenizer.next_expect(Token::CurlyOpen)?;
      let script = parse_slot_script(tokenizer)?;
      parts.push(pc_ast::AttributeDynamicStringPart::Slot(script));
    } else {
      let start = tokenizer.utf16_pos;
      let value = get_buffer(tokenizer, |tokenizer| {
        let tok = tokenizer.peek(1)?;
        Ok(!matches!(tok, Token::Pierce | Token::CurlyOpen) && tok != quote)
      })?
      .to_string();
      parts.push(pc_ast::AttributeDynamicStringPart::Literal({
        pc_ast::AttributeDynamicStringLiteral {
          value,
          location: Location::new(start, tokenizer.utf16_pos),
        }
      }));
    }
  }

  tokenizer
    .next_expect(quote)
    .or(Err(ParseError::unterminated(
      "Unterminated string literal.".to_string(),
      pos,
      tokenizer.utf16_pos,
    )))?;

  let location = Location::new(pos + 1, tokenizer.utf16_pos - 1);

  if parts.len() == 0 {
    return Ok(pc_ast::AttributeValue::String(
      pc_ast::AttributeStringValue {
        value: "".to_string(),
        location,
      },
    ));
  }

  if parts.len() == 1 {
    if let pc_ast::AttributeDynamicStringPart::Literal(value) = &parts[0] {
      return Ok(pc_ast::AttributeValue::String(
        pc_ast::AttributeStringValue {
          value: value.value.clone(),
          location,
        },
      ));
    }
  }

  return Ok(pc_ast::AttributeValue::DyanmicString(
    pc_ast::AttributeDynamicStringValue {
      values: parts,
      location,
    },
  ));
}

fn parse_attribute_slot<'a>(
  tokenizer: &mut Tokenizer<'a>,
) -> Result<pc_ast::AttributeValue, ParseError> {
  let start = tokenizer.utf16_pos;
  tokenizer.next_expect(Token::CurlyOpen)?;
  let script = parse_slot_script(tokenizer)?;
  Ok(pc_ast::AttributeValue::Slot(pc_ast::AttributeSlotValue {
    script,
    location: Location::new(start, tokenizer.utf16_pos),
  }))
}

fn parse_attribute_string<'a>(
  tokenizer: &mut Tokenizer<'a>,
) -> Result<pc_ast::AttributeValue, ParseError> {
  let start = tokenizer.utf16_pos;
  let quote = tokenizer.next()?;

  get_buffer(tokenizer, |tokenizer| Ok(tokenizer.peek(1)? != quote))
    .and_then(|value| {
      tokenizer.next_expect(quote)?;
      Ok(value)
    })
    .or(Err(ParseError::unterminated(
      "Unterminated string literal.".to_string(),
      start,
      tokenizer.utf16_pos,
    )))
    .and_then(|value| {
      Ok(pc_ast::AttributeValue::String(
        pc_ast::AttributeStringValue {
          value: value.to_string(),
          location: Location::new(start + 1, tokenizer.utf16_pos - 1),
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
      <element data-and-an-attribute=\"value\" />
      <part onClick={on7Click}>
      </part>
      
      {10.10.10}
      
      <!-- void tags -->
      <br>
      <import>
      <logic>

      {block}

      <!-- historically broken stuff -->
      <meta charSet=\"utf-8\" />\n   
      <form action=\"/search/\" autoComplete=\"off\" method=\"get\" role=\"search\">
        <!--input type=\"search\" id=\"header-search-bar\" name=\"q\" class=\"_2xQx4j6lBnDGQ8QsRnJEJa\" placeholder=\"Search\" value=\"\" /-->
      </form>\n 
      <div class:test=\"a\">
      </div>
    ";

    parse(source).unwrap();
  }

  #[test]
  fn can_parse_various_nodes() {
    let cases = [
      // text blocks
      "text",
      // comments
      "ab <!--cd-->",
      // slots
      "{ok}",
      // elements
      "<div></div>",
      "<div a b></div>",
      "<div a=\"b\" c></div>",
      "<div a=\"\"></div>",
      "<div a=\"b\" c=\"d\">
        <span>
          c {block} d {block}
        </span>
        <span>
          color {block}
        </span>
      </div>",
      // mixed elements
    ];

    for i in 0..cases.len() {
      let case = cases[i];

      // TODO - strip whitespace
      let expr = parse(case).unwrap();
      assert_eq!(
        expr.to_string().replace("\n", "").replace(" ", ""),
        case.replace("\n", "").replace(" ", "")
      );
    }
  }

  ///
  /// Error handling
  ///

  #[test]
  fn displays_error_for_unterminated_element() {
    assert_eq!(
      parse("<div>"),
      Err(ParseError::unterminated(
        "Unterminated element.".to_string(),
        0,
        5
      ))
    );
  }

  #[test]
  fn displays_error_for_unterminated_style_element() {
    assert_eq!(
      parse("<style>"),
      Err(ParseError::unterminated(
        "Unterminated element.".to_string(),
        0,
        7
      ))
    );
  }

  #[test]
  fn displays_error_for_unterminated_script_element() {
    assert_eq!(
      parse("<script>"),
      Err(ParseError::unterminated(
        "Unterminated element.".to_string(),
        0,
        8
      ))
    );
  }

  #[test]
  fn displays_error_for_incorrect_close_tag() {
    assert_eq!(
      parse("<style></script>"),
      Err(ParseError::unterminated(
        "Incorrect closing tag.".to_string(),
        7,
        15
      ))
    );
  }

  #[test]
  fn displays_error_for_unterminated_attribute_string() {
    assert_eq!(
      parse("<div a=\"b>"),
      Err(ParseError::unterminated(
        "Unterminated string literal.".to_string(),
        7,
        10
      ))
    );
  }

  #[test]
  fn displays_error_for_unterminated_slot() {
    assert_eq!(
      parse("{ab"),
      Err(ParseError::unterminated(
        "Unterminated slot.".to_string(),
        1,
        3
      ))
    );
  }

  #[test]
  fn displays_css_errors() {
    assert_eq!(
      parse("<style>div { color: red; </style>"),
      Err(ParseError::unterminated(
        "Unterminated bracket.".to_string(),
        11,
        26
      ))
    );
  }

  #[test]
  fn display_error_for_close_tag_without_open() {
    assert_eq!(
      parse("</div>"),
      Err(ParseError::unexpected(
        "Closing tag doesn't have an open tag.".to_string(),
        0,
        6
      ))
    );
  }

  #[test]
  fn displays_error_if_void_close_tag_present() {
    assert_eq!(
      parse("</meta>"),
      Err(ParseError::unexpected(
        "Void tag's shouldn't be closed.".to_string(),
        0,
        7
      ))
    );
  }

  #[test]
  fn can_parse_slot_fragments() {
    parse(
      "<div a={<fragment>
      <div />
      <div />
    </fragment>} />",
    )
    .unwrap();
  }
}
