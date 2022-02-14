use crate::base::ast as base_ast;
use crate::core::ast as core_ast;
use crate::core::ast::{Expr, ExprVisitor};
use crate::core::eval::DependencyEvalInfo;
use crate::core::graph::{Dependency, DependencyContent, DependencyGraph};
use crate::core::vfs::VirtualFileSystem;
use crate::css::ast as css_ast;
use crate::css::runtime::evaluator as css_eval;
use crate::pc::ast as pc_ast;
use crate::pc::runtime::evaluator as pc_eval;
use crate::pc::runtime::inspect_node_styles::{inspect_node_styles, InspectionOptions};
use crate::pc::runtime::virt as pc_virt;
use crate::script::ast as script_ast;
use futures::future::{join_all, BoxFuture};
use serde::Serialize;
use std::collections::hash_map::Entry;
use std::collections::{BTreeMap, HashMap, HashSet};
use std::io::{BufRead, Cursor};

#[derive(Debug, PartialEq, Serialize)]
struct CoverageSummary {
  // 0 <> 100
  statements: u32,

  // 0 <> 100
  lines: u32,
}

#[derive(Clone, Hash, Debug, Eq, PartialEq)]
enum ExprIdKind {
  CSS,
  HTML,
}

#[derive(Clone, Debug, PartialEq)]
struct ExprIdInfo {
  source_uri: String,
  kind: ExprIdKind,
}

#[derive(Debug, PartialEq, Serialize)]
pub struct CoverageReport {
  files: Vec<FileReport>,
}

#[derive(Clone, Debug, PartialEq, Serialize)]
pub struct PartReport {
  #[serde(rename = "missingRanges")]
  missing_ranges: Vec<base_ast::Range>,
  count: u32,
}

struct ExprCounts {
  css: u32,
  html: u32,
}

#[derive(Debug, PartialEq, Serialize)]
struct FileReport {
  uri: String,

  css: PartReport,
  html: PartReport,

  #[serde(rename = "missingLines")]
  missing_lines: HashSet<u32>,

  #[serde(rename = "lineCount")]
  line_count: u32,
}

struct Source<'a> {
  graph: &'a DependencyGraph,
  evaluated: &'a BTreeMap<String, DependencyEvalInfo>,
}

struct AnalyzeContext<'a> {
  pub evaluated: &'a BTreeMap<String, DependencyEvalInfo>,
  pub missed_ids: HashMap<String, ExprIdInfo>,
  pub graph: &'a DependencyGraph,
}

pub async fn generate_coverage_report(
  graph: &DependencyGraph,
  evaluated: &BTreeMap<String, DependencyEvalInfo>,
  vfs: &mut VirtualFileSystem,
) -> CoverageReport {
  let source: Source = Source { graph, evaluated };

  let coverable_expr_ids = get_coverable_expr_ids(&source);
  let expr_counts = count_exprs(&coverable_expr_ids);

  let mut analyze_context = AnalyzeContext {
    missed_ids: coverable_expr_ids,
    evaluated,
    graph,
  };

  analyze_graph(&mut analyze_context);

  CoverageReport {
    files: generate_file_reports(&analyze_context.missed_ids, &expr_counts, graph, vfs).await,
  }
}

fn count_exprs(expr_ids: &HashMap<String, ExprIdInfo>) -> HashMap<String, ExprCounts> {
  let mut expr_counts: HashMap<String, ExprCounts> = HashMap::new();

  for (id, info) in expr_ids {
    let mut counts = match expr_counts.entry(info.source_uri.to_string()) {
      Entry::Occupied(e) => e.into_mut(),
      Entry::Vacant(e) => e.insert(ExprCounts { css: 0, html: 0 }),
    };

    match info.kind {
      ExprIdKind::CSS => counts.css = counts.css + 1,
      ExprIdKind::HTML => counts.html = counts.html + 1,
    }
  }

  expr_counts
}

