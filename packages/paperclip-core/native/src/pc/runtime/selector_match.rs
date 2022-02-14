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

use super::virt::{Element as VirtElement, Node as VirtNode};
use crate::css::ast as css_ast;
use crate::css::parser::parse_selector as parse_css_selector;
use cached::proc_macro::cached;
use cached::SizedCache;
use regex::Regex;
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Debug)]
struct Context<'a> {
  path: Vec<(usize, &'a VirtNode)>,
}

impl<'a> Context<'a> {
  fn new() -> Context<'a> {
    Context { path: Vec::new() }
  }
  fn new_from_path(node_path: &Vec<usize>, document: &'a VirtNode) -> Option<Context<'a>> {
    let mut curr = Context::new();
    let mut parent = document;

    for i in node_path {
      let curr_option = parent
        .get_children()
        .and_then(|children| children.get(*i))
        .and_then(|child| Some(curr.child(*i, parent)));

      if let Some(new_curr) = curr_option {
        curr = new_curr;
        parent = curr.target().unwrap();
      } else {
        return None;
      }
    }

    Some(curr)
  }
  fn child(&self, index: usize, parent: &'a VirtNode) -> Context<'a> {
    let mut path = self.path.clone();
    path.push((index, parent));
    Context { path }
  }
  fn parent_context(&self) -> Option<Context<'a>> {
    if self.path.len() == 0 {
      return None;
    }
    let mut path = self.path.clone();
    path.pop();

    Some(Context { path })
  }
  fn parent_element(&self) -> Option<&'a VirtNode> {
    if let Some((index, parent)) = self.path.last() {
      return Some(parent);
    }
    return None;
  }
  fn index(&self) -> Option<usize> {
    return self.path.last().and_then(|(index, _)| return Some(*index));
  }
  fn target(&self) -> Option<&'a VirtNode> {
    if let Some((index, parent)) = self.path.last() {
      return parent
        .get_children()
        .and_then(|children| children.get(*index));
    }
    return None;
  }
}

pub fn selector_text_matches_element<'a, 'b>(
  selector_text: &'b str,
  element_path: &'a Vec<usize>,
  document: &'a VirtNode,
) -> bool {
  get_selector_text_matching_sub_selector(selector_text, element_path, document) != None
}

pub fn element_matches_selector_text_edge<'a, 'b>(
  selector_text: &'a str,
  element: &'b VirtElement,
) -> bool {
  let selector = parse_css_selector(selector_text, None).unwrap();
  let context = Context::new();

  element_matches_selector_edge(&selector, element, &context)
}

fn element_matches_selector_edge<'a, 'b>(
  selector: &css_ast::Selector,
  element: &'b VirtElement,
  context: &Context,
) -> bool {
  match selector {
    css_ast::Selector::Combo(_)
    | css_ast::Selector::Class(_)
    | css_ast::Selector::Attribute(_)
    | css_ast::Selector::Element(_)
    | css_ast::Selector::AllSelector(_)
    | css_ast::Selector::Id(_) => get_matching_sub_selector(selector, element, context) != None,
    css_ast::Selector::Descendent(sel) => {
      element_matches_selector_edge(&sel.descendent, element, context)
    }
    css_ast::Selector::Child(sel) => element_matches_selector_edge(&sel.child, element, context),
    css_ast::Selector::Sibling(sel) => {
      element_matches_selector_edge(&sel.sibling_selector, element, context)
    }
    css_ast::Selector::Adjacent(sel) => {
      element_matches_selector_edge(&sel.next_sibling_selector, element, context)
    }
    css_ast::Selector::Group(sel) => sel
      .selectors
      .iter()
      .any(|child| element_matches_selector_edge(child, element, context)),
    css_ast::Selector::Not(sel) => !element_matches_selector_edge(&sel.selector, element, context),
    css_ast::Selector::Prefixed(_)
    | css_ast::Selector::Global(_)
    | css_ast::Selector::This(_)
    | css_ast::Selector::Within(_)
    | css_ast::Selector::SubElement(_) => false,
    css_ast::Selector::PseudoParamElement(_) | css_ast::Selector::PseudoElement(_) => true,
  }
}

