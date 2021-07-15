use crate::css::parser::{parse_selector};
use crate::css::ast::{Selector};

pub fn get_selector_text_specificity(selector_text: &String) -> i32 {
  let ast = parse_selector(selector_text);
  0
}

// https://specificity.keegan.st/
fn calc_specificity(selector: &Selector) -> i32 {
  match selector {
    Selector::Element(_) => {
      3
    },
    Selector::Global(_) => {
      0
    },
    Selector::Group(_) => {
      0
    }
  }
}