async fn generate_file_reports(
  missed_ids: &HashMap<String, ExprIdInfo>,
  expr_counts: &HashMap<String, ExprCounts>,
  graph: &DependencyGraph,
  vfs: &mut VirtualFileSystem,
) -> Vec<FileReport> {
  let mut reports: Vec<BoxFuture<_>> = vec![];

  let mut file_expr_id_map: HashMap<String, HashMap<String, ExprIdInfo>> = HashMap::new();

  for (id, info) in missed_ids {
    if let Some(file_ids) = file_expr_id_map.get_mut(&info.source_uri) {
      file_ids.insert(id.to_string(), info.clone());
    } else {
      let mut ids = HashMap::new();
      ids.insert(id.to_string(), info.clone());
      file_expr_id_map.insert(info.source_uri.to_string(), ids);
    }
  }

  let mut contents: HashMap<String, String> = HashMap::new();

  for (uri, _) in &graph.dependencies {
    contents.insert(uri.to_string(), vfs.load(uri).await.unwrap().to_string());
  }

  for (uri, dep) in &graph.dependencies {
    reports.push(Box::pin(generate_file_report(
      &uri,
      contents.remove(uri).unwrap(),
      dep,
      expr_counts.get(uri).unwrap(),
      file_expr_id_map.remove(uri).unwrap_or(HashMap::new()),
    )));
  }

  join_all(reports).await
}

async fn generate_file_report(
  uri: &String,
  content: String,
  dep: &Dependency,
  counts: &ExprCounts,
  missing_ids: HashMap<String, ExprIdInfo>,
) -> FileReport {
  let mut missing_parts: HashMap<ExprIdKind, PartReport> = HashMap::new();
  let mut missing_statement_ranges: Vec<base_ast::Range> = vec![];

  missing_parts.insert(
    ExprIdKind::HTML,
    PartReport {
      count: counts.html,
      missing_ranges: vec![],
    },
  );
  missing_parts.insert(
    ExprIdKind::CSS,
    PartReport {
      count: counts.css,
      missing_ranges: vec![],
    },
  );

  for (id, info) in &missing_ids {
    if let Some(expr) = dep.get_expression_by_id(id) {
      if let Some(part_report) = missing_parts.get_mut(&info.kind) {
        part_report.missing_ranges.push(expr.get_range().clone());
        missing_statement_ranges.push(expr.get_range().clone());
      }
    } else {
      panic!("Expr ID not found");
    }
  }

  let line_count = count_lines(&content);

  FileReport {
    uri: uri.to_string(),
    missing_lines: calc_missed_lines(&missing_statement_ranges),
    line_count,
    css: missing_parts
      .get(&ExprIdKind::CSS)
      .unwrap_or(&PartReport {
        count: 0,
        missing_ranges: vec![],
      })
      .clone(),
    html: missing_parts
      .get(&ExprIdKind::HTML)
      .unwrap_or(&PartReport {
        count: 0,
        missing_ranges: vec![],
      })
      .clone(),
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
    lc = lc + 1;
  }
  lc
}

fn get_coverable_expr_ids(source: &Source) -> HashMap<String, ExprIdInfo> {
  let mut missed: HashMap<String, ExprIdInfo> = HashMap::new();

  for (uri, dep) in &source.graph.dependencies {
    for (id, kind) in get_missed_file_expr_ids(dep) {
      missed.insert(
        id.to_string(),
        ExprIdInfo {
          source_uri: uri.to_string(),
          kind,
        },
      );
    }
  }

  missed
}

