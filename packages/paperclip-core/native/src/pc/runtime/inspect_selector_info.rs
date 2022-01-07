use crate::core::graph::{DependencyGraph, DependencyObject};
use crate::css::ast as css_ast;
use regex::Regex;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SelectorScopeInfo {
  pub id: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum SelectorScope {
  Element(SelectorScopeInfo),
  Document(SelectorScopeInfo),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum Selector {
  List(GroupSelector),

  // a
  Element(TargetSelector),

  // *
  All(TargetSelector),

  // a:before
  PseudoElement(TargetSelector),

  // a:nth-child(2n)
  PseudoParamElement(TargetSelector),

  // [a]
  Attribute(TargetSelector),

  Not(WrapperSelector),

  // #a
  Id(TargetSelector),

  // .a
  Class(ClassSelector),

  // a[b]
  Combo(GroupSelector),

  // a > b
  Child(BinarySelector),

  // a b
  Descendent(BinarySelector),

  // a + b
  Adjacent(BinarySelector),

  // a ~ b
  Sibling(BinarySelector),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct GroupSelector {
  pub selectors: Vec<Selector>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct BinarySelector {
  pub left: Box<Selector>,
  pub right: Box<Selector>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct WrapperSelector {
  pub selector: Box<Selector>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct TargetSelector {
  pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ClassSelector {
  pub name: Option<String>,
  pub value: String,
  pub scope: Option<SelectorScope>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Error {
  message: String,
}

impl Selector {
  pub fn from_ast(
    selector: &css_ast::Selector,
    graph: &DependencyGraph,
  ) -> Result<Selector, Error> {
    get_selector_info(selector, graph)
  }
}

fn get_selector_info(ast: &css_ast::Selector, graph: &DependencyGraph) -> Result<Selector, Error> {
  match ast {
    css_ast::Selector::Adjacent(ast) => Ok(Selector::Adjacent(BinarySelector {
      left: Box::new(get_selector_info(&ast.selector, graph)?),
      right: Box::new(get_selector_info(&ast.next_sibling_selector, graph)?),
    })),
    css_ast::Selector::Sibling(ast) => Ok(Selector::Sibling(BinarySelector {
      left: Box::new(get_selector_info(&ast.selector, graph)?),
      right: Box::new(get_selector_info(&ast.sibling_selector, graph)?),
    })),
    css_ast::Selector::Descendent(ast) => Ok(Selector::Descendent(BinarySelector {
      left: Box::new(get_selector_info(&ast.ancestor, graph)?),
      right: Box::new(get_selector_info(&ast.descendent, graph)?),
    })),
    css_ast::Selector::Child(ast) => Ok(Selector::Child(BinarySelector {
      left: Box::new(get_selector_info(&ast.parent, graph)?),
      right: Box::new(get_selector_info(&ast.child, graph)?),
    })),
    css_ast::Selector::Combo(ast) => {
      let mut selectors: Vec<Selector> = vec![];

      for child in &ast.selectors {
        selectors.push(get_selector_info(child, graph)?);
      }

      Ok(Selector::Combo(GroupSelector { selectors }))
    }
    css_ast::Selector::Group(ast) => {
      let mut selectors: Vec<Selector> = vec![];
      for child in &ast.selectors {
        selectors.push(get_selector_info(child, graph)?);
      }

      Ok(Selector::List(GroupSelector { selectors }))
    }
    css_ast::Selector::PseudoElement(ast) => Ok(Selector::PseudoElement(TargetSelector {
      value: ast.to_string(),
    })),
    css_ast::Selector::PseudoParamElement(ast) => {
      Ok(Selector::PseudoParamElement(TargetSelector {
        value: ast.to_string(),
      }))
    }
    css_ast::Selector::Element(ast) => Ok(Selector::Element(TargetSelector {
      value: ast.to_string(),
    })),
    css_ast::Selector::Class(ast) => {
      let scope_parts = split_class_scope_parts(&ast.class_name);
      let scope_id = scope_parts.first().unwrap_or(&ast.class_name);
      let scope = graph.get_object_by_id(&scope_id).and_then(|(uri, obj)| {
        Some(match obj {
          DependencyObject::Dependency(dep) => SelectorScope::Document(SelectorScopeInfo {
            id: scope_id.to_string(),
          }),
          DependencyObject::Expression(dep) => SelectorScope::Element(SelectorScopeInfo {
            id: scope_id.to_string(),
          }),
        })
      });

      let cleaned_value = if let Some(class_name) = scope_parts.last() {
        if class_name != scope_id {
          Some(class_name.to_string())
        } else {
          None
        }
      } else {
        Some(ast.class_name.to_string())
      };

      return Ok(Selector::Class(ClassSelector {
        name: cleaned_value,
        value: ast.to_string(),
        scope,
      }));
    }
    css_ast::Selector::Attribute(ast) => Ok(Selector::Attribute(TargetSelector {
      value: ast.to_string(),
    })),
    css_ast::Selector::AllSelector(ast) => Ok(Selector::PseudoElement(TargetSelector {
      value: ast.to_string(),
    })),
    css_ast::Selector::Id(ast) => Ok(Selector::Id(TargetSelector {
      value: ast.to_string(),
    })),
    css_ast::Selector::Not(ast) => Ok(Selector::Not(WrapperSelector {
      selector: Box::new(get_selector_info(&ast.selector, graph)?),
    })),
    css_ast::Selector::Prefixed(_)
    | css_ast::Selector::This(_)
    | css_ast::Selector::SubElement(_)
    | css_ast::Selector::Within(_)
    | css_ast::Selector::Global(_) => {
      return Err(Error {
        message: "invalid".to_string(),
      })
    }
  }
}

fn split_class_scope_parts(class_selector_text: &String) -> Vec<String> {
  lazy_static! {
    static ref scope_name_re: Regex = Regex::new(r"_(pub-)?([^_]+)(_(.+))?\b").unwrap();
  }

  let mut scope_name_parts: Vec<String> = vec![];

  if scope_name_re.is_match(class_selector_text) {
    for caps in scope_name_re.captures_iter(class_selector_text) {
      let scope_id = caps.get(2).unwrap().as_str();
      scope_name_parts.push(scope_id.to_string());

      if let Some(target_name) = caps.get(4) {
        scope_name_parts.push(target_name.as_str().to_string())
      }
    }
  }

  scope_name_parts
}
