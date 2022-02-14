use crate::base::ast::Range;
use crate::css::ast as css_ast;
use crate::pc::ast as pc_ast;
use crate::script::ast as script_ast;
use serde::Serialize;

pub trait ExprVisitor<'a> {
  fn visit_node(&mut self, node: &'a pc_ast::Node);
  fn visit_attr(&mut self, node: &'a pc_ast::Attribute);
  fn visit_str(&mut self, node: &'a StringLiteral);
  fn visit_css_rule(&mut self, rule: &'a css_ast::Rule);
  fn visit_css_sheet(&mut self, rule: &'a css_ast::Sheet);
  fn visit_css_decl(&mut self, rule: &'a css_ast::Declaration);
  fn visit_script_expression(&mut self, rule: &'a script_ast::Expression);
  fn should_continue(&self) -> bool;
}

pub fn walk_exprs<'a, TExpr: Expr>(exprs: &'a Vec<TExpr>, visitor: &mut ExprVisitor<'a>) {
  for expr in exprs {
    expr.walk(visitor);
    if !visitor.should_continue() {
      break;
    }
  }
}

pub trait Expr: std::fmt::Debug {
  fn walk<'a>(&'a self, visitor: &mut ExprVisitor<'a>);
  fn get_id<'a>(&'a self) -> &'a String;
  fn wrap<'a>(&'a self) -> pc_ast::Expression<'a>;
}

pub fn find_expr_by_id<'a>(target_id: String, ast: &'a Expr) -> Option<pc_ast::Expression<'a>> {
  ExprByIdFinder::find(target_id, ast)
}

struct ExprByIdFinder<'a> {
  target_id: String,
  found_expr: Option<pc_ast::Expression<'a>>,
}

impl<'a> ExprByIdFinder<'a> {
  fn new(target_id: String) -> ExprByIdFinder<'a> {
    ExprByIdFinder {
      target_id,
      found_expr: None,
    }
  }
  fn find(target_id: String, ast: &'a Expr) -> Option<pc_ast::Expression<'a>> {
    let mut visitor = ExprByIdFinder::new(target_id);
    ast.walk(&mut visitor);
    visitor.found_expr
  }

  pub fn visit_core_expr(&mut self, expr: &'a Expr) {
    if expr.get_id() == &self.target_id {
      self.found_expr = Some(expr.wrap());
    }
  }
}

impl<'a> ExprVisitor<'a> for ExprByIdFinder<'a> {
  fn visit_node(&mut self, expr: &'a pc_ast::Node) {
    self.visit_core_expr(expr);
  }
  fn visit_attr(&mut self, expr: &'a pc_ast::Attribute) {
    self.visit_core_expr(expr);
  }
  fn visit_str(&mut self, expr: &'a StringLiteral) {
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
    return self.found_expr == None;
  }
}

pub enum CoreExpression {
  StringLiteral(StringLiteral),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StringLiteral {
  pub id: String,
  pub value: String,
  pub range: Range,
}

impl Expr for StringLiteral {
  fn walk<'a>(&'a self, visitor: &mut ExprVisitor<'a>) {
    visitor.visit_str(self);
  }
  fn get_id<'a>(&'a self) -> &'a String {
    &self.id
  }
  fn wrap<'a>(&'a self) -> pc_ast::Expression<'a> {
    pc_ast::Expression::String(self)
  }
}