pub fn get_selector_text_matching_sub_selector<'a, 'b>(
  selector_text: &'b str,
  element_path: &'a Vec<usize>,
  document: &'a VirtNode,
) -> Option<(css_ast::Selector, css_ast::Selector)> {
  let selector = parse_css_selector(selector_text, None).unwrap();

  Context::new_from_path(element_path, document)
    .and_then(|context| {
      context
        .target()
        .and_then(|node| match node {
          VirtNode::Element(el) => Some(el),
          _ => None,
        })
        .and_then(|element| get_matching_sub_selector(&selector, element, &context))
        .and_then(|sub_selector| Some(sub_selector.clone()))
    })
    .and_then(|sub_selector| Some((sub_selector, selector)))
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
  let selector = parse_css_selector(selector_text, None).unwrap();

  let mut matching_elements: Vec<&'a VirtElement> = Vec::new();

  traverse_tree(
    &selector,
    document,
    Context::new(),
    &mut |child, context| {
      if get_matching_sub_selector(&selector, child, context) != None {
        matching_elements.push(child);
      }
      true
    },
  );

  return matching_elements;
}

pub fn find_one_matching_element<'a, 'b>(
  selector_text: &'b str,
  document: &'a VirtNode,
) -> Option<&'a VirtElement> {
  let selector = parse_css_selector(selector_text, None).unwrap();
  let mut found: Option<&'a VirtElement> = None;
  traverse_tree(
    &selector,
    document,
    Context::new(),
    &mut |child, context| {
      if get_matching_sub_selector(&selector, child, context) != None {
        found = Some(child);
        false
      } else {
        true
      }
    },
  );

  return found;
}

fn traverse_tree<'a>(
  selector: &css_ast::Selector,
  node: &'a VirtNode,
  context: Context,
  each: &mut dyn FnMut(&'a VirtElement, &Context) -> bool,
) -> bool {
  if let VirtNode::Element(element) = node {
    if !each(element, &context) {
      return false;
    }
  }

  if let Some(children) = node.get_children() {
    for (i, child) in children.iter().enumerate() {
      if !traverse_tree(selector, child, context.child(i, node), each) {
        return false;
      }
    }
  }
  return true;
}

