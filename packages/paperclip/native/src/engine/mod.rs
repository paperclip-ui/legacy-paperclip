use std::collections::HashMap;
use crate::pc::{runtime};
use crate::pc::parser::{parse as parse_pc};
use crate::css::parser::{parse as parse_css};
use crate::base::parser::{ParseError};
use crate::pc::ast as pc_ast;
use crate::pc::runtime::graph::{DependencyGraph, DependencyContent, GraphError};
use crate::pc::runtime::vfs::{VirtualFileSystem, FileExistsFn, FileReaderFn, FileResolverFn};
use crate::pc::runtime::evaluator::{evaluate_document_styles, evaluate as evaluate_pc};
use crate::css::runtime::evaluator::{evaluate as evaluate_css};
use crate::js::runtime::virt as js_virt;
use crate::base::runtime::{RuntimeError};
use serde::{Serialize};
use crate::css::runtime::virt as css_vrt;
use crate::base::utils::{get_document_style_scope};
use ::futures::executor::block_on;

#[derive(Debug, PartialEq, Serialize)]
pub struct EvaluatedEvent {
  pub uri: String,
  pub node: Option<runtime::virt::Node>
}

#[derive(Debug, PartialEq, Serialize)]
pub struct NodeParsedEvent {
  pub uri: String,
  pub node: pc_ast::Node
}


#[derive(Debug, PartialEq, Serialize)]
#[serde(tag = "errorKind")]
pub enum EngineError {
  Graph(GraphError),
  Parser(ParseError),
  Runtime(RuntimeError)
}

#[derive(Debug, PartialEq, Serialize)]
#[serde(tag = "kind")]
pub enum EngineEvent {
  Evaluated(EvaluatedEvent),
  NodeParsed(NodeParsedEvent),
  Error(EngineError)
}

pub struct EvalOptions {
  part: Option<String>
}

async fn evaluate_content_styles(content: &String, uri: &String, vfs: &VirtualFileSystem) -> Result<css_vrt::CSSSheet, EngineError> {
  if uri.ends_with(".css") {
    parse_css(content)
    .map_err(|err| {
      EngineError::Parser(err)
    })
    .and_then(|css_ast| {
      let scope = get_document_style_scope(uri);
      evaluate_css(&css_ast, uri, &scope, vfs)
      .map_err(|err| {
        EngineError::Runtime(err)
      })
    })
  } else {
    parse_pc(content)
    .map_err(|err| {
      EngineError::Parser(err)
    })
    .and_then(|node_ast| {
      evaluate_document_styles(&node_ast, uri, vfs)
      .map_err(|err| {
        EngineError::Runtime(err)
      })
    })
  }
}

type EngineEventListener = dyn Fn(&EngineEvent);

pub struct Engine {
  listeners: Vec<Box<EngineEventListener>>,
  pub vfs: VirtualFileSystem,
  pub dependency_graph: DependencyGraph,
  pub load_options: HashMap<String, EvalOptions>
}

impl Engine {
  pub fn new(read_file: Box<FileReaderFn>, file_exists: Box<FileExistsFn>, resolve_file: Box<FileResolverFn>) -> Engine {
    Engine {
      listeners: vec![],
      vfs: VirtualFileSystem::new(read_file, file_exists, resolve_file),
      dependency_graph: DependencyGraph::new(),
      load_options: HashMap::new()
    }
  }
  
  pub async fn load(&mut self, uri: &String, part: Option<String>) -> Result<(), GraphError> {
    self.load_options.insert(uri.to_string(), EvalOptions {
      part
    });

    self
    .reload(uri)
    .await
  }

  pub fn add_listener(&mut self, listener: Box<EngineEventListener>) {
    self.listeners.push(listener);
  }

  fn dispatch(&self, event: EngineEvent) {
    for listener in &self.listeners {
      (listener)(&event);
    }
  }

  pub async fn reload(&mut self, uri: &String) -> Result<(), GraphError> {
    let load_result = self.dependency_graph.load_dependency(uri, &mut self.vfs).await;

    match load_result {
      Ok(loaded_uris) => {
        
        for uri in loaded_uris.iter() {
          let dep = self.dependency_graph.dependencies.get(uri).unwrap();
          
          let event_option = match &dep.content {
            DependencyContent::Node(node) => {
              Some(EngineEvent::NodeParsed(NodeParsedEvent {
                uri: dep.uri.to_string(),
                node: node.clone()
              }))
            },
            _ => {
              // TODO - CSS 
              None
            }
          };
          if let Some(event) = event_option {
            self.dispatch(event);
          }
        }

        self.evaluate(uri);
        Ok(())
      },
      Err(error) => {
        self.dispatch(EngineEvent::Error(EngineError::Graph(error.clone())));
        Err(error)
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

  pub async fn evaluate_file_styles(&mut self, uri: &String) -> Result<css_vrt::CSSSheet, EngineError> {
    let content = self.vfs.reload(uri).await.unwrap().to_string();
    evaluate_content_styles(&content, uri, &self.vfs).await
  }

  pub async fn evaluate_content_styles(&mut self, content: &String, uri: &String) -> Result<css_vrt::CSSSheet, EngineError> {
    evaluate_content_styles(content, uri, &self.vfs).await
  }

  pub async fn update_virtual_file_content(&mut self, uri: &String, content: &String) -> Result<(), GraphError> {
    self.vfs.update(uri, content).await;
    self.reload(uri).await?;

    let mut dep_uris: Vec<String> = self.dependency_graph.flatten_dependents(uri).into_iter().map(|dep| -> String {
      dep.uri.to_string()
    }).collect();

    for dep_uri in dep_uris.drain(0..).into_iter() {
      self.evaluate(&dep_uri);
    }

    Ok(())
  }

  fn evaluate(&mut self, uri: &String) {
    let dependency = self.dependency_graph.dependencies.get(uri).unwrap();

    let event_option = match &dependency.content {
      DependencyContent::Node(node) => {
        let node_result = evaluate_pc(
          uri, 
          &self.dependency_graph, 
          &self.vfs,
          &js_virt::JsValue::JsObject(js_virt::JsObject::new()),
          self.load_options.get(uri).and_then(|options| {
            options.part.clone()
          })
        );

        match node_result {
          Ok(node) => Some(EngineEvent::Evaluated(EvaluatedEvent {
            uri: uri.clone(),
            node,
          })),
          Err(err) => Some(EngineEvent::Error(EngineError::Runtime(err)))
        }
      },
      _ => None
    };

    if let Some(event) = event_option {
      self.dispatch(event);
    }
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
      Box::new(|_,_| "".to_string())
    );

    let result = block_on(engine.parse_content(&"{'a'}".to_string())).unwrap();
    // println!("{:?}", result);
    // panic!("maybay");
  
  }
}