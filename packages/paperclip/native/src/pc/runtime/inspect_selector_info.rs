
use serde::Serialize;
use regex::Regex;
use crate::css::ast as css_ast;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SelectorScopeInfo {
  id: String
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum SelectorScope {
  Element(SelectorScopeInfo),
  Document(SelectorScopeInfo)
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum Selector {
  List(GroupSelector),

  // a
  Element(TargetSelector),

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
  Class(TargetSelector),

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
  pub selectors: Vec<Selector>
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct BinarySelector {
  pub left: Box<Selector>,
  pub right: Box<Selector>
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct WrapperSelector {
  pub selector: Box<Selector>
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct TargetSelector {
  pub value: String,
  // pub raw_value: String,
  // pub scope: SelectorScope
}


#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Error {
  message: String
}

impl Selector {
  pub fn from_ast(selector: &css_ast::Selector) -> Result<Selector, Error> {
    get_selector_info(selector)
  }
}

fn get_selector_info(ast: &css_ast::Selector) -> Result<Selector, Error>  {
  match ast {
    css_ast::Selector::Adjacent(ast) => {
      Ok(Selector::Adjacent(BinarySelector {
        left: Box::new(get_selector_info(&ast.selector)?),
        right: Box::new(get_selector_info(&ast.next_sibling_selector)?)
      }))
    },
    css_ast::Selector::Sibling(ast) => {
      Ok(Selector::Adjacent(BinarySelector {
        left: Box::new(get_selector_info(&ast.selector)?),
        right: Box::new(get_selector_info(&ast.sibling_selector)?)
      }))
    },
    css_ast::Selector::Descendent(ast) => {
      Ok(Selector::Descendent(BinarySelector {
        left: Box::new(get_selector_info(&ast.ancestor)?),
        right: Box::new(get_selector_info(&ast.descendent)?)
      }))
    },
    css_ast::Selector::Child(ast) => {
      Ok(Selector::Descendent(BinarySelector {
        left: Box::new(get_selector_info(&ast.parent)?),
        right: Box::new(get_selector_info(&ast.child)?)
      }))
    },
    css_ast::Selector::Combo(ast) => {
      let mut selectors: Vec<Selector> = vec![];

      // step by 2 because we're stripping out extra specificity (which is scope). 
      for i in (0..ast.selectors.len()).step_by(2) {
        let scope_selector = ast.selectors.get(i).unwrap();
        let target_selector = ast.selectors.get(i + 1).unwrap();

        let scope: Option<(String, Option<String>)> = if scope_selector.to_string() == "[class]" {
          extract_scope(&target_selector.to_string())
        } else {
          extract_scope(&scope_selector.to_string())
        };

        println!("{:?}", scope);

        selectors.push(get_selector_info(target_selector)?);
      }

      Ok(Selector::Combo(GroupSelector {
        selectors
      }))
    },
    css_ast::Selector::Group(ast) => {
      let mut selectors: Vec<Selector> = vec![];
      for child in &ast.selectors {
        selectors.push(get_selector_info(child)?);
      }

      Ok(Selector::List(GroupSelector {
        selectors
      }))
    },
    css_ast::Selector::PseudoElement(ast) => {
      Ok(Selector::PseudoElement(TargetSelector {
        value: ast.to_string(),
      }))
    },
    css_ast::Selector::PseudoParamElement(ast) => {
      Ok(Selector::PseudoElement(TargetSelector {
        value: ast.to_string(),
      }))
    },
    css_ast::Selector::Element(ast) => {
      Ok(Selector::PseudoElement(TargetSelector {
        value: ast.to_string(),
      }))
    },
    css_ast::Selector::Class(ast) => {
      Ok(Selector::PseudoElement(TargetSelector {
        value: ast.to_string(),
      }))
    },
    css_ast::Selector::Attribute(ast) => {
      Ok(Selector::PseudoElement(TargetSelector {
        value: ast.to_string(),
      }))
    },
    css_ast::Selector::AllSelector(ast) => {
      Ok(Selector::PseudoElement(TargetSelector {
        value: ast.to_string(),
      }))
    },
    css_ast::Selector::Id(ast) => {
      Ok(Selector::PseudoElement(TargetSelector {
        value: ast.to_string(),
      }))
    },
    css_ast::Selector::Not(ast) => {
      Ok(Selector::Not(WrapperSelector {
        selector: Box::new(get_selector_info(&ast.selector)?)
      }))
    },
    css_ast::Selector::Prefixed(_) | css_ast::Selector::This(_) | css_ast::Selector::SubElement(_) | css_ast::Selector::Within(_) | css_ast::Selector::Global(_) => {
      return Err(Error { message: "invalid".to_string() })
    }
  }
}

fn extract_scope(target_selector_text: &String) -> Option<(String, Option<String>)> {
  lazy_static! {
    static ref scope_name_re: Regex = Regex::new(r"_(pub-)?(\w+)(_.+)?\b").unwrap();
  }

  println!("{}", target_selector_text);

  if scope_name_re.is_match(target_selector_text) {
    println!("MATCH");
    for caps in scope_name_re.captures_iter(target_selector_text) {
      let scope_id = caps.get(1).unwrap().as_str();
      let target_name_option = caps.get(2);


      println!("{:?} {:?}", scope_id, target_name_option);
    }
  }

  None
}