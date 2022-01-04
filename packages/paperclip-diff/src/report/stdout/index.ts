const chalk = require("chalk");
import { DetectChangesResult } from "../../snapshots";
import { getChanges, getDiffFrame } from "../../state";
import { logWarn } from "../../utils";

export const writeConsoleReport = async ({
  currentVersion,
  deltaVersion,
  manifest
}: DetectChangesResult) => {
  const changes = getChanges(currentVersion, deltaVersion, manifest);
  for (const change of changes) {
    if (change.changeCount) {
      const frame = getDiffFrame(change, manifest);
      logWarn(
        `Change detected in ${chalk.bold(
          `${frame.sourceFilePath} : ${frame.title}`
        )}`
      );
    }
  }
};
