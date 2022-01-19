export type BranchInfo = {
  currentBranch: string;
  branches: string[];
  branchable: boolean;
};

export type WorkspaceState = {
  canvasFile?: string;
  showFullEditor?: boolean;
  localResourceRoots: string[];
  branchInfo: BranchInfo;
};

export enum FSItemKind {
  FILE = "file",
  DIRECTORY = "directory",
}

export type File = {
  kind: FSItemKind.FILE;
  absolutePath: string;
  url: string;
  name: string;
};

export type Directory = {
  name: string;
  kind: FSItemKind.DIRECTORY;
  absolutePath: string;
  url: string;
  children: Array<FSItem>;
};

export type FSItem = Directory | File;
