use crate::base::ast;
use crate::base::parser::ParseError;
use crate::base::runtime::RuntimeError;
use crate::base::utils::get_document_style_scope;
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph, GraphError};
use crate::core::vfs::{FileExistsFn, FileReaderFn, FileResolverFn, VirtualFileSystem};
use crate::css::parser::parse as parse_css;
use crate::css::runtime::evaluator::evaluate as evaluate_css;
use crate::css::runtime::evaluator::EvalInfo as CSSEvalInfo;
use crate::css::runtime::virt as css_virt;
use crate::js::runtime::virt as js_virt;
use crate::pc::ast as pc_ast;
use crate::pc::parser::parse as parse_pc;
use crate::pc::runtime;
use crate::pc::runtime::cache as pc_cache;
use crate::pc::runtime::diff::diff as diff_pc;
use crate::pc::runtime::evaluator::EvalInfo as PCEvalInfo;
use crate::pc::runtime::evaluator::{evaluate as evaluate_pc, evaluate_document_styles};
use crate::pc::runtime::mutation as pc_mutation;
use crate::pc::runtime::virt as pc_virt;
use ::futures::executor::block_on;
use serde::Serialize;
use std::collections::{HashMap, HashSet};

#[derive(Debug, PartialEq, Serialize)]
pub struct EvaluatedEvent<'a> {
  pub uri: String,
  #[serde(rename = "allDependencies")]
  pub all_dependencies: Vec<String>,
  pub dependents: Vec<String>,
  pub info: Option<&'a runtime::evaluator::EvalInfo>,
}

#[derive(Debug, PartialEq, Serialize)]
pub struct DiffedEvent {
  pub uri: String,

  // TODO - needs to be sheetMutations
  pub sheet: Option<css_virt::CSSSheet>,
  #[serde(rename = "allDependencies")]
  pub all_dependencies: Vec<String>,
  pub dependents: Vec<String>,

  // TODO - needs to be domMutations
  pub mutations: Vec<pc_mutation::Mutation>,
}

#[derive(Debug, PartialEq, Serialize)]
pub struct NodeParsedEvent {
  pub uri: String,
  pub node: pc_ast::Node,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "errorKind")]
pub enum EngineError {
  Graph(GraphError),
  Parser(ParseError),
  Runtime(RuntimeError),
}

#[derive(Debug, PartialEq, Serialize)]
#[serde(tag = "kind")]
pub enum EngineEvent<'a> {
  Evaluated(EvaluatedEvent<'a>),
  Diffed(DiffedEvent),
  NodeParsed(NodeParsedEvent),
  Error(EngineError),
}

pub struct EvalOptions {
  part: Option<String>,
}

async fn evaluate_content_styles(
  content: &String,
  uri: &String,
  vfs: &VirtualFileSystem,
  graph: &DependencyGraph,
) -> Result<css_virt::CSSSheet, EngineError> {
  parse_pc(content)
    .map_err(|err| EngineError::Parser(err))
    .and_then(|node_ast| {
      let (sheet, _) = evaluate_document_styles(&node_ast, uri, vfs, graph, false)
        .map_err(|err| EngineError::Runtime(err))?;
      Ok(sheet)
    })
}

type EngineEventListener = dyn Fn(&EngineEvent);

pub struct Engine {
  listeners: Vec<Box<EngineEventListener>>,
  pub vfs: VirtualFileSystem,
  pub virt_nodes: HashMap<String, PCEvalInfo>,
  pub dependency_graph: DependencyGraph,
  pub load_options: HashMap<String, EvalOptions>,
}

impl Engine {
  pub fn new(
    read_file: Box<FileReaderFn>,
    file_exists: Box<FileExistsFn>,
    resolve_file: Box<FileResolverFn>,
  ) -> Engine {
    Engine {
      listeners: vec![],
      virt_nodes: HashMap::new(),
      vfs: VirtualFileSystem::new(read_file, file_exists, resolve_file),
      dependency_graph: DependencyGraph::new(),
      load_options: HashMap::new(),
    }
  }

  pub async fn load(&mut self, uri: &String, part: Option<String>) -> Result<(), EngineError> {
    self
      .load_options
      .insert(uri.to_string(), EvalOptions { part });

    self.reload(uri, true).await
  }

  pub fn add_listener(&mut self, listener: Box<EngineEventListener>) {
    self.listeners.push(listener);
  }

  fn dispatch(&self, event: EngineEvent) {
    for listener in &self.listeners {
      (listener)(&event);
    }
  }

  pub fn get_loaded_ast(&self, uri: &String) -> Option<&DependencyContent> {
    let dep_option = self.dependency_graph.dependencies.get(uri);
    match dep_option {
      Some(dep) => Some(&dep.content),
      None => None,
    }
  }

  pub async fn reload(&mut self, uri: &String, hard: bool) -> Result<(), EngineError> {
    let load_result = self
      .dependency_graph
      .load_dependency(uri, &mut self.vfs)
      .await;

    match load_result {
      Ok(loaded_uris) => {
        let mut stack = HashSet::new();
        self
          .evaluate(uri, hard, &mut stack)
          .or_else(|e| Err(EngineError::Runtime(e)))
      }
      Err(error) => {
        self.dispatch(EngineEvent::Error(EngineError::Graph(error.clone())));
        Err(EngineError::Graph(error))
      }
    }
  }

