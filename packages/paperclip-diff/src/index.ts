import * as pupetter from "puppeteer";
const pLimit = require("p-limit");
import * as path from "path";
import { eachFrame } from "paperclip-diff-utils";
import { snakeCase } from "lodash";
import git, { SimpleGit } from "simple-git";
import * as fsa from "fs-extra";
import { logInfo, logWarn } from "./utils";
import * as ora from "ora";
import { Manifest } from "./state";
const pixelmatch = require("pixelmatch");
const PNG = require("pngjs").PNG;

const PC_HIDDEN_DIR = ".paperclip";
const MANIFEST_FILE_NAME = "manifest.json";
const DIFF_BOUNDARY = "~";

export class PaperclipDiff {
  private _browser: pupetter.Browser;
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
    this._browser = await pupetter.launch();
    this._gitDir = await this._git.revparse([`--show-toplevel`]);
    return this;
  }

  /**
   */

  async snapshot() {
    const status = await this._git.status();

    if (status.files.length) {
      logWarn(
        `You need to commit your changes before you can make a snapshot.`
      );
    }

    const spinner = ora(`Generating snapshots from latest commit`).start();

    const latestCommit = (await this._git.log()).latest.hash;
    const currentBranch = await (await this._git.branch()).current;
    await this._saveScreenshots(latestCommit);

    spinner.stop();

    await this._browser.close();

    let manifest = getManifest(this._gitDir);
    manifest = {
      ...manifest,
      branchSnapshots: {
        [currentBranch]: latestCommit
      }
    };
    saveManigest(this._gitDir, manifest);
  }

  /**
   */

  async detectChanges(branch?: string, watch?: boolean) {
    const currentBranch = await (await this._git.branch()).current;
    const deltaBranch = branch || currentBranch;
    const manifest = getManifest(this._gitDir);
    const deltaCommit = manifest.branchSnapshots[deltaBranch];

    let spinner = ora(`Generating snapshots from current changes`).start();
    await this._saveScreenshots(currentBranch);
    await spinner.stop();

    spinner = ora(`Diffing against ${deltaCommit}`).start();

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
    }

    spinner.stop();
  }

  /**
   */

  async close() {
    await this._browser.close();
  }

  /**
   */

  private async _saveScreenshots(dir: string) {
    const snapshotDir = getSnapshotDir(this._gitDir, dir);

    await fsa.mkdirp(snapshotDir);
    const limit = pLimit(10);

    await eachFrame(
      ".",
      { cwd: this._cwd, skipHidden: true },
      async (html, annotations, title, assets) => {
        return limit(async () => {
          const fileName = snakeCase(title) + ".png";
          const page = await this._browser.newPage();

          // TODO - responsive sizes

          page.setViewport({ width: 1400, height: 768 });
          await page.setContent(html);
          await page.screenshot({
            path: path.join(snapshotDir, fileName)
          });
        });
      }
    );
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
  console.log(diffFileName);
  fsa.writeFileSync(
    path.join(path.dirname(snapshotFilePath), diffFileName),
    PNG.sync.write(diff)
  );
};

const getManifestPath = (cwd: string) =>
  path.join(cwd, PC_HIDDEN_DIR, MANIFEST_FILE_NAME);
const getManifest = (cwd: string): Manifest => {
  const filePath = getManifestPath(cwd);
  if (fsa.existsSync(filePath)) {
    return JSON.parse(fsa.readFileSync(filePath, "utf-8"));
  }
  return {
    branchSnapshots: {}
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
