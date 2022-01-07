use super::vfs::VirtualFileSystem;
use crate::base::ast::Range;
use crate::base::parser::ParseError;
use crate::base::utils::get_document_id;
use crate::core::ast::find_expr_by_id;
use crate::core::id_generator::IDGenerator;
use crate::css::{ast as css_ast, parser as css_parser};
use crate::pc::{ast as pc_ast, parser as pc_parser};
use crc::crc32;
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
  pub range: Range,
  pub message: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct GraphError {
  uri: String,
  info: GraphErrorInfo,
}

#[derive(Debug, Clone)]
pub struct DependencyGraph {
  pub dependencies: BTreeMap<String, Dependency>,
}

pub enum DependencyObject<'a> {
  Dependency(&'a Dependency),
  Expression(pc_ast::Expression<'a>),
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

  pub fn get_expression_by_id<'a>(
    &'a self,
    source_id: &String,
  ) -> Option<(String, pc_ast::Expression<'a>)> {
    for (uri, dep) in self.dependencies.iter() {
      let option: Option<pc_ast::Expression<'a>> = dep.get_expression_by_id(source_id);

      if let Some(obj) = option {
        return Some((uri.to_string(), obj));
      }
    }

    None
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
  pub fn get_object_by_id<'a>(&'a self, id: &String) -> Option<(String, DependencyObject<'a>)> {
    for (uri, dependency) in &self.dependencies {
      if &dependency.get_id() == id {
        return Some((uri.to_string(), DependencyObject::Dependency(&dependency)));
      }
    }

    self
      .get_expression_by_id(id)
      .and_then(|(uri, object)| return Some((uri, DependencyObject::Expression(object))))
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
        .map(|(_, uri)| uri)
        .collect::<Vec<&String>>();

      for dep_uri in deps {
        if !all_deps.contains(dep_uri) {
          self.flatten_dependencies2(dep_uri, all_deps);

          // this needs to be added _after_ so that it gets higher priority
          all_deps.push(dep_uri.to_string());
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
                let range = match &origin_dep.content {
                  DependencyContent::Node(node) => pc_ast::get_import_by_src(&relative_uri, node)
                    .unwrap()
                    .open_tag_range
                    .clone(),
                  DependencyContent::StyleSheet(_) => {
                    // TODO once imports are working in CSS sheets
                    Range::nil()
                  }
                };

                let info = GraphErrorInfo::IncludeNotFound(IncludeNodeFoundError {
                  message: "import not found".to_string(),
                  uri: curr_uri.to_string(),
                  range,
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
      let dependency_option =
        Dependency::from_source(source, &curr_uri, vfs, get_document_id(&curr_uri).as_str())
          .or_else(|error| {
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

#[derive(Debug, Serialize, Clone)]
#[serde(tag = "contentKind")]
pub enum DependencyContent {
  Node(pc_ast::Node),
  StyleSheet(css_ast::Sheet),
}

#[derive(Debug, Serialize, Clone)]
pub struct Dependency {
  pub uri: String,

  #[serde(rename = "dependencies")]
  pub dependencies: BTreeMap<String, String>,

  #[serde(rename = "dependencyUriMaps")]
  pub dependency_uri_maps: BTreeMap<String, String>,
  pub content: DependencyContent,
}

impl<'a> Dependency {
  pub fn from_source<'b>(
    source: String,
    uri: &String,
    vfs: &VirtualFileSystem,
    id_seed: &'b str,
  ) -> Result<Dependency, ParseError> {
    if uri.ends_with(".css") {
      Dependency::from_css_source(source, uri, id_seed)
    } else {
      Dependency::from_pc_source(source, uri, vfs, id_seed)
    }
  }

  pub fn get_expression_by_id(&'a self, source_id: &String) -> Option<pc_ast::Expression<'a>> {
    match &self.content {
      DependencyContent::StyleSheet(sheet) => find_expr_by_id(source_id.clone(), sheet),
      DependencyContent::Node(node) => find_expr_by_id(source_id.clone(), node),
    }
  }

  pub fn get_id(&self) -> String {
    get_document_id(&self.uri).to_string()
  }

  fn from_css_source<'b>(
    source: String,
    uri: &String,
    id_seed: &'b str,
  ) -> Result<Dependency, ParseError> {
    let expression_result = css_parser::parse(&source, id_seed.to_string());
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

  fn from_pc_source<'b>(
    source: String,
    uri: &String,
    vfs: &VirtualFileSystem,
    id_seed: &'b str,
  ) -> Result<Dependency, ParseError> {
    let expression_result = pc_parser::parse(source.as_str(), uri.as_str(), id_seed);

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
          Range::nil(),
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
