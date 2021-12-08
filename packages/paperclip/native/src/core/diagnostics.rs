/*

Diagnostics are error types for helping the user debug their program. Anything that consumes PC code should
report diagnostics. All other parts of the app can use regular error handling.
*/

use crate::base::ast::ExprTextSource;
use crate::base::ast::Range;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum DiagnosticLevel {
  Warning,
  Error,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct DiagnosticSourceInfo {
  // source where the error is. Might not exist
  #[serde(rename = "sourceId")]
  expression_id: String,

  // This may not exist if we're dealing with just the AST
  #[serde(rename = "textSource")]
  text_source: Option<ExprTextSource>,
}

impl DiagnosticSourceInfo {
  pub fn new<'a>(
    expression_id: &'a str,
    text_source: Option<&ExprTextSource>,
  ) -> DiagnosticSourceInfo {
    DiagnosticSourceInfo {
      expression_id: expression_id.to_string(),
      text_source: text_source.and_then(|text_source| Some(text_source.clone())),
    }
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct FileNotFoundInfo {
  uri: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum SyntaxDiagnosticInfoCode {
  Unknown,
  EndOfFile,
  Unexpected,
  Unterminated,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "syntaxDiagnosticInfoKind")]
pub struct SyntaxDiagnosticInfo {
  source: ExprTextSource,
  code: SyntaxDiagnosticInfoCode,
}

impl SyntaxDiagnosticInfo {
  pub fn new_error_dignostic<'a>(
    code: SyntaxDiagnosticInfoCode,
    message: &'a str,
    uri: &'a str,
    start: usize,
    end: usize,
  ) -> Diagnostic {
    Diagnostic::new_error(
      message,
      DiagnosticInfo::Syntax(SyntaxDiagnosticInfo {
        code,
        source: ExprTextSource::new(uri.to_string(), Range::new(start, end)),
      }),
    )
  }
  pub fn new_unexpected_token_error_diagnostic<'a>(uri: &'a str, start: usize) -> Diagnostic {
    SyntaxDiagnosticInfo::new_error_dignostic(
      SyntaxDiagnosticInfoCode::Unexpected,
      "Unexpected token",
      uri,
      start,
      start + 1,
    )
  }
  pub fn new_unknown_error_diagnostic<'a>(uri: &'a str) -> Diagnostic {
    SyntaxDiagnosticInfo::new_error_dignostic(
      SyntaxDiagnosticInfoCode::Unknown,
      "Unknown",
      uri,
      0,
      1,
    )
  }
  pub fn new_eof_error_diagnostic<'a>(uri: &'a str) -> Diagnostic {
    SyntaxDiagnosticInfo::new_error_dignostic(
      SyntaxDiagnosticInfoCode::Unknown,
      "End of file",
      uri,
      0,
      1,
    )
  }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ImportNotFoundInfo {
  source: ExprTextSource,
  link_uri: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum DiagnosticInfo {
  ImportNotFound(ImportNotFoundInfo),
  Syntax(SyntaxDiagnosticInfo),
  UnableToParseFile(DiagnosticSourceInfo),
  FileNotFound(FileNotFoundInfo),
  UnusedStyleRule(DiagnosticSourceInfo),
  CircularDependencyDetected(ExprTextSource),
  DependencyNotLoaded(ExprTextSource),
  IncorectFileType(ExprTextSource),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Diagnostic {
  // level of warning
  level: DiagnosticLevel,

  info: DiagnosticInfo,

  // message to the user
  message: String,
}

impl Diagnostic {
  pub fn new<'a>(message: &'a str, level: DiagnosticLevel, info: DiagnosticInfo) -> Diagnostic {
    Diagnostic {
      message: message.to_string(),
      level,
      info,
    }
  }
  pub fn new_warning<'a>(message: &'a str, info: DiagnosticInfo) -> Diagnostic {
    Diagnostic::new(message, DiagnosticLevel::Warning, info)
  }
  pub fn new_error<'a>(message: &'a str, info: DiagnosticInfo) -> Diagnostic {
    Diagnostic::new(message, DiagnosticLevel::Error, info)
  }
}