fn get_missed_file_expr_ids(dep: &Dependency) -> HashMap<String, ExprIdKind> {
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

fn analyze_css_content(
  _uri: &String,
  _content: &css_eval::EvalInfo,
  _context: &mut AnalyzeContext,
) {
}

fn analyze_pc_content(uri: &String, content: &pc_eval::EvalInfo, context: &mut AnalyzeContext) {
  // first, remove all PC expressions that have been used. This includes scripts, and HTML
  if let Some(used_expr_ids) = &content.used_expr_ids {
    for used_id in used_expr_ids {
      context.missed_ids.remove(used_id);
    }
  }

  analayze_node_styles(uri, &content.preview, &vec![], context);
}

fn analayze_node_styles(
  uri: &String,
  node: &pc_virt::Node,
  path: &Vec<usize>,
  context: &mut AnalyzeContext,
) {
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
  let inspection = inspect_node_styles(
    path,
    uri,
    context.evaluated,
    &context.graph,
    &InspectionOptions {
      screen_width: None,

      // omit things like font-family and such. We just want rules that are
      // attached to the target node
      include_inherited: false,
    },
  );

  for rule in inspection.style_rules {
    context.missed_ids.remove(&rule.source_id);
  }
}

struct ExprIdCollector {
  pub expr_ids: HashMap<String, ExprIdKind>,
}

impl ExprIdCollector {
  fn visit_core_expr<'a>(&'a mut self, expr: &'a dyn Expr, kind: ExprIdKind) {
    self.expr_ids.insert(expr.get_id().to_string(), kind);
  }
  fn collect_expr_ids(expr: &dyn Expr) -> HashMap<String, ExprIdKind> {
    let mut collector = ExprIdCollector {
      expr_ids: HashMap::new(),
    };

    expr.walk(&mut collector);

    collector.expr_ids
  }
}

impl<'a> ExprVisitor<'a> for ExprIdCollector {
  fn visit_node(&mut self, expr: &'a pc_ast::Node) {
    match expr {
      pc_ast::Node::Comment(_) => {}
      _ => {
        self.visit_core_expr(expr, ExprIdKind::HTML);
      }
    };
  }

  fn visit_attr(&mut self, expr: &'a pc_ast::Attribute) {
    let attr_name = match expr {
      pc_ast::Attribute::KeyValueAttribute(kv) => kv.name.to_string(),
      pc_ast::Attribute::PropertyBoundAttribute(kv) => kv.name.to_string(),
      pc_ast::Attribute::ShorthandAttribute(kv) => kv.reference.to_string(),
      pc_ast::Attribute::SpreadAttribute(kv) => kv.script.to_string(),
    };

    // skip event handlers. This is a dirty approach
    if attr_name.starts_with("on") {
      return;
    }

    self.visit_core_expr(expr, ExprIdKind::HTML);
  }

  fn visit_css_rule(&mut self, expr: &'a css_ast::Rule) {
    match expr {
      css_ast::Rule::Style(_) => {
        self.visit_core_expr(expr, ExprIdKind::CSS);
      }
      _ => {}
    }
  }

  fn visit_css_decl(&mut self, _expr: &'a css_ast::Declaration) {
    // noop
  }

  fn visit_css_sheet(&mut self, _expr: &'a css_ast::Sheet) {
    // noop
  }

  fn visit_str(&mut self, _expr: &'a core_ast::StringLiteral) {
    // noop
  }

