import { remoteChannel } from "paperclip-common";
import {
  NodeStyleInspection,
  VirtNodeSource,
  LoadedData
} from "paperclip-utils";
import { Directory, VirtualNodeSourceInfo } from "../state";

export const inspectNodeStyleChannel = remoteChannel<
  VirtNodeSource[],
  Array<[VirtNodeSource, NodeStyleInspection]>
>("inspectNodeStyleChannel");

export const revealNodeSourceChannel = remoteChannel<VirtNodeSource, void>(
  "revealNodeSourceChannel"
);

export const revealNodeSourceByIdChannel = remoteChannel<string, void>(
  "revealNodeSourceByIdChannel"
);

export const popoutWindowChannel = remoteChannel<{ path: string }, void>(
  "popoutWindowChannel"
);

export const eventsChannel = remoteChannel<any, void>("eventsChannel");

export const getAllScreensChannel = remoteChannel<
  void,
  Record<string, LoadedData>
>("getAllScreensChannel");

export const getServerOptionsChannel = remoteChannel<
  void,
  { localResourceRoots: string[] }
>("getServerOptionsChannel");

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
