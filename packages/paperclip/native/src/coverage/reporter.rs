use crate::base::ast as base_ast;
use crate::core::ast::{Expr, ExprVisitor};
use crate::core::eval::DependencyEvalInfo;
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph};
use crate::css::ast as css_ast;
use crate::css::runtime::evaluator as css_eval;
use crate::pc::ast as pc_ast;
use crate::pc::runtime::evaluator as pc_eval;
use crate::pc::runtime::inspect_node_styles::{inspect_node_styles, InspectionOptions};
use crate::pc::runtime::virt as pc_virt;
use crate::script::ast as script_ast;
use std::iter::FromIterator;
use std::io::{BufReader, Cursor, BufRead};
use crate::core::vfs::VirtualFileSystem;
use serde::Serialize;
use std::collections::{BTreeMap, HashMap, HashSet};


#[derive(Debug, PartialEq, Serialize)]
struct CoverageSummary {

  // 0 <> 100
  statements: u32,

  // 0 <> 100
  lines: u32
}

#[derive(Debug, PartialEq, Serialize)]
pub struct CoverageReport {
  files: Vec<FileReport>
}


#[derive(Debug, PartialEq, Serialize)]
struct FileReport {
  uri: String,

  #[serde(rename = "missingStatementRanges")]
  missing_statement_ranges: Vec<base_ast::Range>,

  #[serde(rename = "missingLines")]
  missing_lines: HashSet<u32>,

  #[serde(rename = "lineCount")]
  line_count: u32,

  #[serde(rename = "statementCount")]
  statement_count: u32
}

struct Source<'a> {
  graph: &'a DependencyGraph,
  evaluated: &'a BTreeMap<String, DependencyEvalInfo>,
}

struct AnalyzeContext<'a> {
  pub evaluated: &'a BTreeMap<String, DependencyEvalInfo>,
  pub missed_ids: HashMap<String, String>,
  pub graph: &'a DependencyGraph
}

pub async fn generate_coverage_report(
  graph: &DependencyGraph,
  evaluated: &BTreeMap<String, DependencyEvalInfo>,
  vfs: &mut VirtualFileSystem
) -> CoverageReport {
  let source: Source = Source { graph, evaluated };

  let coverable_expr_ids = get_coverable_expr_ids(&source);
  let statement_count = coverable_expr_ids.len();

  let mut analyze_context = AnalyzeContext {
    missed_ids: coverable_expr_ids,
    evaluated,
    graph,
  };

  analyze_graph(&mut analyze_context);

  CoverageReport {
    files: generate_file_reports(&analyze_context.missed_ids, statement_count as u32, graph, vfs).await
  }
}

async fn generate_file_reports(
  missed_ids: &HashMap<String, String>,
  statement_count: u32,
  graph: &DependencyGraph,
  vfs: &mut VirtualFileSystem
) -> Vec<FileReport> {
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
      statement_count,
      file_expr_id_map.get(uri).unwrap_or(&HashSet::new()),
      vfs
    ).await);
  }

  return reports;
}

async fn generate_file_report(
  uri: &String,
  dep: &Dependency,
  statement_count: u32,
  missing_ids: &HashSet<String>,
  vfs: &mut VirtualFileSystem
) -> FileReport {
  let mut missing_statement_ranges: Vec<base_ast::Range> = vec![];

  for id in missing_ids {
    if let Some(expr) = dep.get_expression_by_id(id) {
      missing_statement_ranges.push(expr.get_range().clone());
    } else {
      panic!("Expr ID not found");
    }
  }

  let line_count = count_lines(vfs.load(uri).await.unwrap());

  FileReport {
    uri: uri.to_string(),
    missing_lines: calc_missed_lines(&missing_statement_ranges),
    missing_statement_ranges,
    line_count,
    statement_count,
  }
}

fn calc_missed_lines(mised_statement_ranges: &Vec<base_ast::Range>) -> HashSet<u32> {

  let mut missed_lines: HashSet<u32> = HashSet::new();

  for range in mised_statement_ranges {
    for i in range.start.line..(range.end.line + 1) {
      missed_lines.insert(i as u32);
    }
  }

  

  missed_lines
}

fn count_lines(content: &String) -> u32 {
  let cursor = Cursor::new(content.as_bytes());
  let mut lc = 0;
  for _line in cursor.lines() {
    lc  = lc + 1;
  }
  lc
}


