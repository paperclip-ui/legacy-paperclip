export type ReportSummary = {
  files: FileReport[];
};

export type FileReport = {
  filePath: string;
  missedLines: number[];
  lineCount: number;
};
