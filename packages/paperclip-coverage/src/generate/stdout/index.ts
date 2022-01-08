import * as Table from "cli-table";
import * as path from "path";
import * as URL from "url";
const chalk = require("chalk");
import { CoverageReport } from "@paperclip-ui/utils";
import { convertReportToTree } from "../../state";
import { OK_THRESHOLD, POOR_THRESHOLD } from "../../constants";

export const printCoverage = (report: CoverageReport, cwd: string) => {
  const tree = convertReportToTree(report, cwd);

  const table = new Table({
    head: ["File", "HTML", "CSS", "Lines"],
    colWidths: [80, 10, 10, 10],
    style: {
      head: ["bold", "cyan"]
    }
  });

  const totals = {
    lines: [0, 0],
    css: [0, 0],
    html: [0, 0]
  };

  for (const file of report.files) {
    const linePerc = calcPerc(file.missingLines.length, file.lineCount);
    const cssPerc = calcPerc(file.css.missingRanges.length, file.css.count);
    const htmlPerc = calcPerc(file.html.missingRanges.length, file.html.count);

    totals.css[0] += file.css.missingRanges.length;
    totals.css[1] += file.css.count;
    totals.html[0] += file.html.missingRanges.length;
    totals.html[1] += file.html.count;
    totals.lines[0] += file.missingLines.length;
    totals.lines[1] += file.lineCount;

    table.push([
      path.relative(cwd, URL.fileURLToPath(file.uri)),
      perc(htmlPerc),
      perc(cssPerc),
      perc(linePerc)
    ]);
  }

  table.push([
    chalk.bold.cyan("Summary"),
    perc(calcPerc(totals.html[0], totals.html[1])),
    perc(calcPerc(totals.css[0], totals.css[1])),
    perc(calcPerc(totals.lines[0], totals.lines[1]))
  ]);

  console.log(table.toString());
};

const calcPerc = (missing: number, total: number) => {
  if (total === 0) {
    return 100;
  }
  return Math.floor(((total - missing) / total) * 100);
};

const perc = (value: number) => {
  let str = `${value}%`;
  if (value < POOR_THRESHOLD) {
    str = chalk.red(str);
  } else if (value < OK_THRESHOLD) {
    str = chalk.yellow(str);
  } else {
    str = chalk.green(str);
  }
  return str;
};
