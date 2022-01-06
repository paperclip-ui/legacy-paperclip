import { CoverageReport, FileReport } from "@paperclipui/utils";
import * as fs from "fs";
import * as URL from "url";

export enum TreeReportKind {
  Directory,
  File
}

export type CoverageInfo = {
  total: number;
  count: number;
};

type BaseReport<TKind extends TreeReportKind> = {
  kind: TKind;
  path: string[];
  css: CoverageInfo;
  html: CoverageInfo;
  lines: CoverageInfo;
};

export type TreeDirectoryReport = {
  children: Record<string, TreeReport>;
} & BaseReport<TreeReportKind.Directory>;

export type TreeFileReport = {
  report: FileReport;
  content: string;
} & BaseReport<TreeReportKind.File>;

export type TreeReport = TreeFileReport | TreeDirectoryReport;

export const convertReportToTree = (report: CoverageReport, cwd: string) => {
  const root: TreeDirectoryReport = {
    kind: TreeReportKind.Directory,
    path: [],
    css: { count: 0, total: 0 },
    html: { count: 0, total: 0 },
    lines: { count: 0, total: 0 },
    children: {}
  };

  for (const file of report.files) {
    const filePath = URL.fileURLToPath(file.uri);
    const relativePath = filePath.replace(cwd, "");
    const path = relativePath.split("/").filter(Boolean);
    let current: TreeDirectoryReport = root;
    for (let i = 0, { length } = path; i < length - 1; i++) {
      const part = path[i];
      current = (current.children[part] ||
        (current.children[part] = createDirectoryReport(
          path.slice(0, i + 1)
        ))) as TreeDirectoryReport;
    }

    current.children[path[path.length - 1]] = createFileReport(
      path,
      file,
      fs.readFileSync(filePath, "utf-8")
    );
  }

  return generateSummary(root);
};

const generateSummary = (tree: TreeReport): TreeReport => {
  let base = {
    ...tree,
    css: calcCoverage(flattenReports(tree).map(report => report.css)),
    html: calcCoverage(flattenReports(tree).map(report => report.html)),
    lines: calcCoverage(flattenReports(tree).map(report => report.lines))
  };

  if (base.kind === TreeReportKind.Directory) {
    base = {
      ...base,
      children: Object.entries(base.children).reduce((dict, [part, child]) => {
        dict[part] = generateSummary(child);
        return dict;
      }, {})
    };
  }

  return base;
};

const flattenReports = (tree: TreeReport): TreeFileReport[] => {
  if (tree.kind === TreeReportKind.Directory) {
    const files: TreeFileReport[] = [];
    for (const part in tree.children) {
      const report = tree.children[part];
      if (report.kind === TreeReportKind.File) {
        files.push(report);
      } else {
        files.push(...flattenReports(report));
      }
    }
    return files;
  } else {
    return [tree];
  }
};

const calcCoverage = (coverages: CoverageInfo[]) => {
  return {
    count: coverages.reduce((sum, v) => sum + v.count, 0),
    total: coverages.reduce((sum, v) => sum + v.total, 0)
  };
};

const createDirectoryReport = (path: string[]): TreeDirectoryReport => ({
  kind: TreeReportKind.Directory,
  path,
  css: { count: 0, total: 0 },
  html: { count: 0, total: 0 },
  lines: { count: 0, total: 0 },
  children: {}
});

const createFileReport = (
  path: string[],
  report: FileReport,
  content: string
): TreeFileReport => ({
  kind: TreeReportKind.File,
  path,
  report,
  css: {
    total: report.css.count,
    count: report.css.count - report.css.missingRanges.length
  },
  html: {
    total: report.html.count,
    count: report.html.count - report.html.missingRanges.length
  },
  lines: {
    total: report.lineCount,
    count: report.lineCount - report.missingLines.length
  },
  content
});
