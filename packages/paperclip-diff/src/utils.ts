import * as chalk from "chalk";
import * as fsa from "fs-extra";
import * as path from "path";
import { Manifest } from "./state";

export const MANIFEST_FILE_NAME = "manifest.json";
export const DIFF_BOUNDARY = "~";
export const PC_HIDDEN_DIR = ".paperclip";

export const logWarn = (message: string) => {
  console.warn(chalk.yellow(`[warn]`) + " " + message);
};

export const logInfo = (message: string) => {
  console.warn(chalk.blue(`[info]`) + " " + message);
};

export const logError = (message: string) => {
  console.warn(chalk.red(`[erro] `) + " " + message);
};

export const getSnapshotDir = (cwd: string, latestCommit: string) =>
  path.join(cwd, PC_HIDDEN_DIR, "snapshots", latestCommit);

const saveDiffSnapshot = (
  snapshotFilePath: string,
  deltaCommit: string,
  { diff }
) => {
  const fileName = path.basename(snapshotFilePath);
  const diffFileName =
    fileName.replace(/\.png$/, "") + DIFF_BOUNDARY + deltaCommit + ".png";
  fsa.writeFileSync(
    path.join(path.dirname(snapshotFilePath), diffFileName),
    PNG.sync.write(diff)
  );
};

const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getManifestPath = (cwd: string) =>
  path.join(cwd, PC_HIDDEN_DIR, MANIFEST_FILE_NAME);
export const getManifest = (cwd: string): Manifest => {
  const filePath = getManifestPath(cwd);
  if (fsa.existsSync(filePath)) {
    return JSON.parse(fsa.readFileSync(filePath, "utf-8"));
  }
  return {
    commitAliases: {},
    snapshots: {}
  };
};
const saveManigest = (cwd: string, manifest: Manifest) => {
  const filePath = getManifestPath(cwd);
  fsa.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
};

const getBaseSnapshotsDir = (cwd: string, latestCommit: string) =>
  path.join(getSnapshotDir(cwd, latestCommit), "base");