fn get_matching_sub_selector<'a, 'b, 'c>(
  selector: &'c css_ast::Selector,
  element: &'a VirtElement,
  context: &'a Context,
) -> Option<&'c css_ast::Selector> {
  match selector {
    // a, b, c
    css_ast::Selector::Group(sel) => {
      for selector in &sel.selectors {
        if let Some(sub_selector) = get_matching_sub_selector(&selector, element, context) {
          return Some(sub_selector);
        }
      }
    }

    // a[b]
    css_ast::Selector::Combo(sel) => {
      for selector in &sel.selectors {
        if get_matching_sub_selector(selector, element, context) == None {
          return None;
        }
      }
      return Some(&selector);
    }

    // :hover
    css_ast::Selector::PseudoElement(sel) => {
      if sel.name == "disabled" && element.get_attribute("disabled") == None {
        return None;
      }

      // TODO - need to have flag for states like this. For now, ignore
      // https://www.w3schools.com/css/css_pseudo_classes.asp
      if matches!(
        sel.name.as_str(),
        "hover" | "active" | "visited" | "link" | "focus"
      ) {
        return None;
      }

      return Some(&selector);
    }

    // :nth-child(2n)
    css_ast::Selector::PseudoParamElement(sel) => {
      // TODO - need to do simple parse logic
      return Some(&selector);
    }

    // a b c d -> [a [b [c d]]]
    // This is a bit tricky, but basically what's happening is that we're
    // starting from the right-most descendent -- that recursively looks up using corresponding
    // ancestor selectors along the way. Ancestor selectors are always _leaf_ selectors.
    css_ast::Selector::Descendent(sel) => {
      // _may_ be a descendent element
      if get_matching_sub_selector(&sel.descendent, element, context) == None {
        return None;
      }

      let mut ancestor_context_option = context.parent_context();

      // Loop through parents until there is a match
      while let Some(ancestor_context) = ancestor_context_option {
        if let Some(ancestor_target) = ancestor_context.target() {
          if let VirtNode::Element(ancestor_element) = ancestor_target {
            // this will *always* be a leaf selector
            if get_matching_sub_selector(&sel.ancestor, ancestor_element, &ancestor_context) != None
            {
              return Some(&selector);
            }
          }
        } else {
          break;
        }
        ancestor_context_option = ancestor_context.parent_context();
      }

      return None;
    }

    // :has
    css_ast::Selector::SubElement(sel) => {
      return context.target().and_then(|self_context| {
        if selector_matches_nested_element(&sel.selector, self_context, &context) {
          return Some(selector);
        }
        return None;
      });
    }

    // :global(a)
    css_ast::Selector::Global(_)
    | css_ast::Selector::Prefixed(_)
    | css_ast::Selector::This(_)
    | css_ast::Selector::Within(_) => {
      panic!("Unsupported selector for match.");
    }

    // :not(a)
    css_ast::Selector::Not(not) => {
      if get_matching_sub_selector(&not.selector, element, context) == None {
        return Some(&not.selector);
      }
      return None;
    }

    // a > b
    css_ast::Selector::Child(sel) => {
      if get_matching_sub_selector(&sel.child, element, context) == None {
        return None;
      }

      return context
        .parent_context()
        .and_then(|parent_context| {
          return parent_context.target().and_then(|parent_node| {
            if let VirtNode::Element(parent_element) = parent_node {
              get_matching_sub_selector(&sel.parent, &parent_element, &parent_context)
            } else {
              None
            }
          });
        })
        .and_then(|_| Some(selector));
    }
    // a + b
    css_ast::Selector::Adjacent(sel) => {
      if get_matching_sub_selector(&sel.next_sibling_selector, element, context) == None {
        return None;
      }

      return context
        .parent_element()
        .and_then(|parent| parent.get_children())
        .and_then(|children| {
          let index = context.index().unwrap();

          // <a />ff<b /> is totally valid - just find next adjascent element
          for i in (0..index).rev() {
            let sibling = children.get(i);
            if let Some(node) = sibling {
              if let VirtNode::Element(element) = node {
                if get_matching_sub_selector(
                  &sel.selector,
                  &element,
                  &context.parent_context().unwrap().child(i, node),
                ) != None
                {
                  return Some(sel.next_sibling_selector.as_ref());
                }

                return None;
              }
            }
          }

          None
        });
    }
    // a ~ b
    css_ast::Selector::Sibling(sel) => {
      if get_matching_sub_selector(&sel.sibling_selector, element, context) == None {
        return None;
      }

      return context
        .parent_element()
        .and_then(|parent| parent.get_children())
        .and_then(|children| {
          let index = context.index().unwrap();

          // <a />ff<b /> is totally valid - just find next adjascent element
          for i in (0..index).rev() {
            let sibling = children.get(i);
            if let Some(node) = sibling {
              if let VirtNode::Element(element) = node {
                if get_matching_sub_selector(
                  &sel.selector,
                  &element,
                  &context.parent_context().unwrap().child(i, node),
                ) != None
                {
                  return Some(sel.sibling_selector.as_ref());
                }
              }
            }
          }

          None
        });
    }
    // #id
    css_ast::Selector::Id(sel) => {
      return element
        .get_attribute("id")
        .and_then(|id_attr| {
          return id_attr;
        })
        .and_then(|id| if id == sel.id { Some(selector) } else { None });
    }
    // .class
    css_ast::Selector::Class(sel) => {
      lazy_static! {
        static ref ESCAPE_RE: Regex = Regex::new(r"\\").unwrap();
        static ref CACHE: Mutex<HashMap<String, Vec<String>>> = Mutex::new(HashMap::new());
      }

      return element
        .get_attribute("class")
        .and_then(|value_option| value_option)
        .and_then(|classes| {
          let mut class_name_cache = CACHE.lock().unwrap();

          let match_class_name = ESCAPE_RE.replace_all(&sel.class_name, "").to_string();

          let class_list = if let Some(class_list) = class_name_cache.get(&classes) {
            class_list
          } else {
            class_name_cache.insert(
              classes.to_string(),
              classes
                .split(" ")
                .map(|v| v.to_string())
                .collect::<Vec<String>>(),
            );
            class_name_cache.get(&classes).unwrap()
          };

          if class_list.contains(&match_class_name) {
            Some(selector)
          } else {
            None
          }
        });
    }
    // *
    css_ast::Selector::AllSelector(_) => {
      return Some(selector);
    }
    css_ast::Selector::Element(sel) => {
      if sel.tag_name == element.tag_name {
        return Some(&selector);
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
                if attr_value == &value
                  || attr_value == &format!("\"{}\"", value)
                  || attr_value == &format!("'{}'", value)
                {
                  return Some(selector);
                }
              }
              _ => {}
            }
            None
          });
      } else {
        if element.get_attribute(&sel.name) != None {
          return Some(&selector);
        }
      }
    }
  }

  None
}

#[cached(
  type = "SizedCache<String, bool>",
  create = "{ SizedCache::with_size(100) }",
  convert = r#"{ format!("{}{}", class, value) }"#
)]
fn class_contains(class: &str, value: &str) -> bool {
  false
}

fn selector_matches_nested_element<'a>(
  selector: &css_ast::Selector,
  parent: &'a VirtNode,
  context: &'a Context,
) -> bool {
  if let Some(children) = parent.get_children() {
    for (i, child) in children.iter().enumerate() {
      if let VirtNode::Element(child_element) = child {
        if get_matching_sub_selector(selector, child_element, &context.child(i, parent)) != None {
          return true;
        }
      }
    }
  }

  return false;
}

