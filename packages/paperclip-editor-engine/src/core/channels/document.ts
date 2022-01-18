import { remoteChannel } from "@paperclip-ui/common";
import { LoadedData } from "@paperclip-ui/core";
import { EngineDelegateEvent } from "@paperclip-ui/core";
import * as Automerge from "automerge";
import { BinaryChange } from "automerge";
import { DocumentKind } from "../documents";

/**
 */

export const sourceDocumentCRDTChangesChannel = remoteChannel<
  { uri: string; changes: BinaryChange[] },
  void
>("sourceDocumentCRDTChangesChannel");

export type BaseOpenDocumentResult<TKind extends DocumentKind, TContent> = {
  kind: TKind;
  content: TContent;
};

export type OpenDocumentPCResult = BaseOpenDocumentResult<
  DocumentKind.Paperclip,
  LoadedData
>;

export type OpenDocumentResult = OpenDocumentPCResult;

export const openDocumentChannel = remoteChannel<string, OpenDocumentResult>(
  "openDocumentChannel"
);

export const engineEventChannel = remoteChannel<EngineDelegateEvent, void>(
  "engineEventChannel"
);

/**
 * Opens a PC document
 */

export const openDocumentSourceChannel = remoteChannel<
  string,
  Automerge.BinaryDocument
>("openDocumentSourceChannel");
