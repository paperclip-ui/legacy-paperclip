import { DetectChangesResult } from "../snapshots";
import { writeHTMLReport } from "./html";
import { writeConsoleReport } from "./stdout";

export type WriteChangesOptions = {
  html?: boolean;
};

export const writeReport = async (
  changes: DetectChangesResult,
  options: WriteChangesOptions
) => {
  await writeConsoleReport(changes);
  if (options.html) {
    await writeHTMLReport(changes);
  }
};
