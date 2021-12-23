import { ExprSource, ExprTextSource } from "../base/virt";
import { EngineError } from "./errors";

export enum LintWarningKind {}

export enum DiagnosticKind {
  EngineError = "EngineError",
  LintWarning = "LintWarning"
}

export type BaseDiagnostic<TKind extends DiagnosticKind> = {
  diagnosticKind: TKind;
};

export type DiagnosticEngineError = EngineError &
  BaseDiagnostic<DiagnosticKind.EngineError>;
export type DiagnosticLintWarning = {
  warningKind: LintWarningKind;
  message: string;
  source: ExprSource;
} & BaseDiagnostic<DiagnosticKind.LintWarning>;

export type Diagnostic = DiagnosticEngineError | DiagnosticLintWarning;