  pub async fn parse_file(&mut self, uri: &String) -> Result<pc_ast::Node, ParseError> {
    let content = self.vfs.reload(uri).await.unwrap();
    parse_pc(content)
  }

  pub async fn parse_content(&mut self, content: &String) -> Result<pc_ast::Node, ParseError> {
    parse_pc(content)
  }

  pub async fn evaluate_file_styles(
    &mut self,
    uri: &String,
  ) -> Result<css_virt::CSSSheet, EngineError> {
    // need to load in case of imports
    self.reload(uri, false).await;
    let content = self.vfs.reload(uri).await.unwrap().to_string();
    evaluate_content_styles(&content, uri, &self.vfs, &self.dependency_graph).await
  }

  pub async fn evaluate_content_styles(
    &mut self,
    content: &String,
    uri: &String,
  ) -> Result<css_virt::CSSSheet, EngineError> {
    self.reload(uri, false).await;
    evaluate_content_styles(content, uri, &self.vfs, &self.dependency_graph).await
  }

  pub async fn update_virtual_file_content(
    &mut self,
    uri: &String,
    content: &String,
  ) -> Result<(), EngineError> {
    self.vfs.update(uri, content).await;
    self.reload(uri, false).await?;

    let mut dep_uris: Vec<String> = self.dependency_graph.flatten_dependents(uri);

    for dep_uri in dep_uris.drain(0..).into_iter() {
      let mut stack = HashSet::new();
      self.evaluate(&dep_uri, false, &mut stack);
    }

    Ok(())
  }

  fn evaluate(
    &mut self,
    uri: &String,
    hard: bool,
    stack: &mut HashSet<String>,
  ) -> Result<(), RuntimeError> {
    // prevent infinite loop
    if stack.contains(uri) {
      let err = RuntimeError::new(
        "Circular dependencies are not supported yet.".to_string(),
        uri,
        &ast::Location { start: 0, end: 1 },
      );
      self.dispatch(EngineEvent::Error(EngineError::Runtime(err.clone())));
      return Err(err);
    }

    stack.insert(uri.to_string());
    let dependency = self.dependency_graph.dependencies.get(uri).unwrap();

    let dept_uris: Vec<String> = self.dependency_graph.flatten_dependents(uri);

    let mut imports = HashMap::new();

    let relative_deps = &dependency
      .dependencies
      .iter()
      .map(|(relative_path, uri)| (relative_path.to_string(), uri.to_string()))
      .collect::<Vec<(String, String)>>();

    let all_dependencies = self.dependency_graph.flatten_dependencies(uri);


    for (id, dep_uri) in relative_deps {
      let info = if let Some(dep_result) = self.virt_nodes.get(dep_uri) {
        dep_result
      } else {
        self.evaluate(dep_uri, true, stack)?;

        self.virt_nodes.get(dep_uri).unwrap()
      };

      imports.insert(id.to_string(), info.exports.clone());
    }

    let node_result = evaluate_pc(uri, &self.dependency_graph, &self.vfs, &imports);

    let mut ret: Result<(), RuntimeError> = Ok(());

    let event_option = match node_result {
      Ok(node_option) => {
        if let Some(info) = node_option {
          if hard {
            self.virt_nodes.remove(uri);
          }

          let existing_info_option = self.virt_nodes.get(uri);

          if let Some(existing_info) = existing_info_option {
            // temporary - eventually want to diff this.
            let sheet: Option<css_virt::CSSSheet> = if existing_info.sheet == info.sheet {
              None
            } else {
              Some(info.sheet.clone())
            };

            let ret = Some(EngineEvent::Diffed(DiffedEvent {
              uri: uri.clone(),
              sheet,
              all_dependencies,
              dependents: dept_uris,
              mutations: diff_pc(&existing_info.preview, &info.preview),
            }));
            
            self.virt_nodes.insert(uri.clone(), info);
            ret
          } else {
            self.virt_nodes.insert(uri.clone(), info);
            Some(EngineEvent::Evaluated(EvaluatedEvent {
              uri: uri.clone(),
              all_dependencies,
              dependents: dept_uris,
              info: self.virt_nodes.get(uri),
            }))
          }
        } else {
          Some(EngineEvent::Evaluated(EvaluatedEvent {
            uri: uri.clone(),
            all_dependencies,
            dependents: vec![],
            info: None,
          }))
        }
      }
      Err(err) => {
        self.virt_nodes.remove(uri);
        ret = Err(err.clone());
        let e = EngineError::Runtime(err);
        Some(EngineEvent::Error(e))
      }
    };

    if let Some(event) = event_option {
      self.dispatch(event);
    }

    ret
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn can_smoke_parse_various_nodes() {
    //       let vfs = VirtualFileSystem::new(Box::new(|_| "".to_string()), Box::new(|_| true), Box::new(|_,_| "".to_string()));

    let mut engine = Engine::new(
      Box::new(|_| "".to_string()),
      Box::new(|_| true),
      Box::new(|_, _| Some("".to_string())),
    );

    let result = block_on(engine.parse_content(&"{'a'}".to_string())).unwrap();
    // println!("{:?}", result);
    // panic!("maybay");
  }
}
