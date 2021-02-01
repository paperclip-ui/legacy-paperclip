use crate::base::ast;
use crate::base::parser::ParseError;
use crate::base::runtime::RuntimeError;
use crate::core::eval::DependencyEval;
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph, GraphError};
use crate::core::vfs::{FileExistsFn, FileReaderFn, FileResolverFn, VirtualFileSystem};
use crate::css::runtime::evaluator2::evaluate as evaluate_css;
use crate::css::runtime::virt as css_virt;
use crate::pc::ast as pc_ast;
use crate::pc::parser::parse as parse_pc;
use crate::pc::runtime::diff::diff as diff_pc;
use crate::pc::runtime::evaluator::{evaluate as evaluate_pc, EngineMode};
use crate::pc::runtime::export as pc_export;
use crate::pc::runtime::mutation as pc_mutation;
use crate::pc::runtime::virt as pc_virt;
use ::futures::executor::block_on;
use serde::Serialize;
use std::collections::{BTreeMap, HashMap, HashSet};

// #[derive(Debug, PartialEq, Serialize, Clone)]
// pub struct EvaluateData {
//   #[serde(rename = "allDependencies")]
//   pub all_dependencies: Vec<String>,
//   pub dependents: Vec<String>,
//   // pub sheet: css_virt::CSSSheet,
//   // pub preview: pc_virt::Node,
//   // pub exports: DependencyExport,
//   pub details: DependencyEval,
// }

#[derive(Debug, PartialEq, Serialize)]
pub struct EvaluatedEvent<'a> {
  pub uri: String,
  pub imports: &'a BTreeMap<String, String>,
  pub data: &'a DependencyEval,
}

#[derive(Debug, PartialEq, Serialize)]
pub struct DeletedFileEvent {
  pub uri: String,
}

#[derive(Debug, PartialEq, Serialize)]
pub enum DiffedData<'a> {
  PC(DiffedPCData<'a>),
  CSS(DiffedCSSData<'a>),
}

#[derive(Debug, PartialEq, Serialize)]
pub struct DiffedPCData<'a> {
  // TODO - needs to be sheetMutations
  pub sheet: Option<css_virt::CSSSheet>,
  #[serde(rename = "allDependencies")]
  // pub all_dependencies: &'a Vec<String>,
  // pub dependents: &'a Vec<String>,
  pub exports: &'a pc_export::Exports,

  // TODO - needs to be domMutations
  pub mutations: Vec<pc_mutation::Mutation>,
}

#[derive(Debug, PartialEq, Serialize)]
pub struct DiffedCSSData<'a> {
  // TODO - needs to be sheetMutations
  pub sheet: Option<css_virt::CSSSheet>,
  #[serde(rename = "allDependencies")]
  pub all_dependencies: &'a Vec<String>,
  pub dependents: &'a Vec<String>,
  pub imports: &'a BTreeMap<String, pc_export::Exports>,
  pub exports: &'a pc_export::Exports,

  // TODO - needs to be domMutations
  pub mutations: Vec<pc_mutation::Mutation>,
}

