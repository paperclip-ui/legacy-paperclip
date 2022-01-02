use crate::base::ast as base_ast;
use crate::core::ast::{Expr, ExprVisitor};
use crate::core::eval::DependencyEvalInfo;
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph};
use crate::css::ast as css_ast;
use crate::css::ast::Sheet;
use crate::css::runtime::evaluator as css_eval;
use crate::pc::ast as pc_ast;
use crate::pc::runtime::evaluator as pc_eval;
use crate::pc::runtime::inspect_node_styles;
use crate::pc::runtime::virt as pc_virt;
use crate::script::ast as script_ast;
use serde::Serialize;
use std::collections::{BTreeMap, HashMap, HashSet};

#[derive(Debug, PartialEq, Serialize)]
pub struct CoverageReport {
  files: Vec<FileReport>,
}

#[derive(Debug, PartialEq, Serialize)]
struct FileReport {
  uri: String,
  missing_statement_ranges: Vec<base_ast::Range>,
  statement_coverage: u32,
}

struct Source<'a> {
  graph: &'a DependencyGraph,
  evaluated: &'a BTreeMap<String, DependencyEvalInfo>,
}

struct AnalyzeContext<'a> {
  pub evaluated: &'a BTreeMap<String, DependencyEvalInfo>,
  pub missed_ids: HashMap<String, String>,
}

pub fn generate_coverage_report(
  graph: &DependencyGraph,
  evaluated: &BTreeMap<String, DependencyEvalInfo>,
) -> CoverageReport {
  let source: Source = Source { graph, evaluated };

  let missed_ids = get_missed_expr_ids(&source);

  let mut analyze_context = AnalyzeContext {
    missed_ids,
    evaluated,
  };

  analyze_graph(&mut analyze_context);

  CoverageReport {
    files: generate_file_reports(&analyze_context.missed_ids, graph),
  }
}

fn generate_file_reports(
  missed_ids: &HashMap<String, String>,
  graph: &DependencyGraph,
) -> Vec<FileReport> {
  println!("Missing {:?}", missed_ids);
  let mut reports: Vec<FileReport> = vec![];
  let mut file_expr_id_map: HashMap<String, HashSet<String>> = HashMap::new();

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
    reports.push(generate_file_report(
      &uri,
      dep,
      file_expr_id_map.get(uri).unwrap_or(&HashSet::new()),
    ));
  }

  return reports;
}

