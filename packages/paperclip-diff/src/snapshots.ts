import * as path from "path";
const chalk = require("chalk");
const pLimit = require("p-limit");
const crypto = require("crypto");
import * as URL from "url";
import { eachFrame } from "@paperclip-ui/diff-utils";
import * as fsa from "fs-extra";
import { logInfo, logWarn } from "./utils";
import * as ora from "ora";
import * as mime from "mime-types";
import {
  addDiffToManifest,
  addFrameSnapshots,
  DATA_DIR,
  FrameScreenshot,
  FrameScreenshotDiff,
  FrameSnapshot,
  getScreenshotPath,
  Manifest,
  MANIFEST_FILE_NAME,
  MANIFEST_VERSION,
  ProjectSnapshot,
  screenshotEquals,
  SCREENSHOTS_DIR,
  WindowSize
} from "./state";
const PNG = require("pngjs").PNG;
import { Provider } from "./core";
const pixelmatch = require("pixelmatch");

// TODO - need to pull from config
const WINDOW_SIZES: WindowSize[] = [{ width: 1400, height: 768 }];

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

export type DetectChangesResult = {
  manifest: Manifest;
  currentVersion?: string;
  deltaVersion?: string;
};

export const detectChanges = (provider: Provider) => async (
  branch?: string
): Promise<DetectChangesResult> => {
  const { git, cwd, gitDir } = provider;
  const currentBranch = await (await git.branch()).current;
  const deltaBranch = branch || currentBranch;
  let manifest = getManifest(gitDir);
  const deltaCommit = manifest.commitAliases[deltaBranch];

  let spinner = ora(
    `Generating latest ${chalk.bold(currentBranch)} snapshots...`
  ).start();

  const version = currentBranch;

  manifest = await saveScreenshots(provider)(version, version + "@latest");
  await spinner.stop();
  await timeout(500);

  logInfo(`Diffing against commit sha ${chalk.bold(deltaCommit)}...`);

  const snapshot = manifest.projectSnapshots.find(
    snapshot => snapshot.version === version
  );
  const deltaSnapshot = manifest.projectSnapshots.find(
    snapshot => snapshot.version === deltaCommit
  );

  // return {
  //   manifest,
  //   currentVersion: snapshot.version,
  //   deltaVersion: deltaSnapshot.version
  // };

  const snapshotPairs = getSnapshotPairs(snapshot, deltaSnapshot, manifest);

  for (const hash in snapshotPairs) {
    const screenshotPairs = snapshotPairs[hash];
    for (const [aid, bid] of screenshotPairs) {
      // it's a new frame
      if (!bid) {
        continue;
      }
      const apath = getScreenshotPath(gitDir, aid);
      const bpath = getScreenshotPath(gitDir, bid);
      const info = await diffImages(apath, bpath);

      const diff: FrameScreenshotDiff = {
        id: md5(aid + bid),
        changeCount: info.changeCount,
        screnshotId: aid,
        otherScreenshotId: bid
      };

      await saveDiffScreenshot(gitDir, diff.id, info);
      manifest = addDiffToManifest(aid, diff, manifest);
    }
  }

  saveManigest(gitDir, manifest);

  return {
    manifest,
    currentVersion: snapshot.version,
    deltaVersion: deltaSnapshot.version
  };
};

const getSnapshotPairs = (
  a: ProjectSnapshot,
  b: ProjectSnapshot,
  manifest: Manifest
) => {
  const framePairs = {};

  const aframes = manifest.frameSnapshots.filter(v =>
    a.frameIds.includes(v.id)
  );
  const bframes = manifest.frameSnapshots.filter(v =>
    b.frameIds.includes(v.id)
  );

  for (const aframe of aframes) {
    const bframe = bframes.find(frame => frame.hash === aframe.hash);

    const screenshotPairs: Array<string[]> = [];

    const ascreenshots = manifest.screenshots.filter(screenshot =>
      aframe.screenshotIds.includes(screenshot.id)
    );

    for (const ascreenshot of ascreenshots) {
      const pairIds: string[] = [ascreenshot.id];
      const bscreenshot =
        bframe &&
        manifest.screenshots.find(
          screenshot =>
            bframe.screenshotIds.includes(screenshot.id) &&
            screenshotEquals(ascreenshot, screenshot)
        );

      if (bscreenshot) {
        pairIds.push(bscreenshot.id);
      }

      screenshotPairs.push(pairIds);
    }

    framePairs[aframe.hash] = screenshotPairs;
  }
  return framePairs;
};

