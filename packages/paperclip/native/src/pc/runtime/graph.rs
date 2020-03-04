use super::vfs::{VirtualFileSystem};
use crate::pc::{ast as pc_ast, parser as pc_parser};
use crate::css::{ast as css_ast, parser as css_parser};
use crate::base::parser::{ParseError};
use crate::base::ast::{Location};
use std::collections::{HashMap};
use serde::{Serialize};


#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum GraphErrorInfo {

  // <import />, <img />, <logic />
  IncludeNotFound(IncludeNodeFoundError),

  Syntax(ParseError),

  NotFound
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct IncludeNodeFoundError {
  pub uri: String,
  pub location: Location,
  pub message: String
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct GraphError {
  uri: String,
  info: GraphErrorInfo
}

pub struct DependencyGraph {
  pub dependencies: HashMap<String, Dependency>,
}

#[allow(dead_code)]
impl DependencyGraph {
  pub fn new() -> DependencyGraph {
    DependencyGraph { 
      dependencies: HashMap::new() 
    }
  }
  pub fn flatten<'a>(&'a self, entry_uri: &String) -> Vec<(&Dependency, Option<&Dependency>)> {
    let mut deps: Vec<(&Dependency, Option<&Dependency>)> = vec![];
    if !self.dependencies.contains_key(entry_uri) {
      return deps;
    }

    let entry = self.dependencies.get(entry_uri).unwrap();
    deps.push((entry, None));
    
    let mut dependents = vec![entry];

    while dependents.len() > 0 {
      let dependent = dependents.pop().unwrap();
      for (_, dep_uri) in &dependent.dependencies {
        let dep = self.dependencies.get(dep_uri).unwrap();
        deps.push((dep, Some(dependent)));
        dependents.push(dep);
      }
    }
    return deps;
  }

  pub fn flatten_dependents<'a>(&'a self, entry_uri: &String) -> Vec<&Dependency> {
    let mut deps = vec![];
    let entry_option = self.dependencies.get(entry_uri);

    if let None = entry_option {
      return deps;
    }

    for (dep_uri, dep) in &self.dependencies {
      if dep.dependencies.values().any(|uri| { &uri == &entry_uri }) {
        deps.push(dep);
        deps.extend(self.flatten_dependents(dep_uri));
      }
    }
    
    return deps;
  }

  pub async fn load_dependency<'a>(&mut self, uri: &String, vfs: &mut VirtualFileSystem) -> Result<Vec<String>, GraphError> {

    let mut loaded_deps = vec![];
    loaded_deps.push(uri.to_string());

    let mut to_load: Vec<(String, Option<(String, String)>)> = vec![(uri.to_string(), None)];
    
    while to_load.len() > 0 {
      let (curr_uri, import) = to_load.pop().unwrap();
      let source = vfs.load(&curr_uri).await
      .or_else(|_| {
        let err: GraphError = match import {
          Some((origin_uri, relative_uri)) => {
            let origin_dep = self.dependencies.get(&origin_uri).unwrap();

            let location = match &origin_dep.content {
              DependencyContent::Node(node) => {
                pc_ast::get_import_by_src(&relative_uri, node).unwrap().open_tag_location.clone()
              }
              DependencyContent::StyleSheet(_) => {
                // TODO once imports are working in CSS sheets
                Location { start: 0, end: 0 }
              }
            };

            let info = GraphErrorInfo::IncludeNotFound(IncludeNodeFoundError {
              message: "import not found".to_string(),
              uri: curr_uri.to_string(),
              location,
            });

            GraphError {
              uri: origin_uri.to_string(),
              info,
            }
          },
          None => {
            GraphError { 
              uri: curr_uri.to_string(),
              info: GraphErrorInfo::NotFound
            }
          }
        };

        Err(err)
      })?.to_string();

      // TODO - check if content matches old content.
      let dependency = Dependency::from_source(source, &curr_uri, vfs).or_else(|error| {
        Err(GraphError {
          uri: curr_uri.to_string(),
          info: GraphErrorInfo::Syntax(error)
        })
      })?;

      loaded_deps.push(curr_uri.to_string());

      for (relative_uri, dep_uri) in &dependency.dependency_uri_maps {
        if !self.dependencies.contains_key(&dep_uri.to_string()) {
          to_load.push((
            dep_uri.to_string(),
            Some((curr_uri.to_string(), relative_uri.to_string()))
          ));
        }
      }

      self.dependencies.insert(curr_uri.to_string(), dependency);

    }

    Ok(loaded_deps)
  }

}

#[derive(Debug)]
pub enum DependencyContent {
  Node(pc_ast::Node),
  StyleSheet(css_ast::Sheet)
}

#[derive(Debug)]
pub struct Dependency {
  pub uri: String,
  pub dependencies: HashMap<String, String>,
  pub dependency_uri_maps: HashMap<String, String>,
  pub content: DependencyContent
}

impl<'a> Dependency {
  pub fn from_source(source: String, uri: &String, vfs: &VirtualFileSystem) -> Result<Dependency, ParseError> {
    if uri.ends_with(".css") {
      Dependency::from_css_source(source, uri)
    } else {
      Dependency::from_pc_source(source, uri, vfs)
    }
  }

  fn from_css_source(source: String, uri: &String) -> Result<Dependency, ParseError> {
    let expression_result = css_parser::parse(source.as_str());
    if let Err(err) = expression_result {
      return Err(err);
    }
    let expression = expression_result.unwrap();

    Ok(Dependency {
      uri: uri.to_string(),
      content: DependencyContent::StyleSheet(expression),
      dependencies: HashMap::new(),
      dependency_uri_maps: HashMap::new()
    })
  }

  fn from_pc_source(source: String, uri: &String, vfs: &VirtualFileSystem) -> Result<Dependency, ParseError> {

    let expression_result = pc_parser::parse(source.as_str());

    if let Err(err) = expression_result {
      return Err(err);
    }

    let expression = expression_result.unwrap();
    
    let imports = pc_ast::get_imports(&expression);

    let mut dependencies = HashMap::new();
    let mut dependency_uri_maps = HashMap::new();
    for import in &imports {
      let src = pc_ast::get_attribute_value("src", import).unwrap();
      dependencies.insert(
        pc_ast::get_import_identifier(import).unwrap().as_str().to_string(),
        vfs.resolve(uri, &src)
      );

      dependency_uri_maps.insert(
        src.to_string(),
        vfs.resolve(uri, &src)
      );
    }

    Ok(Dependency {
      uri: uri.to_string(),
      content: DependencyContent::Node(expression),
      dependencies,
      dependency_uri_maps
    })
  }
}