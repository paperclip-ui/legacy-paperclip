/*

Considerations:

- nested styles
- exported styles (may wany to lint exports if all PC files are provided)
- sibling selectors

*/

use super::virt::{Node as VirtNode, Element as VirtElement};
use crate::css::ast as css_ast;
use crate::css::parser::{parse as parse_css};
use super::evaluator::{evaluate as evaluate_pc, __test__evaluate_source as __test__evaluate_pc_source, EngineMode};
use crate::pc::parser::{parse as parse_pc};
use crate::core::graph::{Dependency, DependencyGraph, DependencyContent};
use crate::core::vfs::VirtualFileSystem;

// Note that we 
pub fn get_matching_elements<'a, 'b>(selector_text: &'b str, document: &'a VirtNode) -> Vec<&'a VirtElement> {

  // necessary to use selector text here since we're pulling from virt CSSOM, and _that_'s necessary
  // since we may be dealing with nested styles and such -- that information is included in the style selector, but is
  // lost within the CSS AST (unless parent el or scope is provided for context - that's just too cumbersome). We can
  // deal with the performance penalty 😭
  let selector = parse_css_selector(selector_text).unwrap();

  let mut matching_elements: Vec<&'a VirtElement> = Vec::new();

  add_matching_elements(&selector, document, &mut matching_elements);

  return matching_elements;
}

fn add_matching_elements<'a, 'b>(selector: &css_ast::Selector, node: &'a VirtNode, matching_elements: &'b mut Vec<&'a VirtElement>) {
  match node {
    VirtNode::Fragment(fragment) => {
      for child in &fragment.children {
        add_matching_elements(selector, child, matching_elements);
      }
    }
    VirtNode::Element(element) => {

      // need to traverse this leaf particulary to cover ancestor & sibling selectors
      let matching_element_option = get_matching_element(selector, element);

      if let Some(matching_element) = matching_element_option {
        matching_elements.push(matching_element);
      }

      for child in &element.children {
        add_matching_elements(selector, child, matching_elements);
      }
    }
    _ => {
      // noop
    }
  }
}


fn get_matching_element<'a, 'b>(selector: &css_ast::Selector, element: &'a VirtElement) -> Option<&'a VirtElement> {

  match selector {

    // a, b, c
    css_ast::Selector::Group(sel) => {
      panic!("TODO");
    }


    // a[b]
    css_ast::Selector::Combo(sel) => {
      panic!("TODO");
    }

    // :hover
    css_ast::Selector::PseudoElement(sel) => {
      panic!("TODO");
    }

    // :nth-child(2n)
    css_ast::Selector::PseudoParamElement(sel) => {
      panic!("TODO");
    }

    // a b
    css_ast::Selector::Descendent(sel) => {
      panic!("TODO");
    }

    // ??
    css_ast::Selector::SubElement(sel) => {
      panic!("TODO");
    }

    // :global(a)
    css_ast::Selector::Global(_) | css_ast::Selector::Prefixed(_) | css_ast::Selector::None | css_ast::Selector::This(_)  | css_ast::Selector::Within(_) => {
      panic!("Unsupported selector for match.");
    }

    // :not(a)
    css_ast::Selector::Not(not) => {
      panic!("TODO");
    }

    // a > b
    css_ast::Selector::Child(sel) => {
      panic!("TODO");
    }
    // a + b
    css_ast::Selector::Adjacent(sel) => {
      panic!("TODO");
    }
    // a ~ b
    css_ast::Selector::Sibling(sel) => {
      panic!("TODO");
    }
    // #id
    css_ast::Selector::Id(sel) => {
      panic!("TODO");
    }
    // #id
    css_ast::Selector::Id(sel) => {
      panic!("TODO");
    }
    // .class
    css_ast::Selector::Class(sel) => {
      panic!("TODO");
    }
    // *
    css_ast::Selector::AllSelector => {
      panic!("TODO");
    }
    css_ast::Selector::Element(el) => {
      if el.tag_name == element.tag_name {
        return Some(element);
      }
    }
    css_ast::Selector::Attribute(sel) => {
      if let Some(operator) = &sel.operator {
        return element.get_attribute(&sel.name).and_then(|value_option| {
          value_option
        }).and_then(|value| {
          if let Some(attr_value) = &sel.value {
            Some((attr_value, value))
          } else {
            None
          }
        }).and_then(|(attr_value, value)| {
          match operator.as_str() {
            "=" => {
              if attr_value == &value {
                return Some(element);
              }
            }
            _ => {
            }
          }
          return None;
        });

      } else {
        if element.get_attribute(&sel.name) != None {
          return Some(element);
        }
      }
    }
  }


  None
}

#[cfg(test)]
mod tests {
  use super::super::super::parser::*;
  use super::*;

  // ID

  #[test]
  fn can_match_tag_name_selector() {
    let selector_source = "div";
    let pc_source = "<div /><span />";  
    let eval_info = __test__evaluate_pc_source(pc_source).unwrap();
    let elements = get_matching_elements(&selector_source, &eval_info.preview);
    assert_eq!(elements.len(), 1);
  }

  #[test]
  fn can_match_attr() {
    let selector_source = "[href]";
    let pc_source = "<a href='#' /> <a />";  
    let eval_info = __test__evaluate_pc_source(pc_source).unwrap();
    let elements = get_matching_elements(&selector_source, &eval_info.preview);
    assert_eq!(elements.len(), 1);
  }

  #[test]
  fn can_match_attr_with_value() {
    let selector_source = "[href=#]";
    let pc_source = "<a href='#' /><a href='##' />";  
    let eval_info = __test__evaluate_pc_source(pc_source).unwrap();
    let elements = get_matching_elements(&selector_source, &eval_info.preview);
    assert_eq!(elements.len(), 1);
  }
  
  #[test]
  fn can_match_id_selector() {
    let selector_source = "#a";
    let pc_source = "<div id='a' /><div id='b' />";  
    let eval_info = __test__evaluate_pc_source(pc_source).unwrap();
    let elements = get_matching_elements(&selector_source, &eval_info.preview);
    assert_eq!(elements.len(), 1);
  }

  
  #[test]
  fn can_match_sibling_selector() {
    let selector_source = "a + b";
  }

  #[test]
  fn can_match_adjacent_selector() {
    let selector_source = "a ~ b";
  }

  // ANCESTORS

  #[test]
  fn can_match_ancestor_selector() {
    let selector_source = "[href=#]";
    let pc_source = "<a href='#' /><a href='##' />";  
    let eval_info = __test__evaluate_pc_source(pc_source).unwrap();
    let elements = get_matching_elements(&selector_source, &eval_info.preview);
    assert_eq!(elements.len(), 1);
  }
}


fn parse_css_selector<'a>(selector: &'a str) -> Option<css_ast::Selector> {
  let rule = format!("{}{{}}", selector);
  let ast: css_ast::Sheet = parse_css(&rule).unwrap();
  let rule = ast.rules.get(0).unwrap();
  match rule {
    css_ast::Rule::Style(style) => {
      return Some(style.selector.clone());
    },
    _ => {
      return None;
    }
  }
}