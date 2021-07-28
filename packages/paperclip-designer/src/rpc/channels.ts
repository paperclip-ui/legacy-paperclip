import { remoteChannel } from "paperclip-common";
import {
  NodeStyleInspection,
  VirtNodeSource,
  LoadedData
} from "paperclip-utils";
import { Directory } from "../state";

export const inspectNodeStyleChannel = remoteChannel<
  VirtNodeSource[],
  Array<[VirtNodeSource, NodeStyleInspection]>
>("inspectNodeStyleChannel");

export const revealNodeSourceChannel = remoteChannel<VirtNodeSource, void>(
  "revealNodeSourceChannel"
);

export const popoutWindowChannel = remoteChannel<{ path: string }, void>(
  "popoutWindowChannel"
);

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
