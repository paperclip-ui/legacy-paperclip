use crate::css::ast::Selector;

pub fn get_selector_text_specificity(selector: &Selector) -> i32 {
  let specificity = calc_specificity(selector);
  specificity
}

// https://specificity.keegan.st/
fn calc_specificity(selector: &Selector) -> i32 {
  match selector {
    Selector::Element(_) => 1,
    Selector::Global(_) => 0,

    // ID overrides everything, so just give a really high number
    Selector::Id(_) => 9999,

    // :not
    Selector::Not(not) => calc_specificity(&not.selector),
    Selector::Prefixed(_) => 0,

    // TODO
    Selector::PseudoElement(_) => 1,

    // TODO
    Selector::PseudoParamElement(_) => 1,

    // a + b
    Selector::Sibling(selector) => {
      calc_specificity(&selector.selector) + calc_specificity(&selector.sibling_selector)
    }

    // No matches
    Selector::Group(_) => 0,
    Selector::SubElement(_) => 0,
    Selector::This(_) => 0,
    Selector::Within(_) => 0,

    // a ~ b
    Selector::Adjacent(selector) => {
      calc_specificity(&selector.selector) + calc_specificity(&selector.next_sibling_selector)
    }

    // a > b
    Selector::Child(selector) => {
      calc_specificity(&selector.parent) + calc_specificity(&selector.child)
    }

    // a b
    Selector::Descendent(selector) => {
      calc_specificity(&selector.ancestor) + calc_specificity(&selector.descendent)
    }

    // TODO
    Selector::Class(_) => 2,

    // TODO
    Selector::Combo(selector) => selector
      .selectors
      .iter()
      .fold(0, |sum, child| sum + calc_specificity(child)),

    // TODO
    Selector::AllSelector(_) => 1,

    // TODO
    Selector::Attribute(_) => 2,
  }
}

#[cfg(test)]
mod tests {
  use super::super::super::parser::*;
  use super::*;

  #[test]
  fn can_calc_specificity_for_various_selectors() {
    let cases = [
      ("div", 1),
      (".a.b.c.d[a=b]", 10),
      ("a > b", 2),
      ("a b", 2),
      ("a ~ b", 2),
      ("a + b", 2),
      ("*", 1),
      ("*", 1),
    ];

    for (selector_text, expected_specificity) in cases.iter() {
      let selector = parse_selector(selector_text, None).unwrap();
      let specificity = calc_specificity(&selector);
      assert_eq!(specificity, *expected_specificity);
    }
  }
}
