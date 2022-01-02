use serde::Serialize;
use crate::core::graph::{DependencyGraph, DependencyContent, Dependency};
use crate::pc::ast::{Node};
use crate::css::ast::{Sheet};
use crate::core::eval::DependencyEvalInfo;
use crate::engine::engine::{Engine};
use std::collections::{HashMap, BTreeMap};
use ::futures::executor::block_on;

#[derive(Debug, PartialEq, Serialize)]
pub struct CoverageReport {
  files: Vec<FileReport>
}

#[derive(Debug, PartialEq, Serialize)]
struct FileReport {

}

type MissedExprIds = HashMap<String, HashMap<String, bool>>;

struct Source<'a> {
  graph: &'a DependencyGraph,
  evaluated: &'a BTreeMap<String, DependencyEvalInfo>
}

pub fn generate_coverage_report(graph: &DependencyGraph, evaluated: &BTreeMap<String, DependencyEvalInfo>) -> CoverageReport {


  let source: Source = Source { graph, evaluated };

  let missing_ids = get_missed_expr_ids(&source);


  CoverageReport {
    files: Vec::new()
  }
} 

fn get_missed_expr_ids(source: &Source) -> MissedExprIds {
  let mut missed: MissedExprIds = HashMap::new();

  for (uri, dep) in &source.graph.dependencies {
    missed.insert(uri.to_string(), get_missed_file_expr_ids(dep));
  }

  missed
}

fn get_missed_file_expr_ids(dep: &Dependency) -> HashMap<String, bool> {
  match &dep.content {
    DependencyContent::Node(node) => get_mising_node_expr_ids(node),
    DependencyContent::StyleSheet(sheet) => get_missing_style_expr_ids(sheet)
  }
}

fn get_mising_node_expr_ids(node: &Node) -> HashMap<String, bool> {
  let missed: HashMap<String, bool> = HashMap::new();
  // node.walk(|expr| {

  // })
  missed
}

fn get_missing_style_expr_ids(node: &Sheet) -> HashMap<String, bool> {
  let missed: HashMap<String, bool> = HashMap::new();
  missed
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::engine::engine::{Engine};
  use crate::engine::test_utils::{create_mock_engine};
  
  fn open_all_entries(graph: &HashMap<String, String>, engine: &mut Engine) {
    for (uri, _) in graph {
      engine.load(uri);
    }
  }

  #[test]
  fn can_smoke_parse_various_nodes() {
    let graph: HashMap<String, String> = [
      ("entry.pc".to_string(), "<div></div>".to_string())
    ].iter().cloned().collect();

    let mut engine = create_mock_engine(&graph);
    open_all_entries(&graph, &mut engine);
    assert_eq!(block_on(engine.generate_coverage_report()), Ok(CoverageReport {
      files: vec![
        FileReport {

        }
      ]
    }));
  }
}