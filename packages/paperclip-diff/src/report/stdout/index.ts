import { DetectChangesResult } from "../../snapshots";
import { getChanges, getDiffFrame } from "../../state";
import { logInfo } from "../../utils";

export const writeConsoleReport = async ({
  currentVersion,
  deltaVersion,
  manifest
}: DetectChangesResult) => {
  const changes = getChanges(currentVersion, deltaVersion, manifest);
  for (const change of changes) {
    if (change.changeCount) {
      const frame = getDiffFrame(change, manifest);
      logInfo(`Changed ${frame.sourceFilePath} : ${frame.title}`);
    }
  }
};
