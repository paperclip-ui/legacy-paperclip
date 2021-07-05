use crate::base::ast;
use crate::base::parser::ParseError;
use crate::base::runtime::RuntimeError;
use crate::core::eval::DependencyEvalInfo;
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph, GraphError};
use crate::core::id_generator::generate_seed;
use crate::core::vfs::{FileExistsFn, FileReaderFn, FileResolverFn, VirtualFileSystem};
use crate::css::runtime::diff::diff as diff_css;
use crate::css::runtime::evaluator::evaluate as evaluate_css;
use crate::css::runtime::mutation as css_mutation;
use crate::css::runtime::virt as css_virt;
use crate::pc::ast as pc_ast;
use crate::pc::parser::parse as parse_pc;
use crate::pc::runtime::diff::diff as diff_pc;
use crate::pc::runtime::evaluator::{evaluate as evaluate_pc, EngineMode};
use crate::pc::runtime::export as pc_export;
use crate::pc::runtime::mutation as pc_mutation;
use crate::pc::runtime::virt as pc_virt;
use ::futures::executor::block_on;
use crate::pc::runtime::lint::{lint as lint_pc, LintOptions};
use serde::Serialize;
use std::collections::{BTreeMap, HashMap, HashSet};
use super::errors::EngineError;
use super::diagnostics::Diagnostic;


#[derive(Debug, PartialEq, Serialize)]
pub struct EvaluatedEvent<'a> {
  pub uri: String,
  pub data: &'a DependencyEvalInfo,
}

#[derive(Debug, PartialEq, Serialize)]
pub struct DeletedFileEvent {
  pub uri: String,
}

#[derive(Debug, PartialEq, Serialize)]
#[serde(tag = "kind")]
pub enum DiffedData<'a> {
  PC(DiffedPCData<'a>),
  CSS(DiffedCSSData<'a>),
}

#[derive(Debug, PartialEq, Serialize)]
pub struct DiffedPCData<'a> {
  #[serde(rename = "sheetMutations")]
  pub sheet_mutations: Vec<css_mutation::Mutation>,

  #[serde(rename = "allImportedSheetUris")]
  pub all_imported_sheet_uris: &'a Vec<String>,

  pub dependencies: &'a BTreeMap<String, String>,

  pub exports: &'a pc_export::Exports,

  // TODO - needs to be domMutations
  pub mutations: Vec<pc_mutation::Mutation>,
}

#[derive(Debug, PartialEq, Serialize)]
pub struct DiffedCSSData<'a> {
  // TODO - needs to be sheetMutations
  pub sheet: Option<css_virt::CSSSheet>,
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

