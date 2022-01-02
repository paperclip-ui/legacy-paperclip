use serde::Serialize;
use crate::core::graph::{DependencyGraph, DependencyContent, Dependency};
use crate::pc::ast as pc_ast;
use crate::css::ast as css_ast;
use crate::script::ast as script_ast;
use crate::base::ast as base_ast;
use crate::css::ast::{Sheet};
use crate::core::ast::{ExprVisitor, Expr};
use crate::core::eval::DependencyEvalInfo;
use crate::engine::engine::{Engine};
use crate::css::runtime::evaluator as css_eval;
use crate::pc::runtime::evaluator as pc_eval;
use std::collections::{HashMap, BTreeMap, HashSet};
use ::futures::executor::block_on;
use crate::base::string_scanner::U16Position;


#[derive(Debug, PartialEq, Serialize)]
pub struct CoverageReport {
  files: Vec<FileReport>
}

#[derive(Debug, PartialEq, Serialize)]
struct FileReport {
  uri: String,
  missing_statement_ranges: Vec<base_ast::Range>,
  percent_coverage: u32
}


struct Source<'a> {
  graph: &'a DependencyGraph,
  evaluated: &'a BTreeMap<String, DependencyEvalInfo>
}

struct AnalyzeContext<'a> {
  pub evaluated: &'a BTreeMap<String, DependencyEvalInfo>,
  pub missed_ids: HashMap<String, String>
}

pub fn generate_coverage_report(graph: &DependencyGraph, evaluated: &BTreeMap<String, DependencyEvalInfo>) -> CoverageReport {
  let source: Source = Source { graph, evaluated };

  let missed_ids = get_missed_expr_ids(&source);

  let mut analyze_context = AnalyzeContext { missed_ids, evaluated };

  analyze_graph(&mut analyze_context);


  CoverageReport {
    files: generate_file_reports(&analyze_context.missed_ids, graph)
  }
} 

fn generate_file_reports(missed_ids: &HashMap<String, String>, graph: &DependencyGraph) -> Vec<FileReport> {
  let mut reports: Vec<FileReport> = vec![];
  let mut file_expr_id_map:HashMap<String, HashSet<String>> = HashMap::new();

  for (id, uri) in missed_ids {
    if let Some(file_ids) = file_expr_id_map.get_mut(uri) {
      file_ids.insert(id.to_string());
    } else {
      let mut ids = HashSet::new();
      ids.insert(id.to_string());
      file_expr_id_map.insert(uri.to_string(), ids);
    }
  }

  for (uri, dep) in &graph.dependencies {
    reports.push(generate_file_report(&uri, dep, file_expr_id_map.get(uri).unwrap_or(&HashSet::new())));
  }

  return reports;
}

fn generate_file_report(uri: &String, dep: &Dependency, missing_ids: &HashSet<String>) -> FileReport {

  let mut missing_statement_ranges: Vec<base_ast::Range> = vec![];

  // println!("{:?}", missing_ids);
  // panic!("aa");

  for id in missing_ids {
    if let Some(expr) = dep.get_expression_by_id(id) {
      println!("{:?}", expr);
      missing_statement_ranges.push(expr.get_range().clone());
    } else {
      panic!("Expr ID not found");
    }
  }

  // match dep.content {
  //   DependencyContent::Node(node) => {

  //   },
  //   => {

  //   }
  // }
  FileReport {
    uri: uri.to_string(),
    missing_statement_ranges,
    percent_coverage: 0
  }
}

fn get_missed_expr_ids(source: &Source) -> HashMap<String, String> {
  let mut missed: HashMap<String, String> = HashMap::new();

  for (uri, dep) in &source.graph.dependencies {
    for id in get_missed_file_expr_ids(dep) {
      missed.insert(id.to_string(), uri.to_string());
    }
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
  for (uri, evaluated) in context.evaluated {
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
  if let Some(used_expr_ids) = &content.used_expr_ids {
    for used_id in used_expr_ids {
      context.missed_ids.remove(used_id);
    }
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
          uri: "entry.pc".to_string(),
          missing_statement_ranges: vec![],
          percent_coverage: 0
        }
      ]
    }));
  }


  #[test]
  fn doesnt_show_missing_lines_for_slot_element() {
    let graph: HashMap<String, String> = [
      ("entry.pc".to_string(), "
      <div component as=\"Test\">
        {<div />}
      </div>

      <Test />
    ".to_string())
    ].iter().cloned().collect();

    let mut engine = create_mock_engine(&graph);
    open_all_entries(&graph, &mut engine);
    assert_eq!(block_on(engine.generate_coverage_report()), Ok(CoverageReport {
      files: vec![
        FileReport {
          uri: "entry.pc".to_string(),
          missing_statement_ranges: vec![
            base_ast::Range::new(U16Position::new(41, 3, 9), U16Position::new(50, 3, 18))
          ],
          percent_coverage: 0
        }
      ]
    }));
  }

  #[test]
  fn shows_missing_lines_for_a_slot() {
    let graph: HashMap<String, String> = [
      ("entry.pc".to_string(), "
        <div component as=\"Test\">
          {<div />}
        </div>

        <Test />
      ".to_string())
    ].iter().cloned().collect();

    let mut engine = create_mock_engine(&graph);
    open_all_entries(&graph, &mut engine);
    assert_eq!(block_on(engine.generate_coverage_report()), Ok(CoverageReport {
      files: vec![
        FileReport {
          uri: "entry.pc".to_string(),
          missing_statement_ranges: vec![],
          percent_coverage: 0
        }
      ]
    }));
  }
}