export type BrowserInfo = {
  name: string;
  version: string;
};

export type WindowSize = {
  width: number;
  height: number;
};

export type Screenshot = {
  browser: BrowserInfo;
  fileName: string;
  size: WindowSize;
};

export type FrameSnapshot = {
  screenshots: Screenshot[];
};

export type Snapshot = {
  // title -> snapshot
  frames: Record<string, FrameSnapshot>;
};

export type Manifest = {
  // dev -> 59bb
  commitAliases: Record<string, string>;

  // key = commit
  snapshots: Record<string, Snapshot>;
};