fn get_coverable_expr_ids(source: &Source) -> HashMap<String, String> {
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

fn analyze_css_content(_uri: &String, _content: &css_eval::EvalInfo, _context: &mut AnalyzeContext) {}

fn analyze_pc_content(uri: &String, content: &pc_eval::EvalInfo, context: &mut AnalyzeContext) {
  // first, remove all PC expressions that have been used. This includes scripts, and HTML
  if let Some(used_expr_ids) = &content.used_expr_ids {
    for used_id in used_expr_ids {
      context.missed_ids.remove(used_id);
    }
  }

  analayze_node_styles(uri, &content.preview, &vec![], context);
}

fn analayze_node_styles(uri: &String, node: &pc_virt::Node, path: &Vec<usize>, context: &mut AnalyzeContext) {
  if let pc_virt::Node::Element(element) = node {
    analayze_element_styles(uri, path, context);
  }

  if let Some(children) = node.get_children() {

    for (index, child) in children.iter().enumerate() {
      let mut child_path = path.clone();
      child_path.push(index);
      analayze_node_styles(uri, &child, &child_path, context);
    }
  }
}

fn analayze_element_styles(uri: &String, path: &Vec<usize>, context: &mut AnalyzeContext) {
  let inspection = inspect_node_styles(path, uri, context.evaluated, &context.graph, &InspectionOptions {
    screen_width: None,

    // omit things like font-family and such. We just want rules that are
    // attached to the target node
    include_inherited: false
  });

  for rule in inspection.style_rules {
    context.missed_ids.remove(&rule.source_id);
  }
}


struct ExprIdCollector {
  pub expr_ids: HashSet<String>,
}

impl ExprIdCollector {
  fn visit_core_expr<'a>(&'a mut self, expr: &'a dyn Expr) {
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
    match expr {
      css_ast::Rule::Style(_) => {
        self.visit_core_expr(expr);
      },
      _ => {}
    }
  }

  fn visit_css_decl(&mut self, _expr: &'a css_ast::Declaration) {
    // noop
  }

  fn visit_css_sheet(&mut self, _expr: &'a css_ast::Sheet) {
    // noop
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
          missing_lines: HashSet::from_iter(vec![].iter().cloned()),
          line_count: 1,
          statement_count: 2,
          missing_statement_ranges: vec![],
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
          missing_lines: HashSet::from_iter(vec![].iter().cloned()),
          line_count: 7,
          statement_count: 7,
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
          missing_lines: HashSet::from_iter(vec![3].iter().cloned()),
          line_count: 7,
          missing_statement_ranges: vec![base_ast::Range::new(
            U16Position::new(51, 3, 17),
            U16Position::new(58, 3, 24),
          )],
          statement_count: 9,
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
          missing_lines: HashSet::from_iter(vec![].iter().cloned()),
          line_count: 11,
          statement_count: 18,
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
          missing_lines: HashSet::from_iter(vec![].iter().cloned()),
          line_count: 8,
          statement_count: 11,
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
          statement_count: 7,
          missing_lines: HashSet::from_iter(vec![2].iter().cloned()),
          line_count: 6,
          missing_statement_ranges: vec![base_ast::Range {
            start: U16Position {
              pos: 41,
              line: 2,
              column: 41,
            },
            end: U16Position {
              pos: 58,
              line: 2,
              column: 58,
            },
          }],
        }],
      },
    );
  }

  #[test]
  fn variant_class_names_that_are_used_are_not_reported_as_missing() {
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
          missing_lines: HashSet::from_iter(vec![].iter().cloned()),
          line_count: 6,
          statement_count: 8,
        }],
      },
    );
  }

  #[test]
  fn shows_style_as_covered() {
    let graph: HashMap<String, String> = [
      ("entry.pc".to_string(), "
        <style>
          div {
            color: blue;
          }
          @export {
            * {
              background: red;
            }
          }
        </style>
        <div />
      ".to_string())
    ].iter().cloned().collect();
    assert_graph_report(graph, CoverageReport {
      files: vec![
        FileReport {
          uri: "entry.pc".to_string(),
          missing_statement_ranges: vec![
          ],
          missing_lines: HashSet::from_iter(vec![].iter().cloned()),
          line_count: 13,
          statement_count: 5,
        }
      ]
    });
  }

  #[test]
  fn shows_style_as_not_covered_if_not_applied() {
    let graph: HashMap<String, String> = [
      ("entry.pc".to_string(), "
        <style>
          span {
            color: blue;
          }
        </style>
        <div />
      ".to_string())
    ].iter().cloned().collect();
    assert_graph_report(graph, CoverageReport {
      files: vec![
        FileReport {
          uri: "entry.pc".to_string(),
          statement_count: 4,
          missing_lines: HashSet::from_iter(vec![4, 6, 3, 5].iter().cloned()),
          line_count: 8,
          missing_statement_ranges: vec![base_ast::Range {
            start: U16Position {
              pos: 27,
              line: 3,
              column: 11,
            },
            end: U16Position {
              pos: 79,
              line: 6,
              column: 9,
            },
          }]
        }
      ]
    });
  }

  #[test]
  fn shows_external_file_as_covered() {
    let graph: HashMap<String, String> = [
      ("entry.pc".to_string(), "
        <import src=\"atoms.pc\" inject-styles />
        <span />
      ".to_string()),
      ("atoms.pc".to_string(), "
        <style>
          @export {
            span {
              color: blue;
            }
            div {

            }
          }
        </style>
      ".to_string())
    ].iter().cloned().collect();
    assert_graph_report(graph, CoverageReport {
      files: vec![
        FileReport {
          uri: "atoms.pc".to_string(),
          missing_lines: HashSet::from_iter(vec![7, 8, 9, 10].iter().cloned()),
          line_count: 12,
          missing_statement_ranges: vec![
            base_ast::Range {
              start: U16Position {
                pos: 109,
                line: 7,
                column: 13,
              },
              end: U16Position {
                pos: 140,
                line: 10,
                column: 11,
              },
            }
          ],
          statement_count: 9,
        },
        FileReport {
          uri: "entry.pc".to_string(),
          statement_count: 9,
          missing_lines: HashSet::from_iter(vec![].iter().cloned()),
          line_count: 4,
          missing_statement_ranges: vec![],
        }
      ]
    });
  }

  fn assert_graph_report(graph: HashMap<String, String>, report: CoverageReport) {
    let mut engine = create_mock_engine(&graph);
    open_all_entries(&graph, &mut engine);
    assert_eq!(block_on(engine.generate_coverage_report()), Ok(report));
  }
}
