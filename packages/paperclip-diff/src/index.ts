import * as path from "path";
const chalk = require("chalk");
const pLimit = require("p-limit");
const crypto = require("crypto");
import git, { SimpleGit } from "simple-git";
import { eachFrame } from "paperclip-diff-utils";
import * as fsa from "fs-extra";
import { logInfo, logWarn } from "./utils";
import * as ora from "ora";
import {
  FrameScreenshot,
  FrameSnapshot,
  Manifest,
  MANIFEST_VERSION,
  ProjectSnapshot,
  WindowSize
} from "./state";
import { PaperclipResourceWatcher } from "paperclip";
import { resolvePCConfig } from "paperclip-utils";
const PNG = require("pngjs").PNG;
import * as pupetter from "puppeteer";
const pixelmatch = require("pixelmatch");

export const MANIFEST_FILE_NAME = "manifest.json";
export const DIFF_BOUNDARY = "~";
export const PC_HIDDEN_DIR = ".paperclip";

// TODO - need to pull from config
const WINDOW_SIZES: WindowSize[] = [{ width: 1400, height: 768 }];

export type Provider = {
  browser: pupetter.Browser;
  git: SimpleGit;
  cwd: string;
  gitDir: string;
  close: () => void;
};

/**
 */

export const start = async (cwd: string): Promise<Provider> => {
  const browser = await pupetter.launch();
  const _git = git(cwd);
  return {
    browser,
    git: _git,
    cwd,
    gitDir: await _git.revparse([`--show-toplevel`]),
    close() {
      browser.close();
    }
  };
};

/**
 * Generates new snapshot from current branch
 */

export const snapshot = (provider: Provider) => async (force?: boolean) => {
  const status = await provider.git.status();

  if (status.files.length && !force) {
    return logWarn(
      `You need to commit your file changes before creating a snapshot. You may add ${chalk.bold(
        "--force"
      )} to ignore this warning.`
    );
  }

  const latestCommit = (await provider.git.log()).latest.hash;
  const currentBranch = await (await provider.git.branch()).current;
  const spinner = ora(
    `Generating base ${chalk.bold(currentBranch)} snapshots...`
  ).start();
  await saveScreenshots(provider)(latestCommit, currentBranch);

  spinner.stop();
};

export const detectChanges = (provider: Provider) => async (
  branch?: string,
  watch?: boolean
) => {
  const { git, cwd, gitDir } = provider;
  const currentBranch = await (await git.branch()).current;
  const deltaBranch = branch || currentBranch;
  let manifest = getManifest(gitDir);
  const deltaCommit = manifest.commitAliases[deltaBranch];

  let spinner = ora(
    `Generating latest ${chalk.bold(currentBranch)} snapshots...`
  ).start();
  manifest = await saveScreenshots(provider)(
    currentBranch,
    currentBranch + "@latest"
  );
  await spinner.stop();
  await timeout(500);

  logInfo(`Diffing against ${deltaCommit}...`);

  const snapshot = manifest.snapshots.find(
    snapshot => snapshot.version === currentBranch
  );
  const deltaSnapshot = manifest.snapshots.find(
    snapshot => snapshot.version === deltaCommit
  );

  const frameSnapshotPairs: Record<string, string[]> = {};

  for (const frame of snapshot.frames) {
    frameSnapshotPairs;
  }
};

const addSnapshotPairs = (
  snapshot: ProjectSnapshot,
  frameSnapshotPairs: Record<string, string[]>
) => {
  for (const frame of snapshot.frames) {
    for (const screenshot of frame.screenshots) {
      // if (!frameSnapshotPairs[frame.title])
    }
  }
};

/**
 */

// export const detectChanges2 = (provider: Provider) => async (branch?: string, watch?: boolean) => {
//   const {git, cwd, gitDir } = provider;
//   const currentBranch = await (await git.branch()).current;
//   const deltaBranch = branch || currentBranch;
//   const manifest = getManifest(gitDir);
//   const deltaCommit = manifest.tags[deltaBranch];

//   let spinner = ora(`Generating latest ${chalk.bold(currentBranch)} snapshots...`).start();
//   await saveScreenshots(provider)(currentBranch);
//   await spinner.stop();
//   await timeout(500);

//   logInfo(`Diffing against ${deltaCommit}...`);

