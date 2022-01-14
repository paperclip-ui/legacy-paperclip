import { remoteChannel, Channel } from "@paperclip-ui/common";
import * as Automerge from "automerge";
import { BinaryChange } from "automerge";
import { Connection } from "./connection";

export const crdtChangesChannel = remoteChannel<BinaryChange[], void>(
  "crdtChanges"
);
export const openDocumentChannel = remoteChannel<
  string,
  { source: Automerge.BinaryDocument }
>("openDocument");
