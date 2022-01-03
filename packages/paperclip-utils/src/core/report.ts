import { StringRange } from "../base/ast";

export type CoverageReport = {
  files: FileReport[];
};

export type ExpressionReport = {
  missingRanges: StringRange[];
  count: number;
};

export type FileReport = {
  uri: string;
  css: ExpressionReport;
  html: ExpressionReport;
  missingLines: number[];
  lineCount: number;
  cssCount: number;
  htmlCount: number;
};