//   const currentBranchFrameSnapshots = getSnapshotFilePaths(
//     gitDir,
//     currentBranch
//   );
//   const deltaBranchSnapshots = getSnapshotFilePaths(
//     gitDir,
//     deltaCommit
//   );

//   return;

//   const deltaBranchSnapshotsByFileName = deltaBranchSnapshots.reduce(
//     (map, filePath) => {
//       map[path.basename(filePath)] = filePath;
//       return map;
//     },
//     {}
//   );

//   for (const snapshotFilePath of currentBranchSnapshots) {
//     const fileName = path.basename(snapshotFilePath);

//     const deltaSnapshotPath = deltaBranchSnapshotsByFileName[fileName];
//     if (deltaSnapshotPath) {
//       const info = diffSnapshots(snapshotFilePath, deltaSnapshotPath);
//       if (info.changeCount) {
//         logInfo(`Changed ${snapshotFilePath}`);
//         saveDiffSnapshot(snapshotFilePath, deltaCommit, info);
//       }
//     } else {
//       // NEW SNAPSHOT
//     }
//     await timeout(10);
//   }

//   logInfo(`Finished diffing`);

//   if (watch) {
//     logInfo(`Waiting for file changes`);
//     const [config] = await resolvePCConfig(fsa)(cwd);
//     const watcher = new PaperclipResourceWatcher(config.srcDir, cwd);
//     watcher.onChange(() => {
//       watcher.dispose();
//       detectChanges(provider)(branch, true);
//     });
//   }
// }

/**
 */

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

/**
 */

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

/**
 */

const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 */

const getManifestPath = (cwd: string) =>
  path.join(cwd, PC_HIDDEN_DIR, MANIFEST_FILE_NAME);
export const getManifest = (projectDir: string): Manifest => {
  const filePath = getManifestPath(projectDir);
  if (fsa.existsSync(filePath)) {
    const manifest = JSON.parse(fsa.readFileSync(filePath, "utf-8"));

    // just dump it
    if (manifest.version === MANIFEST_VERSION) {
      return manifest;
    }
  }
  return {
    version: MANIFEST_VERSION,
    commitAliases: {},
    snapshots: []
  };
};

/**
 */

const saveScreenshots = ({ gitDir, cwd, browser }: Provider) => async (
  version: string,
  tag?: string
) => {
  const snapshotDir = getSnapshotDir(gitDir, version);

  await fsa.mkdirp(snapshotDir);
  const limit = pLimit(10);

  const frameSnapshots: FrameSnapshot[] = [];

  await eachFrame(
    ".",
    { cwd, skipHidden: true },
    async (html, annotations, title, assets) => {
      return limit(async () => {
        const screenshots: FrameScreenshot[] = [];

        frameSnapshots.push({
          title,
          sourceFilePath: null,
          screenshots,
          diffs: []
        });

        for (const size of WINDOW_SIZES) {
          const id = md5(title + size.width + size.height);
          const filePath = path.join(snapshotDir, id + ".png");
          const page = await browser.newPage();
          page.setViewport(size);
          await page.setContent(html);
          await page.screenshot({
            path: filePath
          });
          screenshots.push({
            size,
            id,
            browser: await browser.version()
          });
        }
      });
    }
  );

  return await saveFrameSnapshots(
    { frames: frameSnapshots, version },
    gitDir,
    version,
    tag
  );
};

const saveFrameSnapshots = async (
  projectSnapshot: ProjectSnapshot,
  projectDir: string,
  version: string,
  tagName?: string
) => {
  let manifest = getManifest(projectDir);
  manifest = {
    ...manifest,
    commitAliases: {
      ...manifest.commitAliases,
      [tagName]: version
    },
    snapshots: [
      projectSnapshot,
      ...manifest.snapshots.filter(snapshot => snapshot.version !== version)
    ]
  };
  saveManigest(projectDir, manifest);
  return manifest;
};

/**
 */

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

/**
 */

export const saveManigest = (projectDir: string, manifest: Manifest) => {
  const filePath = getManifestPath(projectDir);
  fsa.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
};

/**
 */

const getSnapshotDir = (cwd: string, latestCommit: string) =>
  path.join(cwd, PC_HIDDEN_DIR, "snapshots", latestCommit);

/**
 */

const getBaseSnapshotsDir = (cwd: string, latestCommit: string) =>
  path.join(getSnapshotDir(cwd, latestCommit), "base");

const md5 = (value: string) => {
  return crypto
    .createHash("md5")
    .update(value)
    .digest("hex");
};
