import { StringRange } from "../base/ast";

export type CoverageReport = {
  files: FileReport[];
};

export type FileReport = {
  uri: string;
  missingStatementRanges: StringRange[];
  missingLines: number[];
  lineCount: number;
  statementCount: number;
};
