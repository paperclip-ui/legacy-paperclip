use serde::Serialize;
use crate::core::graph::{DependencyGraph, DependencyContent, Dependency};
use crate::pc::ast as pc_ast;
use crate::css::ast as css_ast;
use crate::js::ast as script_ast;
use crate::css::ast::{Sheet};
use crate::core::ast::{ExprVisitor, Expr};
use crate::core::eval::DependencyEvalInfo;
use crate::engine::engine::{Engine};
use crate::css::runtime::evaluator as css_eval;
use crate::pc::runtime::evaluator as pc_eval;
use std::collections::{HashMap, BTreeMap, HashSet};
use ::futures::executor::block_on;

#[derive(Debug, PartialEq, Serialize)]
pub struct CoverageReport {
  files: Vec<FileReport>
}

#[derive(Debug, PartialEq, Serialize)]
struct FileReport {

}

type MissedExprIds = HashMap<String, HashSet<String>>;


struct Source<'a> {
  graph: &'a DependencyGraph,
  evaluated: &'a BTreeMap<String, DependencyEvalInfo>
}

struct AnalyzeContext<'a> {
  missing_ids: MissedExprIds,
  source: Source<'a>
}

pub fn generate_coverage_report(graph: &DependencyGraph, evaluated: &BTreeMap<String, DependencyEvalInfo>) -> CoverageReport {
  let source: Source = Source { graph, evaluated };

  let missing_ids = get_missed_expr_ids(&source);

  let mut analyze_context = AnalyzeContext { missing_ids, source };

  analyze_graph(&mut analyze_context);


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

fn get_missed_file_expr_ids(dep: &Dependency) -> HashSet<String> {
  match &dep.content {
    DependencyContent::Node(node) => ExprIdCollector::collect_expr_ids(node),
    DependencyContent::StyleSheet(sheet) => ExprIdCollector::collect_expr_ids(sheet)
  }
}

fn analyze_graph(context: &mut AnalyzeContext) {
  for (uri, evaluated) in context.source.evaluated {
    analyze_content(uri, evaluated, context);
  }
}

fn analyze_content(uri: &String, content: &DependencyEvalInfo, context: &mut AnalyzeContext) {
  match content {
    DependencyEvalInfo::CSS(css) => {
      analyze_css_content(uri, css, context);
    }
    DependencyEvalInfo::PC(pc) => {
      analyze_pc_content(uri, pc, context);
    }
  }
}


fn analyze_css_content(uri: &String, content: &css_eval::EvalInfo, context: &mut AnalyzeContext) {
}

fn analyze_pc_content(uri: &String, content: &pc_eval::EvalInfo, context: &mut AnalyzeContext) {

}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::engine::engine::{Engine};
  use crate::engine::test_utils::{create_mock_engine};
  
  fn open_all_entries(graph: &HashMap<String, String>, engine: &mut Engine) {
    for (uri, _) in graph {
      if let Err(err) = block_on(engine.run(uri)) {
        panic!("{:?}", err);
      }
    }
  }

  #[test]
  fn can_get_basic_coverage_on_a_node() {
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
struct ExprIdCollector {
  pub expr_ids: HashSet<String>
}

impl ExprIdCollector {
  fn visit_expr<'a>(&'a mut self, expr: &'a dyn Expr)  {
    self.expr_ids.insert(expr.get_id().to_string());
  }
  fn collect_expr_ids(expr: &dyn Expr) -> HashSet<String> {
    let mut collector = ExprIdCollector {
      expr_ids: HashSet::new()
    };

    expr.walk(&mut collector);

    collector.expr_ids

  }
}

impl<'a> ExprVisitor<'a> for ExprIdCollector {
  fn visit_node(&mut self, expr: &'a pc_ast::Node) {
    self.visit_expr(expr);
  } 

  fn visit_css_rule(&mut self, expr: &'a css_ast::Rule) {
    self.visit_expr(expr);
  }

  fn visit_css_decl(&mut self, expr: &'a css_ast::Declaration) {
    self.visit_expr(expr);
  }

  fn visit_css_sheet(&mut self, expr: &'a css_ast::Sheet) {
    self.visit_expr(expr);
  }

  fn visit_script_expression(&mut self, expr: &'a script_ast::Expression) {
    self.visit_expr(expr);
  }

  fn should_continue(&self) -> bool {
    return true;
  }
}