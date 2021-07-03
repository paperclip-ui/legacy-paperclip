/*

Considerations:

- nested styles
- exported styles (may wany to lint exports if all PC files are provided)
- sibling selectors

*/

/*

Brainstorm:

a b {

}


<a>
  <a> 
    <b />
  </a>
  <b>
  </b>
</a>


traversing from the selected element all the way to the root is a bit finicky considering that we still
need to traverse _down_ from the outermost selector ast. For example "a b" can be expressed as:

{
  type: "Descendent",
  ancestor: { type: "tag", name: "a" },
  descendent: { type: "tag", name: "b" }
}

If we're applying logic via `matches_element("a b", b, b_path, root)`, then we have 2 options:


1. match specific leafs and traverse _up_ to make sure the selector matches with ancestors. 
2. traverse starting from ancestors - this will cause duplicate items to be added to the matched selectors (see above). Very expensive since this demands extra
recursion: `a b -> <a><a><b /></a></a>` would match b _twice_

1 is prefered. Maybe there's a way to invert this for performance? selector.invert() could yield:

{
  selector: {
    type: "tag",
    name: "a"
  },
  parent: {
    type: "Descendent",
    selector: {
      type: "a"
    }
  }
}

The _good_ news is that I think there are only a few selectors that would need inverted rules:

- `a b`
- `a > b`

Doubly nested selectors? `a > b[href] c` would yield:

{
  selector: {
    type: "tag",
    name: "c"
  },
  next: {
    type: "Ancestor",
    selector: {
      type: "Combo",
      selectors
    },
    next: {
      type: "Parent"
    },
    selector: {}
  }
}

Combo selectors? `a b, c > d` would yield: 

{
  type: "Combo",
  selectors: {
    type: "Inverted",
  }
}


*/

use super::evaluator::{
  evaluate as evaluate_pc, EngineMode, __test__evaluate_source as __test__evaluate_pc_source,
};
use super::virt::{Element as VirtElement, Node as VirtNode};
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph};
use crate::core::vfs::VirtualFileSystem;
use crate::css::ast as css_ast;
use crate::css::parser::parse as parse_css;
use crate::pc::parser::parse as parse_pc;

#[derive(Debug)]
struct Context<'a> {
  path: Vec<(usize, &'a VirtNode)>
}

impl<'a> Context<'a> {
  fn new() -> Context<'a> {
    Context {
      path: Vec::new()
    }
  }
  fn child(&self, index: usize, parent:&'a VirtNode) -> Context<'a> {
    let mut path = self.path.clone();
    path.push((index, parent));
    Context {
      path
    }
  }
  fn parent_context(&self) -> Option<Context<'a>> {
    if self.path.len() == 0 {
      return None
    }
    let mut path = self.path.clone();
    path.pop();

    Some(Context {
      path
    })
  }
  fn parent_element(&self) -> Option<&'a VirtNode> {
    if let Some((index, parent)) = self.path.last() {
      return Some(parent);
    }
    return None;
  }
  fn index(&self) -> Option<usize> {
    return self.path.last().and_then(|(index, _)| {
      return Some(*index)
    })
  }
  fn target(&self) -> Option<&'a VirtNode> {
    if let Some((index, parent)) = self.path.last() {
      return parent.get_children().and_then(|children| {
        children.get(*index)
      })
    }
    return None;
  }
}

// Note that we
pub fn get_matching_elements<'a, 'b>(
  selector_text: &'b str,
  document: &'a VirtNode,
) -> Vec<&'a VirtElement> {
  // necessary to use selector text here since we're pulling from virt CSSOM, and _that_'s necessary
  // since we may be dealing with nested styles and such -- that information is included in the style selector, but is
  // lost within the CSS AST (unless parent el or scope is provided for context - that's just too cumbersome). We can
  // deal with the performance penalty 😭
  let selector = parse_css_selector(selector_text).unwrap();

  let mut matching_elements: Vec<&'a VirtElement> = Vec::new();

  add_matching_elements(&selector, document, Context::new(), &mut matching_elements);

  return matching_elements;
}

fn add_matching_elements<'a, 'b>(
  selector: &css_ast::Selector,
  node: &'a VirtNode,
  context: Context,
  matching_elements: &'b mut Vec<&'a VirtElement>,
) {

  if let VirtNode::Element(element) = node {
    if selector_matches_element(selector, element, &context) {
      matching_elements.push(element);
    }
  }

  if let Some(children) = node.get_children() {
    for (i, child) in children.iter().enumerate() {
      add_matching_elements(selector, child, context.child(i, node), matching_elements);
    }
  }

}

