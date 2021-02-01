use super::vfs::VirtualFileSystem;
use crate::base::ast::Location;
use crate::base::parser::ParseError;
use crate::css::{ast as css_ast, parser as css_parser};
use crate::pc::{ast as pc_ast, parser as pc_parser};
use serde::Serialize;
use std::collections::{BTreeMap, HashSet};

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum GraphErrorInfo {
  // <import  />, <img />, <logic />
  IncludeNotFound(IncludeNodeFoundError),

  Syntax(ParseError),

  NotFound,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct IncludeNodeFoundError {
  pub uri: String,
  pub location: Location,
  pub message: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct GraphError {
  uri: String,
  info: GraphErrorInfo,
}

pub struct DependencyGraph {
  pub dependencies: BTreeMap<String, Dependency>,
}

#[allow(dead_code)]
impl DependencyGraph {
  pub fn new() -> DependencyGraph {
    DependencyGraph {
      dependencies: BTreeMap::new(),
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
        if let Some(dep) = self.dependencies.get(dep_uri) {
          deps.push((dep, Some(dependent)));
          dependents.push(dep);
        }
      }
    }
    return deps;
  }

  pub fn flatten_dependents<'a>(&'a self, entry_uri: &String) -> Vec<String> {
    let mut all_deps: HashSet<String> = HashSet::new();
    self.flatten_dependents2(entry_uri, &mut all_deps);
    return all_deps
      .into_iter()
      .map(|v| v.to_string())
      .collect::<Vec<String>>();
  }

  fn flatten_dependents2<'a>(&'a self, entry_uri: &String, all_deps: &mut HashSet<String>) {
    let entry_option = self.dependencies.get(entry_uri);

    if let None = entry_option {
      return;
    }

    for (dep_uri, dep) in &self.dependencies {
      if dep.dependencies.values().any(|uri| &uri == &entry_uri) && !all_deps.contains(dep_uri) {
        all_deps.insert(dep_uri.to_string());
        self.flatten_dependents2(dep_uri, all_deps);
      } else if all_deps.contains(dep_uri) {
      }
    }

    return;
  }
  pub fn flatten_dependencies<'a>(&'a self, entry_uri: &String) -> Vec<String> {
    let mut all_deps: Vec<String> = vec![];
    self.flatten_dependencies2(entry_uri, &mut all_deps);
    return all_deps;
  }

  fn flatten_dependencies2<'a>(&'a self, entry_uri: &String, all_deps: &mut Vec<String>) {
    let entry_option = self.dependencies.get(entry_uri);

    if let Some(dep) = entry_option {
      let deps = dep
        .dependencies
        .iter()
        .map(|(id, uri)| uri)
        .collect::<Vec<&String>>();

      for dep_uri in deps {
        if !all_deps.contains(dep_uri) {
          all_deps.push(dep_uri.to_string());
          self.flatten_dependencies2(dep_uri, all_deps);
        } else {
        }
      }
    }
  }

  pub async fn load_dependency<'a>(
    &mut self,
    uri: &String,
    vfs: &mut VirtualFileSystem,
  ) -> Result<Vec<String>, GraphError> {
    let mut loaded_deps = vec![];
    loaded_deps.push(uri.to_string());

    let mut to_load: Vec<(String, Option<(String, String)>)> = vec![(uri.to_string(), None)];

    while to_load.len() > 0 {
      let (curr_uri, import) = to_load.pop().unwrap();
      let source = vfs
        .load(&curr_uri)
        .await
        .or_else(|_| {
          let err: GraphError = match import {
            Some((origin_uri, relative_uri)) => {
              if let Some(origin_dep) = self.dependencies.get(&origin_uri) {
                let location = match &origin_dep.content {
                  DependencyContent::Node(node) => pc_ast::get_import_by_src(&relative_uri, node)
                    .unwrap()
                    .open_tag_location
                    .clone(),
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
              } else {
                GraphError {
                  uri: curr_uri.to_string(),
                  info: GraphErrorInfo::NotFound,
                }
              }
            }
            None => GraphError {
              uri: curr_uri.to_string(),
              info: GraphErrorInfo::NotFound,
            },
          };

          Err(err)
        })?
        .to_string();

      // TODO - check if content matches old content.
      let dependency_option = Dependency::from_source(source, &curr_uri, vfs).or_else(|error| {
        Err(GraphError {
          uri: curr_uri.to_string(),
          info: GraphErrorInfo::Syntax(error),
        })
      });

      match dependency_option {
        Ok(dependency) => {
          loaded_deps.push(curr_uri.to_string());

          self.dependencies.insert(curr_uri.to_string(), dependency);

          // need to insert now for
          let dep = &self.dependencies.get(&curr_uri).unwrap();

          for (relative_uri, dep_uri) in &dep.dependency_uri_maps {
            if !self.dependencies.contains_key(&dep_uri.to_string()) {
              to_load.push((
                dep_uri.to_string(),
                Some((curr_uri.to_string(), relative_uri.to_string())),
              ));
            }
          }
        }
        Err(err) => {
          self.dependencies.remove(&curr_uri);
          return Err(err);
        }
      }
    }

    Ok(loaded_deps)
  }
}

#[derive(Debug, Serialize)]
#[serde(tag = "contentKind")]
pub enum DependencyContent {
  Node(pc_ast::Node),
  StyleSheet(css_ast::Sheet),
}

#[derive(Debug)]
pub struct Dependency {
  pub uri: String,
  pub dependencies: BTreeMap<String, String>,
  pub dependency_uri_maps: BTreeMap<String, String>,
  pub content: DependencyContent,
}

impl<'a> Dependency {
  pub fn from_source(
    source: String,
    uri: &String,
    vfs: &VirtualFileSystem,
  ) -> Result<Dependency, ParseError> {
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
      dependencies: BTreeMap::new(),
      dependency_uri_maps: BTreeMap::new(),
    })
  }

  fn from_pc_source(
    source: String,
    uri: &String,
    vfs: &VirtualFileSystem,
  ) -> Result<Dependency, ParseError> {
    let expression_result = pc_parser::parse(source.as_str());

    if let Err(err) = expression_result {
      return Err(err);
    }

    let expression = expression_result.unwrap();

    let imports = pc_ast::get_imports(&expression);

    let mut dependencies = BTreeMap::new();
    let mut dependency_uri_maps = BTreeMap::new();
    for import in &imports {
      let src = pc_ast::get_attribute_value("src", import).unwrap();

      let resolved_src_option = vfs.resolve(uri, &src);

      if let Some(resolved_src) = resolved_src_option {
        dependencies.insert(
          pc_ast::get_import_identifier(import)
            .unwrap()
            .as_str()
            .to_string(),
          resolved_src.to_string(),
        );

        dependency_uri_maps.insert(src.to_string(), resolved_src.to_string());
      } else {
        return Err(ParseError::unexpected(
          format!("Unable to resolve path: {} from {}", src, uri),
          0,
          0,
        ));
      }
    }

    Ok(Dependency {
      uri: uri.to_string(),
      content: DependencyContent::Node(expression),
      dependencies,
      dependency_uri_maps,
    })
  }
}