/**
 */

/**
 */

const saveDiffScreenshot = (gitDir: string, id: string, { diff }) => {
  const filePath = getScreenshotPath(gitDir, id);
  fsa.writeFileSync(filePath, PNG.sync.write(diff));
};

/**
 */

const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 */

const getManifestPath = (cwd: string) =>
  path.join(cwd, DATA_DIR, MANIFEST_FILE_NAME);
export const getManifest = (gitDir: string): Manifest => {
  const filePath = getManifestPath(gitDir);
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
    frameSnapshots: [],
    screenshots: [],
    diffs: [],
    projectSnapshots: []
  };
};

/**
 */

const saveScreenshots = ({ gitDir, cwd, browser, git }: Provider) => async (
  version: string,
  tag?: string
) => {
  await fsa.mkdirp(getScreenshotsDir(gitDir));
  const limit = pLimit(10);

  const allFrameSnapshots: FrameSnapshot[] = [];
  const allScreenshots: FrameScreenshot[] = [];

  const resolveAsset = (filePath: string) => {
    // console.log(`data:${mime.lookup(filePath)};base64,${fsa.readFileSync(filePath).toString("base64")}`);
    return `data:${mime.lookup(filePath)};base64,${fsa
      .readFileSync(filePath)
      .toString("base64")}`;
  };

  await eachFrame(
    ".",
    { cwd, resolveAsset },
    async ({ id: frameHash, html, title, filePath }) => {
      return limit(async () => {
        const browserVersion = await browser.version();
        const screenshotIds: string[] = [];

        for (const size of WINDOW_SIZES) {
          const hash = md5(
            frameHash + browserVersion + size.width + size.height
          );
          const id = md5(version + hash);
          const filePath = getScreenshotPath(gitDir, id);
          const page = await browser.newPage();
          page.setViewport(size);

          await page.setContent(html);

          // stop text input focus
          await page.focus("body");

          // wait for content to load
          await page.waitForNetworkIdle();

          // TODO - wait for transition end

          await page.screenshot({
            path: filePath
          });

          screenshotIds.push(id);
          allScreenshots.push({
            id,
            size,
            browser: browserVersion,
            diffIds: []
          });
        }

        allFrameSnapshots.push({
          id: md5(version + frameHash),
          hash: frameHash,
          title,
          sourceFilePath: path.relative(gitDir, filePath),
          screenshotIds
        });
      });
    }
  );

  const manifest = await addFrameSnapshots(
    { version, frameIds: allFrameSnapshots.map(snapshot => snapshot.id) },
    allFrameSnapshots,
    allScreenshots,
    gitDir,
    version,
    tag,
    getManifest(gitDir)
  );
  saveManigest(gitDir, manifest);

  return manifest;
};

/**
 */

const diffImages = (snapshotFilePath: string, deltaSnapshotPath: string) => {
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
      threshold: 0.2
    }
  );

  return { diff, changeCount };
};

/**
 */

export const saveManigest = (gitDir: string, manifest: Manifest) => {
  const filePath = getManifestPath(gitDir);
  fsa.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
};

/**
 */

const getScreenshotsDir = (gitDir: string) =>
  path.join(gitDir, SCREENSHOTS_DIR);

const md5 = (value: string) => {
  return crypto
    .createHash("md5")
    .update(value)
    .digest("hex");
};
