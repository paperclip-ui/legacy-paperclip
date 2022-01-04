export const MANIFEST_VERSION = 2;

export type WindowSize = {
  width: number;
  height: number;
};

export type FrameScreenshot = {
  browser: string;
  id: string;
  size: WindowSize;
};

export type FrameDiff = {
  id: string;
  deltaFrameScreenshotId: string;
};

export type FrameSnapshot = {
  title: string;
  sourceFilePath: string;
  screenshots: FrameScreenshot[];
  diffs: FrameDiff[];
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
