import { remoteChannel } from "@paperclip-ui/common";
import { ContentChange, PCMutation } from "@paperclip-ui/source-writer";
import {
  NodeStyleInspection,
  VirtNodeSource,
  LoadedData,
} from "@paperclip-ui/utils";
import { Directory, WorkspaceState } from "./state";
import { VirtualNodeSourceInfo } from "@paperclip-ui/core/src/core/delegate";
import { AvailableNode } from "@paperclip-ui/language-service";

export const inspectNodeStyleChannel = remoteChannel<
  VirtNodeSource[],
  Array<[VirtNodeSource, NodeStyleInspection]>
>("inspectNodeStyleChannel");

export const setProjectIdChannel = remoteChannel<string, void>(
  "setProjectIdChannel"
);

export const revealNodeSourceChannel = remoteChannel<VirtNodeSource, void>(
  "revealNodeSourceChannel"
);

export const revealNodeSourceByIdChannel = remoteChannel<string, void>(
  "revealNodeSourceByIdChannel"
);

export const loadInsertableNodesChannel = remoteChannel<
  { activeUri: string },
  AvailableNode[]
>("loadInsertableNodesChannel");

export const openProjectChannel = remoteChannel<
  { uri?: string; branch?: string; id?: string },
  { id: string; directoryPath: string; directoryUri: string }
>("openProjectChannel");

export const editPCSourceChannel = remoteChannel<
  PCMutation[],
  Record<string, ContentChange[]>
>("editPCSourceChannel");

export const editCodeChannel = remoteChannel<
  { uri: string; value: string },
  void
>("editCodeChannel");

export const popoutWindowChannel = remoteChannel<{ path: string }, void>(
  "popoutWindowChannel"
);

export const eventsChannel = remoteChannel<any, void>("eventsChannel");
export const commitChangesChannel = remoteChannel<
  { description: string },
  void
>("commitChangesChannel");
export const setBranchChannel = remoteChannel<
  { branchName: string },
  { branchName: string }
>("setBranchChannel");

export const getAllScreensChannel = remoteChannel<
  void,
  Record<string, LoadedData>
>("getAllScreensChannel");

export const helloChannel = remoteChannel<
  { projectId: string },
  WorkspaceState
>("helloChannel");

export const loadDirectoryChannel = remoteChannel<{ path: string }, Directory>(
  "loadDirectoryChannel"
);

export const openFileChannel = remoteChannel<
  { uri: string },
  { uri: string; document: any; data: any }
>("openFileChannel");

export const loadVirtualNodeSourcesChannel = remoteChannel<
  VirtNodeSource[],
  VirtualNodeSourceInfo[]
>("loadVirtualNodeSourcesChannel");

export const getAllPaperclipFilesChannel = remoteChannel<
  { projectId: string },
  string[]
>("getAllPaperclipFilesChannel");
