import * as path from "path";
const chalk = require("chalk");
import git, { SimpleGit } from "simple-git";
import * as fsa from "fs-extra";
import { logInfo, logWarn } from "./utils";
import * as ora from "ora";
import { Manifest } from "./state";
import { PaperclipResourceWatcher } from "paperclip";
import { resolvePCConfig } from "paperclip-utils";
import { SnapshotCreator } from "./SnapshotCreator";

const pixelmatch = require("pixelmatch");
const PNG = require("pngjs").PNG;

class ChangeDetector {
  constructor(private _watch: boolean) {}
  start() {}
}

export class PaperclipDiff {
  private _snapshotCreator: SnapshotCreator;
  private _git: SimpleGit;
  private _gitDir: string;

  /**
   */

  constructor(private _cwd: string) {
    this._git = git(this._cwd);
  }

  /**
   */

  async start() {
    this._gitDir = await this._git.revparse([`--show-toplevel`]);
    this._snapshotCreator = new SnapshotCreator(this._gitDir, this._cwd);
    return this;
  }

  /**
   */

  async snapshot(force?: boolean) {
    const status = await this._git.status();

    if (status.files.length && !force) {
      return logWarn(
        `You need to commit your file changes before creating a snapshot. You may add ${chalk.bold(
          "--force"
        )} to ignore this warning.`
      );
    }

    const latestCommit = (await this._git.log()).latest.hash;
    const currentBranch = await (await this._git.branch()).current;
    const spinner = ora(
      `Generating base ${chalk.bold(currentBranch)} snapshots`
    ).start();
    await this._snapshotCreator.saveScreenshots(latestCommit);

    spinner.stop();
  }

  /**
   */

  async detectChanges(branch?: string, watch?: boolean) {
    const currentBranch = await (await this._git.branch()).current;
    const deltaBranch = branch || currentBranch;
    const manifest = getManifest(this._gitDir);
    const deltaCommit = manifest.commitAliases[deltaBranch];

    let spinner = ora(`Generating fresh snapshots`).start();
    await this._snapshotCreator.saveScreenshots(currentBranch);
    await spinner.stop();
    await timeout(500);

    logInfo(`Diffing against ${deltaCommit}...`);

    const currentBranchSnapshots = getSnapshotFilePaths(
      this._gitDir,
      currentBranch
    );
    const deltaBranchSnapshots = getSnapshotFilePaths(
      this._gitDir,
      deltaCommit
    );

    const deltaBranchSnapshotsByFileName = deltaBranchSnapshots.reduce(
      (map, filePath) => {
        map[path.basename(filePath)] = filePath;
        return map;
      },
      {}
    );

    for (const snapshotFilePath of currentBranchSnapshots) {
      const fileName = path.basename(snapshotFilePath);

      const deltaSnapshotPath = deltaBranchSnapshotsByFileName[fileName];
      if (deltaSnapshotPath) {
        const info = diffSnapshots(snapshotFilePath, deltaSnapshotPath);
        if (info.changeCount) {
          logInfo(`Changed ${snapshotFilePath}`);
          saveDiffSnapshot(snapshotFilePath, deltaCommit, info);
        }
      } else {
        // NEW SNAPSHOT
      }
      await timeout(10);
    }

    logInfo(`Finished diffing`);

    if (watch) {
      logInfo(`Waiting for file changes`);
      const [config] = await resolvePCConfig(fsa)(this._cwd);
      const watcher = new PaperclipResourceWatcher(config.srcDir, this._cwd);
      watcher.onChange(() => {
        watcher.dispose();
        this.detectChanges(branch, true);
      });
    }
  }

  /**
   */

  async close() {
    await this._snapshotCreator.stop();
  }
}

const getSnapshotFilePaths = (cwd: string, snapshotDir: string) => {
  const dir = getSnapshotDir(cwd, snapshotDir);
  return fsa
    .readdirSync(dir)
    .map(fileName => path.join(dir, fileName))
    .filter(
      filePath =>
        /\.png$/.test(filePath) &&
        !path.basename(filePath).includes(DIFF_BOUNDARY)
    );
};

const diffSnapshots = (snapshotFilePath: string, deltaSnapshotPath: string) => {
  const img1 = PNG.sync.read(fsa.readFileSync(snapshotFilePath));
  const img2 = PNG.sync.read(fsa.readFileSync(deltaSnapshotPath));
  const { width, height } = img1;
  const diff = new PNG({ width, height });
  const changeCount = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    {
      threshold: 0.1
    }
  );

  return { diff, changeCount };
};

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
const getManifest = (cwd: string): Manifest => {
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
const getSnapshotDir = (cwd: string, latestCommit: string) =>
  path.join(cwd, PC_HIDDEN_DIR, "snapshots", latestCommit);
const getBaseSnapshotsDir = (cwd: string, latestCommit: string) =>
  path.join(getSnapshotDir(cwd, latestCommit), "base");
