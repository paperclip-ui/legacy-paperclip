// TODO  - move all non-specific event stuff to payload, or data prop so that
// event can remain ephemeral.

import { Node } from "../html/ast";
import { StringRange } from "../base/ast";
import { EngineErrorKind, GraphErrorInfo } from "./errors";
import { EvaluatedData, DiffedData, LoadedData, SheetInfo } from "../html/virt";

export enum EngineDelegateEventKind {
  Loading = "Loading",
  Deleted = "Deleted",
  Loaded = "Loaded",
  Updating = "Updating",
  Evaluated = "Evaluated",
  Error = "Error",
  NodeParsed = "NodeParsed",
  Diffed = "Diffed",
  ChangedSheets = "ChangedSheets"
}

type BaseEngineDelegateEvent<KKind extends EngineDelegateEventKind> = {
  kind: KKind;
};

export type EvaluatedEvent = {
  uri: string;
  data: EvaluatedData;
} & BaseEngineDelegateEvent<EngineDelegateEventKind.Evaluated>;

export type DeletedEvent = {
  uri: string;
} & BaseEngineDelegateEvent<EngineDelegateEventKind.Deleted>;

export type DiffedEvent = {
  uri: string;
  data: DiffedData;
} & BaseEngineDelegateEvent<EngineDelegateEventKind.Diffed>;

export type NodeParsedEvent = {
  uri: string;
  node?: Node;
} & BaseEngineDelegateEvent<EngineDelegateEventKind.NodeParsed>;

export type ChangedSheetsData = {
  newSheets: SheetInfo[];
  removedSheetUris: string[];
  allImportedSheetUris: string[];
};

export type ChangedSheetsEvent = {
  uri: string;
  data: ChangedSheetsData;
} & BaseEngineDelegateEvent<EngineDelegateEventKind.ChangedSheets>;

export type BaseEngineErrorEvent<TErrorType extends EngineErrorKind> = {
  uri: string;
  errorKind: TErrorType;
} & BaseEngineDelegateEvent<EngineDelegateEventKind.Error>;

export type GraphErrorEvent = {
  info: GraphErrorInfo;
  message: string;
} & BaseEngineErrorEvent<EngineErrorKind.Graph>;

export type RuntimeErrorEvent = {
  uri: string;
  message: string;
  range: StringRange;
} & BaseEngineErrorEvent<EngineErrorKind.Runtime>;

export type LoadedEvent = {
  uri: string;
  data: LoadedData;
} & BaseEngineDelegateEvent<EngineDelegateEventKind.Loaded>;

export type EngineErrorEvent = GraphErrorEvent | RuntimeErrorEvent;
export type EngineDelegateEvent =
  | EvaluatedEvent
  | EngineErrorEvent
  | ChangedSheetsEvent
  | DeletedEvent
  | NodeParsedEvent
  | LoadedEvent
  | DiffedEvent;
