import { CoverageReport } from "paperclip-utils";

export const printCoverage = (report: CoverageReport) => {
  console.log(JSON.stringify(report, null, 2));
};