fn generate_file_report(
  uri: &String,
  dep: &Dependency,
  missing_ids: &HashSet<String>,
) -> FileReport {
  let mut missing_statement_ranges: Vec<base_ast::Range> = vec![];

  for id in missing_ids {
    if let Some(expr) = dep.get_expression_by_id(id) {
      missing_statement_ranges.push(expr.get_range().clone());
    } else {
      panic!("Expr ID not found");
    }
  }

  FileReport {
    uri: uri.to_string(),
    missing_statement_ranges,
    statement_coverage: 0,
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
    DependencyContent::StyleSheet(sheet) => ExprIdCollector::collect_expr_ids(sheet),
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

fn analyze_css_content(uri: &String, content: &css_eval::EvalInfo, context: &mut AnalyzeContext) {}

fn analyze_pc_content(uri: &String, content: &pc_eval::EvalInfo, context: &mut AnalyzeContext) {
  // first, remove all PC expressions that have been used. This includes scripts, and HTML
  if let Some(used_expr_ids) = &content.used_expr_ids {
    for used_id in used_expr_ids {
      context.missed_ids.remove(used_id);
    }
  }

  analayze_node_styles(uri, &content.preview, context);
}

fn analayze_node_styles(uri: &String, node: &pc_virt::Node, context: &mut AnalyzeContext) {}

struct ExprIdCollector {
  pub expr_ids: HashSet<String>,
}

impl ExprIdCollector {
  fn visit_core_expr<'a>(&'a mut self, expr: &'a dyn Expr) {
    println!("{:?}", expr);
    self.expr_ids.insert(expr.get_id().to_string());
  }
  fn collect_expr_ids(expr: &dyn Expr) -> HashSet<String> {
    let mut collector = ExprIdCollector {
      expr_ids: HashSet::new(),
    };

    expr.walk(&mut collector);

    collector.expr_ids
  }
}

impl<'a> ExprVisitor<'a> for ExprIdCollector {
  fn visit_node(&mut self, expr: &'a pc_ast::Node) {
    self.visit_core_expr(expr);
  }

  fn visit_attr(&mut self, expr: &'a pc_ast::Attribute) {
    self.visit_core_expr(expr);
  }

  fn visit_css_rule(&mut self, expr: &'a css_ast::Rule) {
    self.visit_core_expr(expr);
  }

  fn visit_css_decl(&mut self, expr: &'a css_ast::Declaration) {
    self.visit_core_expr(expr);
  }

  fn visit_css_sheet(&mut self, expr: &'a css_ast::Sheet) {
    self.visit_core_expr(expr);
  }

  fn visit_script_expression(&mut self, expr: &'a script_ast::Expression) {
    self.visit_core_expr(expr);
  }

  fn should_continue(&self) -> bool {
    return true;
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::base::string_scanner::U16Position;
  use crate::engine::engine::Engine;
  use crate::engine::test_utils::create_mock_engine;
  use ::futures::executor::block_on;

  fn open_all_entries(graph: &HashMap<String, String>, engine: &mut Engine) {
    for (uri, _) in graph {
      if let Err(err) = block_on(engine.run(uri)) {
        panic!("{:?}", err);
      }
    }
  }

  #[test]
  fn can_get_basic_coverage_on_a_node() {
    let graph: HashMap<String, String> = [("entry.pc".to_string(), "<div></div>".to_string())]
      .iter()
      .cloned()
      .collect();
    assert_graph_report(
      graph,
      CoverageReport {
        files: vec![FileReport {
          uri: "entry.pc".to_string(),
          missing_statement_ranges: vec![],
          statement_coverage: 0,
        }],
      },
    );
  }

  #[test]
  fn doesnt_show_missing_lines_for_slot_element() {
    let graph: HashMap<String, String> = [(
      "entry.pc".to_string(),
      "
      <div component as=\"Test\">
        {<div />}
      </div>

      <Test />
    "
      .to_string(),
    )]
    .iter()
    .cloned()
    .collect();
    assert_graph_report(
      graph,
      CoverageReport {
        files: vec![FileReport {
          uri: "entry.pc".to_string(),
          missing_statement_ranges: vec![],
          statement_coverage: 0,
        }],
      },
    );
  }

  #[test]
  fn shows_missing_statements_for_a_slot() {
    let graph: HashMap<String, String> = [(
      "entry.pc".to_string(),
      "
        <div component as=\"Test\">
          {a && <div />}
        </div>

        <Test />
      "
      .to_string(),
    )]
    .iter()
    .cloned()
    .collect();
    assert_graph_report(
      graph,
      CoverageReport {
        files: vec![FileReport {
          uri: "entry.pc".to_string(),
          missing_statement_ranges: vec![base_ast::Range::new(
            U16Position::new(51, 3, 17),
            U16Position::new(58, 3, 24),
          )],
          statement_coverage: 0,
        }],
      },
    );
  }

  #[test]
  fn shows_other_script_expressions_as_covered() {
    let graph: HashMap<String, String> = [(
      "entry.pc".to_string(),
      "
        <div component as=\"Test\">
          {1}
          {a || <div />}
          {(true)}
          {\"a\"}
          {!true}
        </div>

        <Test />
      "
      .to_string(),
    )]
    .iter()
    .cloned()
    .collect();
    assert_graph_report(
      graph,
      CoverageReport {
        files: vec![FileReport {
          uri: "entry.pc".to_string(),
          missing_statement_ranges: vec![],
          statement_coverage: 0,
        }],
      },
    );
  }

  #[test]
  fn shows_element_as_covered_if_variant_provided() {
    let graph: HashMap<String, String> = [(
      "entry.pc".to_string(),
      "
        <div component as=\"Test\">
          {a && <div />}
        </div>

        <Test />
        <Test a />
      "
      .to_string(),
    )]
    .iter()
    .cloned()
    .collect();
    assert_graph_report(
      graph,
      CoverageReport {
        files: vec![FileReport {
          uri: "entry.pc".to_string(),
          missing_statement_ranges: vec![],
          statement_coverage: 0,
        }],
      },
    );
  }

  #[test]
  fn variant_class_names_that_arent_used_are_shown_as_missing() {
    let graph: HashMap<String, String> = [(
      "entry.pc".to_string(),
      "
        <div export component as=\"Test\" class:test=\"test\">
        </div>

        <Test test />
      "
      .to_string(),
    )]
    .iter()
    .cloned()
    .collect();
    assert_graph_report(
      graph,
      CoverageReport {
        files: vec![FileReport {
          uri: "entry.pc".to_string(),
          missing_statement_ranges: vec![],
          statement_coverage: 1,
        }],
      },
    );
  }

  #[test]
  fn shows_style_as_covered() {
    // let graph: HashMap<String, String> = [
    //   ("entry.pc".to_string(), "
    //     <style>
    //       div {
    //         color: blue;
    //       }
    //     </style>
    //     <div />
    //   ".to_string())
    // ].iter().cloned().collect();
    // assert_graph_report(graph, CoverageReport {
    //   files: vec![
    //     FileReport {
    //       uri: "entry.pc".to_string(),
    //       missing_statement_ranges: vec![
    //       ],
    //       statement_coverage: 0
    //     }
    //   ]
    // });
  }

  fn assert_graph_report(graph: HashMap<String, String>, report: CoverageReport) {
    let mut engine = create_mock_engine(&graph);
    open_all_entries(&graph, &mut engine);
    assert_eq!(block_on(engine.generate_coverage_report()), Ok(report));
  }
}
