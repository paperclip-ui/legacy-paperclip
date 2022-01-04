import { DetectChangesResult } from "../snapshots";
import { writeHTMLReport, WriteHTMLReportOptions } from "./html";
import { writeConsoleReport } from "./stdout";

export type WriteChangesOptions = {
  html?: boolean;
};

export const writeReport = async (
  changes: WriteHTMLReportOptions,
  options: WriteChangesOptions
) => {
  await writeConsoleReport(changes);
  if (options.html) {
    await writeHTMLReport(changes);
  }
};
