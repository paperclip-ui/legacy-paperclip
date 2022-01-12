use super::super::declaration_value_ast as decl_ast;
use super::super::media_ast::*;
use super::super::media_parser::parse as parse_media;

pub struct Options {
  pub screen_width: u32,
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
  match query {
    MediaQuery::Ident(ident) => match_ident(ident, options),
    _ => false,
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

fn match_and(ast: &MediaCompound, options: &Options) -> bool {
  match_in_parens(ast.condition.as_ref(), options)
    && ast
      .rest
      .iter()
      .all(|condition| match_in_parens(condition, options))
}

fn match_not(_ast: &MediaNot, _options: &Options) -> bool {
  false
}

fn match_or(_ast: &MediaCompound, _options: &Options) -> bool {
  false
}

fn match_in_parens(ast: &MediaInParens, options: &Options) -> bool {
  match ast {
    MediaInParens::Condition(condition) => match_condition(condition, options),
    MediaInParens::Feature(feature) => match_feature(feature, options),
  }
}

fn match_condition(ast: &MediaCondition, options: &Options) -> bool {
  match ast {
    MediaCondition::MediaAnd(and) => match_and(and, options),
    MediaCondition::MediaOr(or) => match_or(or, options),
    MediaCondition::MediaNot(not) => match_not(not, options),
  }
}

fn match_feature(ast: &MediaFeature, options: &Options) -> bool {
  match ast {
    MediaFeature::Plain(plain) => match_mf_plain(plain, options),
  }
}

fn match_mf_plain(ast: &MFPlain, options: &Options) -> bool {
  if let Some(unit_value) = get_mf_plain_unit_value(&ast.value, options) {
    return if ast.name == "min-width" {
      options.screen_width >= unit_value
    } else if ast.name == "max-width" {
      options.screen_width <= unit_value
    } else {
      false
    };
  } else {
    false
  }
}

fn get_mf_plain_unit_value(ast: &decl_ast::Expression, _options: &Options) -> Option<u32> {
  match ast {
    decl_ast::Expression::Value(value) => {
      match value {
        decl_ast::Value::Dimension(dim) => {
          if let Ok(number) = dim.value.to_u32() {
            // TODO, rem, em, etc
            if dim.unit == "px" {
              Some(number)
            } else {
              None
            }
          } else {
            None
          }
        }
        decl_ast::Value::Number(value) => {
          if let Ok(number) = value.to_u32() {
            Some(number)
          } else {
            None
          }
        }
        _ => None,
      }
    }
    _ => None,
  }
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
      ("screen and (max-width: 500px)", 600, false),
      (
        "screen and (min-width: 100px) and (max-width: 500px)",
        300,
        true,
      ),
      (
        "screen and (min-width: 100px) and (max-width: 500px)",
        600,
        false,
      ),
    ];

    for (condition, screen_width, matches) in cases.iter() {
      assert_eq!(media_matches(condition, *screen_width), *matches);
    }
  }
}
