import { CoverageReport } from "paperclip-utils";
import { StringRange } from "paperclip-utils";
import * as fsa from "fs-extra";
import * as path from "path";
import * as reportStyles from "./ui/report.pc";
import * as pageStyles from "./ui/page.pc";
import { kebabCase } from "lodash";
import { Html5Entities } from "html-entities";
import {
  convertReportToTree,
  TreeDirectoryReport,
  TreeFileReport,
  TreeReport,
  TreeReportKind
} from "../../state";

const entities = new Html5Entities();

const OK_THRESHOLD = 90;
const POOR_THRESHOLD = 60;

export type GenerateCoverageHTML = {
  output: string;
  cwd: string;
};

export const writeCoverageHTML = (
  report: CoverageReport,
  options: GenerateCoverageHTML
) => {
  const files = generateCoverageHTML(report, options);
  for (const filePath in files) {
    fsa.mkdirpSync(path.dirname(filePath));
    fsa.writeFileSync(filePath, files[filePath]);
  }
  return files;
};

const generateCoverageHTML = (
  report: CoverageReport,
  options: GenerateCoverageHTML
) => {
  const tree = convertReportToTree(report, options.cwd);
  const files = generateReportPages(tree, options);
  files[path.join(options.output, "main.css")] = fsa.readFileSync(
    __dirname + "/../../assets/main.css",
    "utf-8"
  );

  return files;
};

const generateReportPages = (
  tree: TreeReport,
  options: GenerateCoverageHTML,
  pages: Record<string, string> = {}
) => {
  pages[path.join(options.output, getHTMLPathName(tree.path))] = generateReport(
    tree,
    options
  );
  if (tree.kind === TreeReportKind.Directory) {
    for (const child in tree.children) {
      generateReportPages(tree.children[child], options, pages);
    }
  }
  return pages;
};

const generateReport = (report: TreeReport, options: GenerateCoverageHTML) => {
  if (report.kind === TreeReportKind.Directory) {
    return generateDirectoryReport(report, options);
  } else {
    return generateFileReport(report, options);
  }
};

const getHTMLPathName = (path: string[]) =>
  path.map(kebabCase).join("/") + "/index.html";

const generateCoverageOuter = (
  report: TreeReport,
  options: GenerateCoverageHTML,
  children: string
) => {
  const statementsPerc = perc(
    report.statements.count / report.statements.total
  );
  const linesPerc = perc(report.lines.count / report.lines.total);
  return pageStyles.default({
    head: generateHead(report, options),
    children: reportStyles.Report({
      title: "Coverage Report",
      ...colorCodeProps(Math.min(linesPerc, statementsPerc)),
      coverage: [
        reportStyles.CoverageInfo({
          title: "Statements",
          percentage: statementsPerc,
          coveredCount: report.statements.count,
          totalCount: report.statements.total
        }),
        reportStyles.CoverageInfo({
          title: "Lines",
          percentage: linesPerc,
          coveredCount: report.lines.count,
          totalCount: report.lines.total
        })
      ],
      breadcrumbs: reportStyles.Breadcrumbs({
        children: (report.path.length
          ? [path.basename(options.output), ...report.path]
          : []
        )
          .map((part, i, ary) => {
            let href;

            const length = ary.length - i - 1;

            if (length) {
              href =
                Array.from({ length })
                  .map(v => "..")
                  .join("/") + "/index.html";
            }

            return reportStyles.Breadcrumb({
              href,
              children: part
            });
          })
          .join("\n")
      }),
      children
    })
  });
};

const generateDirectoryReport = (
  report: TreeDirectoryReport,
  options: GenerateCoverageHTML
) => {
  return generateCoverageOuter(
    report,
    options,
    reportStyles.Table({
      children: [
        reportStyles.Row({
          header: true,
          children: [
            reportStyles.Cell({ children: "file" }),
            reportStyles.Cell({ children: "Statements" }),
            reportStyles.Cell({ children: "Lines" })
          ]
        }),
        ...Object.entries(report.children).map(([key, child]) => {
          const statementPercentage = perc(
            child.statements.count / child.statements.total
          );
          const linePercentage = perc(child.lines.count / child.lines.total);

          const relativePath = [child.path[child.path.length - 1]];

          return reportStyles.Row({
            children: [
              reportStyles.FileCell({
                href: getHTMLPathName(relativePath),
                children: relativePath.join("/"),
                percentage: linePercentage
              }),
              reportStyles.PercentCell({
                percentage: statementPercentage,
                ...colorCodeProps(statementPercentage),
                coveredCount: child.statements.count,
                totalCount: child.statements.total
              }),
              reportStyles.PercentCell({
                percentage: linePercentage,
                ...colorCodeProps(linePercentage),
                coveredCount: child.lines.count,
                totalCount: child.lines.total
              })
            ]
          });
        })
      ]
    })
  );
};

const perc = (value: number) => Math.floor(value * 100);

const colorCodeProps = (percentage: number) => {
  const props = { okay: false, poor: false, good: false };

  if (percentage < OK_THRESHOLD) {
    props.okay = true;
  } else if (percentage < POOR_THRESHOLD) {
    props.poor = true;
  } else {
    props.good = true;
  }

  return props;
};

const generateFileReport = (
  report: TreeFileReport,
  options: GenerateCoverageHTML
) => {
  return generateCoverageOuter(
    report,
    options,
    reportStyles.FileReportContent({
      children: report.content.split("\n").map((line, i) => {
        const poor = lineIsInRange(i + 1, report.report.missingStatementRanges);
        return reportStyles.Line({
          number: i + 1,
          poor,
          good: !poor,
          children:
            entities.encode(line).replace(/\s/g, "&nbsp;&nbsp;") + "<br />"
        });
      })
    })
  );
};

const lineIsInRange = (i, ranges: StringRange[]) => {
  for (const range of ranges) {
    if (i >= range.start.line && i <= range.end.line) {
      return true;
    }
  }
  return false;
};

const generateHead = (report: TreeReport, options: GenerateCoverageHTML) => {
  return `
    <link rel="stylesheet" href="${path.relative(
      [...report.path].join("/"),
      "."
    ) || "."}/main.css" />
  `;
};