#[derive(Debug, PartialEq, Serialize)]
pub struct DiffedEvent<'a> {
  pub uri: String,
  pub data: DiffedData<'a>,
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
pub enum EngineDelegateEvent<'a> {
  Evaluated(EvaluatedEvent<'a>),
  Deleted(DeletedFileEvent),
  Diffed(DiffedEvent<'a>),
  NodeParsed(NodeParsedEvent),
  Error(EngineError),
}

pub struct EvalOptions {
  part: Option<String>,
}

type EngineDelegateEventListener = dyn Fn(&EngineDelegateEvent);

pub struct Engine {
  listeners: Vec<Box<EngineDelegateEventListener>>,
  pub vfs: VirtualFileSystem,
  pub evaluated_data: BTreeMap<String, DependencyEval>,
  // pub import_graph: HashMap<String, BTreeMap<String, DependencyExport>>,
  pub dependency_graph: DependencyGraph,
  pub mode: EngineMode,
}

impl Engine {
  pub fn new(
    read_file: Box<FileReaderFn>,
    file_exists: Box<FileExistsFn>,
    resolve_file: Box<FileResolverFn>,
    mode: EngineMode,
  ) -> Engine {
    Engine {
      listeners: vec![],
      evaluated_data: BTreeMap::new(),
      // import_graph: HashMap::new(),
      vfs: VirtualFileSystem::new(read_file, file_exists, resolve_file),
      dependency_graph: DependencyGraph::new(),
      mode,
    }
  }

  pub async fn run(&mut self, uri: &String) -> Result<(), EngineError> {
    self.load(uri).await?;
    Ok(())
  }

  pub async fn evaluate_frames(&mut self, uri: &String) -> Result<(), EngineError> {
    Ok(())
  }

  pub fn add_listener(&mut self, listener: Box<EngineDelegateEventListener>) {
    self.listeners.push(listener);
  }

  fn dispatch(&self, event: EngineDelegateEvent) {
    for listener in &self.listeners {
      (listener)(&event);
    }
  }

  pub fn get_graph_uris(&self) -> Vec<String> {
    self.dependency_graph.dependencies.keys().cloned().collect()
  }

  pub fn get_loaded_ast(&self, uri: &String) -> Option<&DependencyContent> {
    let dep_option = self.dependency_graph.dependencies.get(uri);
    match dep_option {
      Some(dep) => Some(&dep.content),
      None => None,
    }
  }

  pub async fn load(&mut self, uri: &String) -> Result<(), EngineError> {
    let load_result = self
      .dependency_graph
      .load_dependency(uri, &mut self.vfs)
      .await;

    match load_result {
      Ok(loaded_uris) => {
        let mut stack = HashSet::new();

        self
          .evaluate(uri, &mut stack)
          .or_else(|e| Err(EngineError::Runtime(e)))?;

        Ok(())
      }
      Err(error) => {
        // Note - this was removed to prevent the engine
        // from dispatching an Evaluated event after error which
        // stops a flash from happening: https://github.com/crcn/paperclip/issues/604
        // self.evaluated_data.remove(uri);
        self.dispatch(EngineDelegateEvent::Error(EngineError::Graph(
          error.clone(),
        )));
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

  // Called when files are deleted
  pub async fn purge_unlinked_files(&mut self) -> Result<(), EngineError> {
    let deleted_uris: Vec<String> = self.vfs.purge_unlinked_files();

    for uri in deleted_uris {
      let dep_uris: Vec<String> = self.dependency_graph.flatten_dependents(&uri);

      self.dependency_graph.dependencies.remove(&uri);
      self.evaluated_data.remove(&uri);
      // self.import_graph.remove(&uri);

      self.dispatch(EngineDelegateEvent::Deleted(DeletedFileEvent {
        uri: uri.to_string(),
      }));

      // inefficient, but purge_unlinked_files won't get called often - this is okay for now I guess
      for dep in dep_uris {
        self.load(&dep).await;
      }
    }

    Ok(())
  }

  pub async fn update_virtual_file_content(
    &mut self,
    uri: &String,
    content: &String,
  ) -> Result<(), EngineError> {
    self.vfs.update(uri, content).await;
    self.run(uri).await?;

    let mut dep_uris: Vec<String> = self.dependency_graph.flatten_dependents(uri);

    for dep_uri in dep_uris.drain(0..).into_iter() {
      let mut stack = HashSet::new();
      self.evaluate(&dep_uri, &mut stack);
    }

    Ok(())
  }

  fn evaluate<'a>(
    &mut self,
    uri: &String,
    stack: &mut HashSet<String>,
  ) -> Result<(), RuntimeError> {
    // prevent infinite loop
    if stack.contains(uri) {
      let err = RuntimeError::new(
        "Circular dependencies are not supported".to_string(),
        uri,
        &ast::Location { start: 0, end: 1 },
      );
      self.dispatch(EngineDelegateEvent::Error(EngineError::Runtime(
        err.clone(),
      )));
      return Err(err);
    }

    stack.insert(uri.to_string());
    let dependency_option = self.dependency_graph.dependencies.get(uri);

    let dependency = if let Some(dep) = dependency_option {
      dep
    } else {
      return Err(RuntimeError::new(
        "dependency not loaded.".to_string(),
        uri,
        &ast::Location::new(0, 0),
      ));
    };

    // TODO - move this section into collect_imports function
    let dept_uris: Vec<String> = self.dependency_graph.flatten_dependents(uri);

    let mut imports: BTreeMap<String, DependencyEval> = BTreeMap::new();

    let relative_deps = &dependency
      .dependencies
      .iter()
      .map(|(relative_path, uri)| (relative_path.to_string(), uri.to_string()))
      .collect::<Vec<(String, String)>>();

    let all_dependencies = self.dependency_graph.flatten_dependencies(uri);

    for (id, dep_uri) in relative_deps {
      let data = if let Some(dep_result) = self.evaluated_data.get(dep_uri) {
        dep_result
      } else {
        self.evaluate(dep_uri, stack)?;

        self.evaluated_data.get(dep_uri).unwrap()
      };

      // imports.insert(id.to_string(), &data);
    }

    // self.import_graph.insert(uri.to_string(), imports.clone());

    let dependency = self.dependency_graph.dependencies.get(uri).unwrap();

    let eval_result: Result<DependencyEval, RuntimeError> = match &dependency.content {
      DependencyContent::StyleSheet(sheet) => {
        evaluate_css(uri, &self.dependency_graph, &self.vfs, &self.evaluated_data)
          .and_then(|info| Ok(DependencyEval::CSS(info)))
      }

      DependencyContent::Node(_) => evaluate_pc(
        uri,
        &self.dependency_graph,
        &self.vfs,
        &self.evaluated_data,
        &self.mode,
      )
      .and_then(|info| Ok(DependencyEval::PC(info))),
    };

    let eval = eval_result.or_else(|err| {
      let e = EngineError::Runtime(err.clone());
      self.dispatch(EngineDelegateEvent::Error(e));
      Err(err)
    })?;

    let existing_info_option = self.evaluated_data.remove(uri);

    self.evaluated_data.insert(uri.clone(), eval);
    let data = self.evaluated_data.get(uri).unwrap();

    if let Some(existing_info) = existing_info_option {
      match &existing_info {
        DependencyEval::PC(existing_details) => {
          if let DependencyEval::PC(new_details) = &data {
            // temporary - eventually want to diff this.
            let sheet: Option<css_virt::CSSSheet> = if new_details.sheet == existing_details.sheet {
              None
            } else {
              Some(new_details.sheet.clone())
            };

            let mutations = diff_pc(&existing_details.preview, &new_details.preview);

            // no need to dispatch mutation if no event

            // TODO - CSSOM changes can still happen, but aren't picked up
            // so we need to send the diff :(
            // if mutations.len() > 0 {
            self.dispatch(EngineDelegateEvent::Diffed(DiffedEvent {
              uri: uri.clone(),
              data: DiffedData::PC(DiffedPCData {
                sheet,
                // imports: &existing_details.imports,
                exports: &existing_details.exports,
                // all_dependencies: &existing_details.all_dependencies,
                // dependents: &data.dependents,
                mutations,
              }),
            }));
          }
        }
        DependencyEval::CSS(pc_info) => {}
      }
    } else {
      self.dispatch(EngineDelegateEvent::Evaluated(EvaluatedEvent {
        uri: uri.clone(),
        imports: &dependency.dependencies,
        data: &data,
      }));
    }

    Ok(())
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
      EngineMode::SingleFrame,
    );

    let result = block_on(engine.parse_content(&"{'a'}".to_string())).unwrap();
    // println!("{:?}", result);
    // panic!("maybay");
  }
}