  fn visit_script_expression(&mut self, expr: &'a script_ast::Expression) {
    self.visit_core_expr(expr, ExprIdKind::HTML);
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
  use std::iter::FromIterator;

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
          css: PartReport {
            count: 0,
            missing_ranges: vec![],
          },
          html: PartReport {
            count: 2,
            missing_ranges: vec![],
          },
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
          missing_lines: HashSet::from_iter(vec![].iter().cloned()),
          line_count: 7,
          css: PartReport {
            count: 0,
            missing_ranges: vec![],
          },
          html: PartReport {
            count: 7,
            missing_ranges: vec![],
          },
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
          css: PartReport {
            count: 0,
            missing_ranges: vec![],
          },
          html: PartReport {
            count: 9,
            missing_ranges: vec![base_ast::Range::new(
              U16Position::new(51, 3, 17),
              U16Position::new(58, 3, 24),
            )],
          },
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
          missing_lines: HashSet::from_iter(vec![].iter().cloned()),
          line_count: 11,
          css: PartReport {
            count: 0,
            missing_ranges: vec![],
          },
          html: PartReport {
            count: 18,
            missing_ranges: vec![],
          },
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
          missing_lines: HashSet::from_iter(vec![].iter().cloned()),
          line_count: 8,
          css: PartReport {
            count: 0,
            missing_ranges: vec![],
          },
          html: PartReport {
            count: 11,
            missing_ranges: vec![],
          },
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
          missing_lines: HashSet::from_iter(vec![2].iter().cloned()),
          line_count: 6,
          html: PartReport {
            count: 7,
            missing_ranges: vec![base_ast::Range {
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
          },
          css: PartReport {
            count: 0,
            missing_ranges: vec![],
          },
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
          missing_lines: HashSet::from_iter(vec![].iter().cloned()),
          line_count: 6,
          html: PartReport {
            count: 8,
            missing_ranges: vec![],
          },
          css: PartReport {
            count: 0,
            missing_ranges: vec![],
          },
        }],
      },
    );
  }

  #[test]
  fn shows_style_as_covered() {
    let graph: HashMap<String, String> = [(
      "entry.pc".to_string(),
      "
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
          missing_lines: HashSet::from_iter(vec![].iter().cloned()),
          line_count: 13,
          html: PartReport {
            count: 3,
            missing_ranges: vec![],
          },
          css: PartReport {
            count: 2,
            missing_ranges: vec![],
          },
        }],
      },
    );
  }

  #[test]
  fn shows_style_as_not_covered_if_not_applied() {
    let graph: HashMap<String, String> = [(
      "entry.pc".to_string(),
      "
        <style>
          span {
            color: blue;
          }
        </style>
        <div />
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
          missing_lines: HashSet::from_iter(vec![4, 6, 3, 5].iter().cloned()),
          line_count: 8,
          css: PartReport {
            count: 1,
            missing_ranges: vec![base_ast::Range {
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
            }],
          },
          html: PartReport {
            count: 3,
            missing_ranges: vec![],
          },
        }],
      },
    );
  }

  #[test]
  fn shows_external_file_as_covered() {
    let graph: HashMap<String, String> = [
      (
        "entry.pc".to_string(),
        "
        <import src=\"atoms.pc\" inject-styles />
        <span />
      "
        .to_string(),
      ),
      (
        "atoms.pc".to_string(),
        "
        <style>
          @export {
            span {
              color: blue;
            }
            div {

            }
          }
        </style>
      "
        .to_string(),
      ),
    ]
    .iter()
    .cloned()
    .collect();
    assert_graph_report(
      graph,
      CoverageReport {
        files: vec![
          FileReport {
            uri: "atoms.pc".to_string(),
            missing_lines: HashSet::from_iter(vec![7, 8, 9, 10].iter().cloned()),
            line_count: 12,
            css: PartReport {
              count: 2,
              missing_ranges: vec![base_ast::Range {
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
              }],
            },
            html: PartReport {
              count: 2,
              missing_ranges: vec![],
            },
          },
          FileReport {
            uri: "entry.pc".to_string(),
            missing_lines: HashSet::from_iter(vec![].iter().cloned()),
            line_count: 4,
            css: PartReport {
              count: 0,
              missing_ranges: vec![],
            },
            html: PartReport {
              count: 5,
              missing_ranges: vec![],
            },
          },
        ],
      },
    );
  }

  #[test]
  fn shows_instances_of_instances_covered() {
    let graph: HashMap<String, String> = [(
      "entry.pc".to_string(),
      "

        <!-- 
          @frame { visible: false }
        -->
        <div component as=\"Test\">

        </div>

        <!-- 
          @frame { visible: false }
        -->
        <Test export component as=\"Test2\" {a?}>

        </Test>
        <Test2 a />
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
          missing_lines: HashSet::from_iter(vec![].iter().cloned()),
          line_count: 17,
          html: PartReport {
            count: 12,
            missing_ranges: vec![],
          },
          css: PartReport {
            count: 0,
            missing_ranges: vec![],
          },
        }],
      },
    );
  }

  fn assert_graph_report(graph: HashMap<String, String>, report: CoverageReport) {
    let mut engine = create_mock_engine(&graph);
    open_all_entries(&graph, &mut engine);
    assert_eq!(block_on(engine.generate_coverage_report()), Ok(report));
  }
}