fn selector_matches_element<'a, 'b>(
  selector: &css_ast::Selector,
  element: &'a VirtElement,
  context: &'a Context
) -> bool {
  match selector {
    // a, b, c
    css_ast::Selector::Group(sel) => {
      for selector in &sel.selectors {
        if selector_matches_element(&selector, element, context) {
          return true;
        }
      }
    }

    // a[b]
    css_ast::Selector::Combo(sel) => {
      for selector in &sel.selectors {
        if !selector_matches_element(selector, element, context) {
          return false;
        }
      }
      return true;
    }

    // :hover
    css_ast::Selector::PseudoElement(sel) => {
      return true;
    }

    // :nth-child(2n)
    css_ast::Selector::PseudoParamElement(sel) => {


      // TODO - need to do simple parse logic
      return true;
    }

    // a b c d -> [a [b [c d]]]
    // This is a bit tricky, but basically what's happening is that we're
    // starting from the right-most descendent -- that recursively looks up using corresponding
    // ancestor selectors along the way. Ancestor selectors are always _leaf_ selectors.
    css_ast::Selector::Descendent(sel) => {

      // _may_ be a descendent element
      if !selector_matches_element(&sel.descendent, element, context) {
        return false;
      }

      let mut ancestor_context_option = context.parent_context();

      // Loop through parents until there is a match
      while let Some(ancestor_context) = ancestor_context_option {
        if let Some(ancestor_target) = ancestor_context.target() {
          if let VirtNode::Element(ancestor_element) = ancestor_target {

            // this will *always* be a leaf selector
            if selector_matches_element(&sel.ancestor, ancestor_element, &ancestor_context) {
              return true;
            }
          }
        } else {
          break;
        }
        ancestor_context_option = ancestor_context.parent_context();
      }

      return false;
    }

    // :has
    css_ast::Selector::SubElement(sel) => {
      return context.target().and_then(|self_context| {
        Some(selector_matches_nested_element(&sel.selector, self_context, &context))
      }).unwrap_or(false);
    }


    // :global(a)
    css_ast::Selector::Global(_)
    | css_ast::Selector::Prefixed(_)
    | css_ast::Selector::None
    | css_ast::Selector::This(_)
    | css_ast::Selector::Within(_) => {
      panic!("Unsupported selector for match.");
    }

    // :not(a)
    css_ast::Selector::Not(not) => {
      return !selector_matches_element(&not.selector, element, context);
    }

    // a > b
    css_ast::Selector::Child(sel) => {
      if !selector_matches_element(&sel.child, element, context) {
        return false;
      }

      return context.parent_context()
      .and_then(|parent_context| {
        return parent_context.target().and_then(|parent_node| {
          if let VirtNode::Element(parent_element) = parent_node {
            Some(selector_matches_element(&sel.parent, &parent_element, &parent_context))
          } else {
            None
          }
        });
      }).unwrap_or(false);
    }
    // a + b
    css_ast::Selector::Adjacent(sel) => {
      if !selector_matches_element(&sel.next_sibling_selector, element, context) {
        return false;
      }

      return context.parent_element().and_then(|parent| {
        parent.get_children()
      })
      .and_then(|children| {

        
        let index = context.index().unwrap();

        // <a />ff<b /> is totally valid - just find next adjascent element
        for i in (0..index).rev() {
          let sibling = children.get(i);
          if let Some(node) = sibling {
            if let VirtNode::Element(element) = node {
              if selector_matches_element(&sel.selector, &element, &context.parent_context().unwrap().child(i, node)) {
                return Some(true);
              }

              return Some(false);
            }
          }
        }

        Some(false)
      }).unwrap_or(false);
    }
    // a ~ b
    css_ast::Selector::Sibling(sel) => {
      if !selector_matches_element(&sel.sibling_selector, element, context) {
        return false;
      }

      return context.parent_element().and_then(|parent| {
        parent.get_children()
      })
      .and_then(|children| {

        let index = context.index().unwrap();

        // <a />ff<b /> is totally valid - just find next adjascent element
        for i in (0..index).rev() {
          let sibling = children.get(i);
          if let Some(node) = sibling {
            if let VirtNode::Element(element) = node {
              if selector_matches_element(&sel.selector, &element, &context.parent_context().unwrap().child(i, node)) {
                return Some(true);
              }
            }
          }
        }

        Some(false)
      }).unwrap_or(false);
    }
    // #id
    css_ast::Selector::Id(sel) => {
      return element.get_attribute("id").and_then(|id_attr| {
        return id_attr;
      }).and_then(|id| {
        Some(id == sel.id)
      }).unwrap_or(false);
    }
    // .class
    css_ast::Selector::Class(sel) => {
      return element.get_attribute("class").
      and_then(|value_option| {
        value_option
      })
      .and_then(|classes| {
        for class in classes.split(" ").into_iter() {
          if class == sel.class_name {
            return Some(true);
          }
        }
        Some(false)
      }).unwrap_or(false);
    }
    // *
    css_ast::Selector::AllSelector => {
      return true;
    }
    css_ast::Selector::Element(sel) => {
      if sel.tag_name == element.tag_name {
        return true;
      }
    }
    css_ast::Selector::Attribute(sel) => {
      if let Some(operator) = &sel.operator {
        return element
          .get_attribute(&sel.name)
          .and_then(|value_option| value_option)
          .and_then(|value| {
            if let Some(attr_value) = &sel.value {
              Some((attr_value, value))
            } else {
              None
            }
          })
          .and_then(|(attr_value, value)| {
            match operator.as_str() {
              "=" => {
                if attr_value == &value {
                  return Some(true);
                }
              }
              _ => {}
            }
            return Some(false);
          }).unwrap_or(false);
      } else {
        if element.get_attribute(&sel.name) != None {
          return true;
        }
      }
    }
  }

  false
}

