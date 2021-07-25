import { remoteChannel } from "paperclip-common";
import { NodeStyleInspection, VirtNodeSource } from "paperclip-utils";

export const inspectNodeStyleChannel = remoteChannel<
  VirtNodeSource[],
  Array<[VirtNodeSource, NodeStyleInspection]>
>("inspectNodeStyle");
