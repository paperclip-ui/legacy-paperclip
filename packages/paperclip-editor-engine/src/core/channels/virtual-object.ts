import { remoteChannel } from "@paperclip-ui/common";
import { VirtualObjectEdit } from "../virtual-object-edit";

export const editVirtualObjectsChannel = remoteChannel<
  Record<string, VirtualObjectEdit[]>,
  void
>("editVirtualObjectChannel");

// export const insertBeforeNodeChannel = remoteChannel<{
//   uri: string,

//   // TODO - this needs to be beforeNodeId eventually. Just
//   // don't have the code to support this yet. See https://github.com/paperclip-ui/paperclip/pull/1035
//   beforeNodePath: string,

//   // String repre
//   node: string
// }, void>("insertNodeBeforeChannel");

// export const appendSourceToNode = remoteChannel<{
//   uri: string,

//   // TODO - needs to be id instead
//   targetPath: string,
//   node: string
// }, void>("appendNodeChannel");

// export const setNodeAttribute = remoteChannel<{
//   uri: string,

//   // TODO - needs to be id instead
//   targetPath: string,
//   name: string,

//   // value source
//   value: string
// }, void>("appendNodeChannel");

// export const updateNodeAnnotations = remoteChannel<{
//   uri: string,

//   // TODO - needs to be id instead
//   targetPath: string,
//   name: string,

//   // value source
//   value: string
// }, void>("appendNodeChannel");
