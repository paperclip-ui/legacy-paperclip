use crate::base::parser::ParseError;
use super::super::media_parser::{parse as parse_media};
use super::super::media_ast::*;

pub struct Options {
  pub screen_width: u32
}

pub fn media_matches<'a>(condition_text: &'a str, screen_width: u32) -> bool {
  let options = Options { screen_width };

  if let Ok(query_list) = parse_media(condition_text, "") {
    for query in &query_list.queries {
      if media_matches_query(query, &options) {
        return true;
      }
    }
  }
  return false;
}

fn media_matches_query(query: &MediaQuery, options: &Options) -> bool {
  println!("{:?}", query);
  match query {
    MediaQuery::Ident(ident) => {
      match_ident(ident, options)
    },
    _ => {
      false
    }
  }
}

fn match_ident(ast: &MediaIdent, options: &Options) -> bool {
  let result = if let Some(condition) = &ast.and_condition {
    match_condition_without_or(condition, options)
  } else {
    true
  };

  result
}

fn match_condition_without_or(ast: &MediaConditionWithoutOr, options: &Options) -> bool {
  match ast {
    MediaConditionWithoutOr::MediaAnd(and) => match_and(and, options),
    MediaConditionWithoutOr::MediaNot(not) => match_not(not, options),
    MediaConditionWithoutOr::InParens(in_parens) => match_in_parens(in_parens, options),
  }
}

fn match_and(ast: &MediaAnd, options: &Options) -> bool {
  false
}

fn match_not(ast: &MediaNot, options: &Options) -> bool {
  false
}

fn match_or(ast: &MediaOr, options: &Options) -> bool {
  false
}

fn match_in_parens(ast: &MediaInParens, options: &Options) -> bool {
  match ast {
    MediaInParens::Condition(condition) => match_condition(condition, options),
    MediaInParens::Feature(feature) => match_feature(feature, options)
  }
}

fn match_condition(ast: &MediaCondition, options: &Options) -> bool {
  match ast {
    MediaCondition::MediaAnd(and) => match_and(and, options),
    MediaCondition::MediaOr(or) => match_or(or, options),
    MediaCondition::MediaNot(not) => match_not(not, options)
  }
}

fn match_feature(ast: &MediaFeature, options: &Options) -> bool {
  match ast {
    MediaFeature::Plain(plain) => match_mf_plain(plain, options)
  }
}

fn match_mf_plain(ast: &MFPlain, options: &Options) -> bool {
  false
}


#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn can_smoke_parse_various_media_sizes() {
    let cases = [
      ("only screen", 0, true),
      ("screen", 0, true),
      ("screen, print", 0, true),
      ("screen and (max-width: 500px)", 0, true),
      ("screen and (max-width: 500px)", 600, false)
    ];

    for (condition, screen_width, matches) in cases.iter() {
      assert_eq!(media_matches(condition, *screen_width), *matches);
    }
  }
}