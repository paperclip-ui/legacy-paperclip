import { CoverageReport } from "paperclip-utils";

export type GenerateCoverageHTML = {
  output: string;
  cwd: string;
};

export const generateCoverageHTML = (
  report: CoverageReport,
  options: GenerateCoverageHTML
) => {};