#[derive(Debug, PartialEq, Serialize)]
#[serde(tag = "kind")]
pub enum EngineEvent<'a> {
  Evaluated(EvaluatedEvent<'a>),
  Deleted(DeletedFileEvent),
  Diffed(DiffedEvent<'a>),
  NodeParsed(NodeParsedEvent),
  Error(EngineError),
}

pub struct EvalOptions {
  part: Option<String>,
}

type EngineEventListener = dyn Fn(&EngineEvent);

pub struct Engine {
  listeners: Vec<Box<EngineEventListener>>,
  pub vfs: VirtualFileSystem,
  pub evaluated_data: BTreeMap<String, DependencyEvalInfo>,
  pub needs_reval: BTreeMap<String, bool>,
  // pub import_graph: HashMap<String, BTreeMap<String, DependencyExport>>,
  pub dependency_graph: DependencyGraph,
  pub mode: EngineMode,
  // keeping tabs of
  pub diagnostics: BTreeMap<String, Vec<Diagnostic>>
}

impl Engine {
  pub fn new(
    read_file: Box<FileReaderFn>,
    file_exists: Box<FileExistsFn>,
    resolve_file: Box<FileResolverFn>,
    mode: EngineMode,
  ) -> Engine {
    let mut engine = Engine {
      listeners: vec![],
      evaluated_data: BTreeMap::new(),
      needs_reval: BTreeMap::new(),
      vfs: VirtualFileSystem::new(read_file, file_exists, resolve_file),
      dependency_graph: DependencyGraph::new(),
      diagnostics: BTreeMap::new(),
      mode,
    };

    engine
  }


  pub async fn run(&mut self, uri: &String) -> Result<(), EngineError> {
    self.load(uri).await?;
    Ok(())
  }

  pub fn add_listener(&mut self, listener: Box<EngineEventListener>) {
    self.listeners.push(listener);
  }

  fn dispatch(&self, event: EngineEvent) {
    for listener in &self.listeners {
      (listener)(&event);
    }
  }

  pub fn get_graph_uris(&self) -> Vec<String> {
    self.dependency_graph.dependencies.keys().cloned().collect()
  }

  pub fn reset(&mut self) {
    self.dependency_graph = DependencyGraph::new();
    self.needs_reval = BTreeMap::new();
    self.evaluated_data = BTreeMap::new();
    self.vfs.reset();
  }

  pub fn get_loaded_ast(&self, uri: &String) -> Option<&DependencyContent> {
    self
      .dependency_graph
      .dependencies
      .get(uri)
      .and_then(|dep| Some(&dep.content))
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
        self.needs_reval.insert(uri.to_string(), true);


        let engine_error = EngineError::Graph(
          error.clone(),
        );

        // Note - this was removed to prevent the engine
        // from dispatching an Evaluated event after error which
        // stops a flash from happening: https://github.com/crcn/paperclip/issues/604
        // self.evaluated_data.remove(uri);
        self.set_diagnostic_error(uri, engine_error.clone());
        
        Err(engine_error)
      }
    }
  }

  pub fn lint_file(&mut self, uri: &String) -> Option<Vec<Diagnostic>> {
    self.evaluated_data.get(uri).and_then(|dep_eval_info| {
      match dep_eval_info {
        DependencyEvalInfo::PC(pc) => Some(pc),
        _ => None
      }
    }).and_then(|eval_info| {
      Some(lint_pc(eval_info, &self.dependency_graph, LintOptions {
        no_unused_css: Some(true),
        enforce_refs: None,
        enforce_previews: None
      }))
    }).and_then(|lint_diagnostics| {
      let mut diagnostics: Vec<Diagnostic> = vec![];
      let existing_diagnostics = self.diagnostics.get(uri).or(Some(&(vec![] as Vec<Diagnostic>))).unwrap().clone();
      diagnostics.extend(existing_diagnostics);
      diagnostics.extend(lint_diagnostics.into_iter().map(|warn| {
        Diagnostic::LintWarning(warn)
      }));
      Some(diagnostics)
    })
  }

  pub async fn parse_file(&mut self, uri: &String) -> Result<pc_ast::Node, ParseError> {
    let content = self.vfs.reload(uri).await.unwrap();
    parse_pc(content, generate_seed().as_str())
  }

  pub async fn parse_content(&mut self, content: &String) -> Result<pc_ast::Node, ParseError> {
    parse_pc(content, generate_seed().as_str())
  }

  // Called when files are deleted
  pub async fn purge_unlinked_files(&mut self) -> Result<(), EngineError> {
    let deleted_uris: Vec<String> = self.vfs.purge_unlinked_files();

    for uri in deleted_uris {
      let dep_uris: Vec<String> = self.dependency_graph.flatten_dependents(&uri);

      self.dependency_graph.dependencies.remove(&uri);
      self.evaluated_data.remove(&uri);

      self.dispatch(EngineEvent::Deleted(DeletedFileEvent {
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


  fn set_diagnostic_error<'a>(&mut self, uri: &String, error: EngineError) {
    self.diagnostics.insert(uri.to_string(), vec![Diagnostic::EngineError(error.clone())]);
    self.dispatch(EngineEvent::Error(error));
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

      self.set_diagnostic_error(uri, EngineError::Runtime(
        err.clone(),
      ));
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

    let relative_deps = &dependency
      .dependencies
      .iter()
      .map(|(relative_path, uri)| (relative_path.to_string(), uri.to_string()))
      .collect::<Vec<(String, String)>>();

    for (id, dep_uri) in relative_deps {
      let data = if let Some(dep_result) = self.evaluated_data.get(dep_uri) {
        dep_result
      } else {
        self.evaluate(dep_uri, stack)?;

        self.evaluated_data.get(dep_uri).unwrap()
      };
    }

    let dependency = self.dependency_graph.dependencies.get(uri).unwrap();

    let eval_result: Result<DependencyEvalInfo, RuntimeError> = match &dependency.content {
      DependencyContent::StyleSheet(sheet) => {
        evaluate_css(uri, &self.dependency_graph, &self.vfs, &self.evaluated_data)
          .and_then(|info| Ok(DependencyEvalInfo::CSS(info)))
      }

      DependencyContent::Node(_) => evaluate_pc(
        uri,
        &self.dependency_graph,
        &self.vfs,
        &self.evaluated_data,
        &self.mode,
      )
      .and_then(|info| Ok(DependencyEvalInfo::PC(info))),
    };

    let eval = eval_result.or_else(|err| {

      // need to re-eval so that any diagnostics or state get reset
      // if rendering resumes but there are no changes

      self.needs_reval.insert(uri.to_string(), true);

      self.set_diagnostic_error(uri, EngineError::Runtime(err.clone()));

      Err(err)
    })?;

    let existing_info_option = self.evaluated_data.remove(uri);

    self.evaluated_data.insert(uri.clone(), eval);
    let data = self.evaluated_data.get(uri).unwrap();

    if let Some(existing_info) = existing_info_option {
      match &existing_info {
        DependencyEvalInfo::PC(existing_details) => {
          if let DependencyEvalInfo::PC(new_details) = &data {

            let sheet_mutations = diff_css(&existing_details.sheet, &new_details.sheet);
            let mutations = diff_pc(&existing_details.preview, &new_details.preview);

            if sheet_mutations.len() > 0
              || mutations.len() > 0
              || existing_details.all_imported_sheet_uris != new_details.all_imported_sheet_uris
              || existing_details.exports != new_details.exports
              || self.needs_reval.contains_key(uri)
            {
              self.needs_reval.remove(uri);
              // no need to dispatch mutation if no event

              // TODO - CSSOM changes can still happen, but aren't picked up
              // so we need to send the diff :(
              // if mutations.len() > 0 {
              self.dispatch(EngineEvent::Diffed(DiffedEvent {
                uri: uri.clone(),
                data: DiffedData::PC(DiffedPCData {
                  sheet_mutations,
                  exports: &new_details.exports,
                  all_imported_sheet_uris: &new_details.all_imported_sheet_uris,
                  dependencies: &new_details.dependencies,
                  mutations,
                }),
              }));
            }
          }
        }
        DependencyEvalInfo::CSS(pc_info) => {}
      }
    } else {
      self.dispatch(EngineEvent::Evaluated(EvaluatedEvent {
        uri: uri.clone(),
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

    let mut engine = Engine::new(
      Box::new(|_| "".to_string()),
      Box::new(|_| true),
      Box::new(|_, _| Some("".to_string())),
      EngineMode::SingleFrame,
    );

    let result = block_on(engine.parse_content(&"{'a'}".to_string())).unwrap();
  }
}