#[cfg(test)]
mod tests {
  use super::super::evaluator::{evaluate as evaluate_pc, EngineMode, __test__evaluate_pc_code};
  use super::*;

  // ID

  #[test]
  fn can_match_tag_name_selector() {
    let selector_source = "div";
    let pc_source = "<div /><span />";
    let (eval_info, _) = __test__evaluate_pc_code(pc_source);
    let info2 = &eval_info.unwrap();
    let elements = get_matching_elements(&selector_source, &info2.preview);
    assert_eq!(elements.len(), 1);
  }

  #[test]
  fn can_match_attr() {
    let selector_source = "[href]";
    let pc_source = "<a href='#' /> <a />";
    let (eval_info, _) = __test__evaluate_pc_code(pc_source);
    let info2 = &eval_info.unwrap();
    let elements = get_matching_elements(&selector_source, &info2.preview);
    assert_eq!(elements.len(), 1);
  }

  #[test]
  fn can_match_attr_with_value() {
    let selector_source = "[href=#]";
    let pc_source = "<a href='#' /><a href='##' />";
    let (eval_info, _) = __test__evaluate_pc_code(pc_source);
    let info2 = &eval_info.unwrap();
    let elements = get_matching_elements(&selector_source, &info2.preview);
    assert_eq!(elements.len(), 1);
  }

  #[test]
  fn can_match_id_selector() {
    let selector_source = "#a";
    let pc_source = "<div id='a' /><div id='b' />";
    let (eval_info, _) = __test__evaluate_pc_code(pc_source);
    let info2 = &eval_info.unwrap();
    let elements = get_matching_elements(&selector_source, &info2.preview);
    assert_eq!(elements.len(), 1);
  }

  #[test]
  fn can_match_adj_selector() {
    let selector_source = "a + b";
    let pc_source = "<a /><b />";
    let (eval_info, _) = __test__evaluate_pc_code(pc_source);
    let info2 = &eval_info.unwrap();
    let elements = get_matching_elements(&selector_source, &info2.preview);
    assert_eq!(elements.len(), 1);
  }

  #[test]
  fn can_match_nested_adj_selector() {
    let selector_source = "a + b";
    let pc_source = "<div><a /><b /></div>";
    let (eval_info, _) = __test__evaluate_pc_code(pc_source);
    let info2 = &eval_info.unwrap();
    let elements = get_matching_elements(&selector_source, &info2.preview);
    assert_eq!(elements.len(), 1);
  }

  #[test]
  fn can_match_sib_selector() {
    let selector_source = "a ~ b";
    let pc_source = "<div><a /><c /><b /></div>";
    let (eval_info, _) = __test__evaluate_pc_code(pc_source);
    let info2 = &eval_info.unwrap();
    let elements = get_matching_elements(&selector_source, &info2.preview);
    assert_eq!(elements.len(), 1);
  }

  // ANCESTORS

  #[test]
  fn can_match_ancestor_selector() {
    let selector_source = "[href=#]";
    let pc_source = "<a href='#' /><a href='##' />";
    let (eval_info, _) = __test__evaluate_pc_code(pc_source);
    let info2 = &eval_info.unwrap();
    let elements = get_matching_elements(&selector_source, &info2.preview);
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
      ("a[href='#']", "<a href='#' /><a href /><div />", 1),
      ("a:before", "<a href='#' />", 1),
      ("div:nth-child(2)", "<div /><div /><div /><div />", 4),
      (":disabled", "<button></button>", 0),
      (":disabled", "<button disabled></button>", 1),
      (":not(:disabled)", "<button></button>", 1),
      (
        "div:not(.a)",
        "<div class='a' /><div class='b c' /><div class='b a' />",
        1,
      ),
      ("a b c", "<a><b><c /></b></a>", 1),
      ("a c", "<a><b><c /></b><c /></a>", 2),
      ("a > c", "<a><b><c /></b><c /></a>", 1),
      (
        ".a, .b",
        "<div class='a' /><div class='b c' /><div class='b a' />",
        3,
      ),
      (
        "*",
        "<div class='a' /><div class='b c' /><div class='b a' />",
        3,
      ),
    ];

    for (selector, html, count) in cases.iter() {
      let (result, _) = __test__evaluate_pc_code(html);
      let eval_info = &result.unwrap();
      let elements = get_matching_elements(&selector, &eval_info.preview);
      assert_eq!(elements.len() as i32, *count);
    }
  }
}
