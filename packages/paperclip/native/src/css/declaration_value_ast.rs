use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "expressionKind")]
pub enum Expression {
  List(List),
  Group(Group),
  Value(Value),
}

// red, blue
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct List {
  pub items: Vec<ListItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "listItemKind")]
pub enum ListItem {
  Group(Group),
  Value(Value),
}

// 0px -10px repeat
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Group {
  pub parameters: Vec<Value>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "valueKind")]
pub enum Value {
  Dimension(Dimension),
  Number(Number),
  String(Str),
  Hex(Hex),
  Keyword(Keyword),
  FunctionCall(FunctionCall),
}

// 10px, 100em
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Dimension {
  pub value: Number,
  pub unit: String, // px, em
}

// #F60
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Hex {
  pub value: String,
}

// 'aab'
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Str {
  pub value: String,
}

// 100
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Number {
  pub value: String,
}

impl Number {
  pub fn to_f64(&self) -> Result<f64, std::num::ParseFloatError> {
    self.value.as_str().parse::<f64>()
  }
  pub fn to_f32(&self) -> Result<f32, std::num::ParseFloatError> {
    self.value.as_str().parse::<f32>()
  }
  pub fn to_u32(&self) -> Result<u32, std::num::ParseIntError> {
    self.value.as_str().parse::<u32>()
  }
}

// repeat, no-repeat, red
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Keyword {
  pub value: String,
}

// rgba(0, 0, 100, 150px)
#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct FunctionCall {
  name: String,
  parameters: Vec<Value>,
}
