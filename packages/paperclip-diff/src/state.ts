export const MANIFEST_VERSION = 7;
import { produce } from "immer";
import * as path from "path";

export const MANIFEST_FILE_NAME = "manifest.json";
export const DIFF_BOUNDARY = "~";
export const PC_HIDDEN_DIR = ".paperclip";
export const DIFF_DIR = PC_HIDDEN_DIR + "/diff";
export const SCREENSHOTS_DIR = DIFF_DIR + "/screenshots";

export type WindowSize = {
  width: number;
  height: number;
};

export type FrameScreenshotDiff = {
  id: string;
  changeCount: number;
  screnshotId: string;
  otherScreenshotId: string;
};

export type FrameScreenshot = {
  id: string;
  browser: string;
  size: WindowSize;
  diffIds: string[];
};

export type FrameSnapshot = {
  id: string;

  // may be explicitly defined by user
  hash: string;
  title: string;
  sourceFilePath: string;
  screenshotIds: string[];
};

export type ProjectSnapshot = {
  version: string;
  frameIds: string[];
};

export type Manifest = {
  version: number;
  diffs: FrameScreenshotDiff[];
  screenshots: FrameScreenshot[];
  frameSnapshots: FrameSnapshot[];
  projectSnapshots: ProjectSnapshot[];
  commitAliases: Record<string, string>;
};

export type ExpandedFrameScreenshot = {
  diffs: FrameScreenshotDiff[];
} & FrameScreenshot;

export type ExpandedFrameSnapshot = {
  screenshots: ExpandedFrameScreenshot[];
} & FrameSnapshot;

export type ExpandedProjectSnapshot = {
  frames: ExpandedFrameSnapshot[];
} & ProjectSnapshot;

export const screenshotEquals = (a: FrameScreenshot, b: FrameScreenshot) =>
  a.browser === b.browser && sizeEquals(a.size, b.size);
export const sizeEquals = (a: WindowSize, b: WindowSize) =>
  a.width === b.width && a.height === b.height;
export const getProjectSnapshot = (version: string, manifest: Manifest) =>
  manifest.projectSnapshots.find(snapshot => snapshot.version === version);
export const getProjectFrames = (
  project: ProjectSnapshot,
  manifest: Manifest
) =>
  manifest.frameSnapshots.filter(snapshot =>
    project.frameIds.includes(snapshot.id)
  );
export const getFrameScreenshots = (frame: FrameSnapshot, manifest: Manifest) =>
  manifest.screenshots.filter(screenshot =>
    frame.screenshotIds.includes(screenshot.id)
  );
export const getScreenshotDiffs = (
  screenshot: FrameScreenshot,
  manifest: Manifest
) => manifest.diffs.filter(diff => screenshot.diffIds.includes(diff.id));

export const getProjectScreenshots = (version: string, manifest: Manifest) => {
  const project = getProjectSnapshot(version, manifest);
  const screenshots: FrameScreenshot[] = [];
  const frames = getProjectFrames(project, manifest);
  for (const frame of frames) {
    screenshots.push(...getFrameScreenshots(frame, manifest));
  }
  return screenshots;
};

const getDiffScreenshot = (diff: FrameScreenshotDiff, manifest: Manifest) => {
  return manifest.screenshots.find(screenshot =>
    screenshot.diffIds.includes(diff.id)
  );
};

export const getDiffFrame = (diff: FrameScreenshotDiff, manifest: Manifest) => {
  const diffScreenshot = getDiffScreenshot(diff, manifest);
  return manifest.frameSnapshots.find(frame =>
    frame.screenshotIds.includes(diffScreenshot.id)
  );
};

export const getProjectDiffs = (version: string, manifest: Manifest) => {
  const screenshots = getProjectScreenshots(version, manifest);
  const diffs: FrameScreenshotDiff[] = [];
  for (const screenshot of screenshots) {
    diffs.push(...getScreenshotDiffs(screenshot, manifest));
  }
  return diffs;
};

export const getChanges = (
  version1: string,
  version2: string,
  manifest: Manifest
): FrameScreenshotDiff[] => {
  const otherScreenshotIds = getProjectScreenshots(version2, manifest).map(
    v => v.id
  );

  const v1Diffs = getProjectDiffs(version1, manifest);

  return v1Diffs.filter(diff => {
    return otherScreenshotIds.includes(diff.otherScreenshotId);
  });
};

export const addDiffToManifest = (
  screenshotId: string,
  screenshotDiff: FrameScreenshotDiff,
  manifest: Manifest
): Manifest => {
  manifest = produce(manifest, newManifest => {
    newManifest.diffs = insert("id", [screenshotDiff], manifest.diffs);
    for (const screenshot of newManifest.screenshots) {
      if (screenshot.id === screenshotId) {
        if (!screenshot.diffIds.includes(screenshotDiff.id)) {
          screenshot.diffIds.push(screenshotDiff.id);
        }
        break;
      }
    }
  });

  return manifest;
};

export const addFrameSnapshots = async (
  projectSnapshot: ProjectSnapshot,
  frames: FrameSnapshot[],
  screenshots: FrameScreenshot[],
  gitDir: string,
  version: string,
  tagName: string,
  manifest: Manifest
): Promise<Manifest> => {
  manifest = produce(manifest, newManifest => {
    newManifest.commitAliases[tagName] = version;
    newManifest.projectSnapshots = insert(
      "version",
      [projectSnapshot],
      newManifest.projectSnapshots
    );
    newManifest.frameSnapshots = insert(
      "id",
      frames,
      newManifest.frameSnapshots
    );
    newManifest.screenshots = insert(
      "id",
      screenshots,
      newManifest.screenshots
    );
  });
  return manifest;
};

const insert = <TData>(
  key: string,
  newItems: TData[],
  collection: TData[]
): TData[] => [
  ...collection.filter(
    item => !newItems.some(aitem => aitem[key] === item[key])
  ),
  ...newItems
];

export const getScreenshotPath = (gitDir: string, id: string) =>
  path.join(gitDir, SCREENSHOTS_DIR, id + ".png");
