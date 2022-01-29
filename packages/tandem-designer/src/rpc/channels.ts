import { remoteChannel } from "@paperclip-ui/common/lib/rpc";
import { ContentChange, PCMutation } from "@paperclip-ui/source-writer";
import {
  NodeStyleInspection,
  VirtNodeSource,
  LoadedData,
} from "@paperclip-ui/utils";
import { Directory, VirtualNodeSourceInfo, WorkspaceState } from "../state";

export const setProjectIdChannel = remoteChannel<string, void>(
  "setProjectIdChannel"
);

export const revealNodeSourceChannel = remoteChannel<VirtNodeSource, void>(
  "revealNodeSourceChannel"
);

export const revealNodeSourceByIdChannel = remoteChannel<string, void>(
  "revealNodeSourceByIdChannel"
);

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