fn selector_matches_nested_element<'a>(selector: &css_ast::Selector, parent: &'a VirtNode, context: &'a Context) -> bool {
  if let Some(children) = parent.get_children() {
    for (i, child) in children.iter().enumerate() {
      if let VirtNode::Element(child_element) = child {
        if selector_matches_element(selector, child_element, &context.child(i, parent)) {
          return true;
        }
      }
    }
  }

  return false;
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
  fn can_match_adj_selector() {
    let selector_source = "a + b";
    let pc_source = "<a /><b />";
    let eval_info = __test__evaluate_pc_source(pc_source).unwrap();
    let elements = get_matching_elements(&selector_source, &eval_info.preview);
    assert_eq!(elements.len(), 1);
  }


  #[test]
  fn can_match_nested_adj_selector() {
    let selector_source = "a + b";
    let pc_source = "<div><a /><b /></div>";
    let eval_info = __test__evaluate_pc_source(pc_source).unwrap();
    let elements = get_matching_elements(&selector_source, &eval_info.preview);
    assert_eq!(elements.len(), 1);
  }

  #[test]
  fn can_match_sib_selector() {
    let selector_source = "a ~ b";
    let pc_source = "<div><a /><c /><b /></div>";
    let eval_info = __test__evaluate_pc_source(pc_source).unwrap();
    let elements = get_matching_elements(&selector_source, &eval_info.preview);
    assert_eq!(elements.len(), 1);
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


  #[test]
  fn can_match_various_selectors() {

    let cases = [

      // element selectors
      ("div", "<div /><span />", 1),
      (".div", "<div class='div b c' /><div class='div2' />", 1),
      ("#div", "<div id='div' /><div />", 1),
      ("[href=#]", "<a href='#' /><a href='##' />", 1),
      ("a[href]", "<a href='#' /><a href /><div />", 2),
      ("a:before", "<a href='#' />", 1),
      ("div:nth-child(2)", "<div /><div /><div /><div />", 4),
      ("div:not(.a)", "<div class='a' /><div class='b c' /><div class='b a' />" , 1),
      ("a b c", "<a><b><c /></b></a>" , 1),
      ("a c", "<a><b><c /></b><c /></a>" , 2),
      ("a > c", "<a><b><c /></b><c /></a>" , 1),
      (".a, .b", "<div class='a' /><div class='b c' /><div class='b a' />" , 3),
      ("*", "<div class='a' /><div class='b c' /><div class='b a' />" , 3)
    ];

    for (selector, html, count) in cases.iter() {
      println!("{}", selector);
      let eval_info = __test__evaluate_pc_source(html).unwrap();
      let elements = get_matching_elements(&selector, &eval_info.preview);
      assert_eq!(elements.len() as i32, *count);
    }
  }
}

fn parse_css_selector<'a>(selector: &'a str) -> Option<css_ast::Selector> {
  let rule = format!("{}{{}}", selector);
  let ast: css_ast::Sheet = parse_css(&rule).unwrap();
  let rule = ast.rules.get(0).unwrap();
  match rule {
    css_ast::Rule::Style(style) => {
      return Some(style.selector.clone());
    }
    _ => {
      return None;
    }
  }
}
