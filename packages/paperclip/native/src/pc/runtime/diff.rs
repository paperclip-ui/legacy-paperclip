use super::virt::{Node, Fragment, Element, Text, StyleElement, Attribute};
use super::mutation::{Mutation, ReplaceNode, SourceUriChanged, Action, SourceChanged, DeleteChild, SetText, InsertChild, RemoveAttribute, SetAttribute};
use std::cmp::{min, max};

/*
NOTE: diffing is pretty dumb now. May
want to make it smarter later on.

TODOS:

- [ ] need to diff & patch expression info
*/

struct Context<'a> {
  node_path: Vec<usize>,
  mutations: &'a mut Vec<Mutation>
}

pub fn diff(a: &Node, b: &Node)-> Vec<Mutation> {
  let mut mutations: Vec<Mutation> = vec![];
  
  let mut context = Context {
    mutations: &mut mutations,
    node_path: vec![]
  };
  diff_node(a, b, &mut context);
  mutations
}

fn diff_node<'a>(a: &Node, b: &Node, context: &mut Context<'a>) {
  if let Node::Element(element1) = a {
    if let Node::Element(element2) = b {
      return diff_element(element1, element2, context);
    }
  } else if let Node::Fragment(fragment1) = a {
    if let Node::Fragment(fragment2) = b {
      return diff_fragment(fragment1, fragment2, context);
    }
  } else if let Node::Text(text1) = a {
    if let Node::Text(text2) = b {
      return diff_text(text1, text2, context);
    }
  } else if let Node::StyleElement(style_element1) = a {
    if let Node::StyleElement(style_element2) = b {
      return diff_style_element(style_element1, style_element2, context);
    }
  }

  context.mutations.push(Mutation::new(context.node_path.clone(), Action::ReplaceNode(
    ReplaceNode {
      replacement: b.clone()
    }
  )));
}

fn diff_element<'a>(a: &Element, b: &Element, context: &mut Context<'a>) {
  if a.tag_name != b.tag_name {
    context.mutations.push(Mutation::new(context.node_path.clone(), Action::ReplaceNode(
      ReplaceNode {
        replacement: Node::Element(b.clone())
      }
    )));
    return;
  }

  if a.source_location != b.source_location {
    context.mutations.push(Mutation::new(
      context.node_path.clone(),
      Action::SourceChanged(SourceChanged {
        property_name: "source_location".to_string(),
        new_location: b.source_location.clone()
      })
    ));
  }


  if a.source_uri != b.source_uri {
    context.mutations.push(Mutation::new(
      context.node_path.clone(),
      Action::SourceUriChanged(SourceUriChanged {
        new_uri: b.source_uri.clone()
      })
    ));
  }
  
  for attribute1 in a.attributes.iter() {
    let attribute2_option = b.attributes.iter().find(|attribute2| {
      attribute2.name == attribute1.name
    });

    match attribute2_option {
      Some(attribute2) => {
        if attribute1.value != attribute2.value {
          context.mutations.push(Mutation::new(context.node_path.clone(), Action::SetAttribute(SetAttribute { 
            name: attribute1.name.clone(),
            value: attribute2.value.clone(),
          })));
        }
      },
      None => {
        context.mutations.push(Mutation::new(context.node_path.clone(), Action::RemoveAttribute(RemoveAttribute { 
          name: attribute1.name.clone() 
        })));
      }
    }
  }
  for attribute2 in b.attributes.iter() {
    let attribute1_option = a.attributes.iter().find(|attribute1| {
      attribute1.name == attribute2.name
    });

    match attribute1_option {
      None => {
        context.mutations.push(Mutation::new(context.node_path.clone(), Action::SetAttribute(SetAttribute { 
          name: attribute2.name.clone(),
          value: attribute2.value.clone() 
        })));
      },
      _ => {}
    }
  }

  diff_children(&a.children, &b.children, context);
}
fn diff_fragment<'a>(a: &Fragment, b: &Fragment, context: &mut Context<'a>) {
  diff_children(&a.children, &b.children, context);
}

fn diff_text<'a>(a: &Text, b: &Text, context: &mut Context<'a>) {
  if a.value != b.value {
    context.mutations.push(Mutation::new(context.node_path.clone(), Action::SetText(SetText { 
      value: b.value.clone() 
    })));
  }
}
fn diff_children<'a>(a: &Vec<Node>, b: &Vec<Node>, context: &mut Context<'a>) {
  for i in 0..min(a.len(), b.len()) {
    let mut node_path = context.node_path.clone();
    node_path.push(i);
    diff_node(&a[i], &b[i], &mut Context {
      node_path,
      mutations: context.mutations
    });
  }
  if a.len() > b.len() {
    for i in b.len()..a.len() {
      context.mutations.push(Mutation::new(context.node_path.clone(), Action::DeleteChild(
        DeleteChild {
          index: b.len()
        }
      )))
    }
  } else if b.len() > a.len() {
    for i in a.len()..b.len() {
      context.mutations.push(Mutation::new(context.node_path.clone(), Action::InsertChild(
        InsertChild {
          index: i,
          child: b[i].clone()
        }
      )))
    }
  }
}
fn diff_style_element<'a>(a: &StyleElement, b: &StyleElement, context: &mut Context<'a>) {

  // will want to diff & patch styles later on
  context.mutations.push(Mutation::new(context.node_path.clone(), Action::ReplaceNode(
    ReplaceNode {
      replacement: Node::StyleElement(b.clone())
    }
  )));
}