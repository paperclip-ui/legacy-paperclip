export const MANIFEST_VERSION = 4;

export type WindowSize = {
  width: number;
  height: number;
};

export type FrameScreenshotDiff = {
  hash: string;
  otherHash: string;
};

export type FrameScreenshot = {
  browser: string;
  hash: string;
  size: WindowSize;
  diffs: FrameScreenshotDiff[];
};

export type FrameSnapshot = {
  title: string;
  sourceFilePath: string;
  screenshots: FrameScreenshot[];
};

export type ProjectSnapshot = {
  // title -> snapshot
  version: string;
  frames: FrameSnapshot[];
};

export type Manifest = {
  version: number;

  // dev -> 59bb
  commitAliases: Record<string, string>;

  // key = commit
  snapshots: ProjectSnapshot[];
};
