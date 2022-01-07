// https://developer.mozilla.org/en-US/docs/Web/CSS/@media#media-query-list

use super::declaration_value_ast as decl_ast;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct MediaQueryList {
  pub queries: Vec<MediaQuery>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "mediaQueryKind")]
pub enum MediaQuery {
  // Condition(MediaCondition),
  Ident(MediaIdent),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct MediaIdent {
  pub only: Option<bool>, // not | only,
  pub media_type: String, // screen, print
  pub and_condition: Option<MediaConditionWithoutOr>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "mediaConditionWithoutOrKind")]
pub enum MediaConditionWithoutOr {
  MediaNot(MediaNot),
  MediaAnd(MediaCompound),
  InParens(MediaInParens),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct MediaNot {
  pub condition: Box<MediaInParens>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct MediaCompound {
  pub condition: Box<MediaInParens>,
  pub rest: Vec<MediaInParens>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "mediaInParensKind")]
pub enum MediaInParens {
  Condition(MediaCondition),
  Feature(MediaFeature),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "mediaFeatureKind")]
pub enum MediaFeature {
  Plain(MFPlain),
  // Boolean(MFBoolean),
  // Range(MFRange)
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "mediaFeatureKind")]
pub struct MFPlain {
  pub name: String,
  pub value: decl_ast::Expression,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "mediaConditionKind")]
pub enum MediaCondition {
  MediaNot(MediaNot),
  MediaAnd(MediaCompound),
  MediaOr(MediaCompound),
}
