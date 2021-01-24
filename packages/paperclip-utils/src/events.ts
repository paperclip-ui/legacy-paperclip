// TODO  - move all non-specific event stuff to payload, or data prop so that
// event can remain ephemeral.

import { Node } from "./ast";
import { SourceLocation } from "./base-ast";
import { EvaluateData, DiffedData, LoadedData, SheetInfo } from "./virt";

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

export enum EngineErrorKind {
  Graph = "Graph",
  Runtime = "Runtime"
}

export enum ParseErrorKind {
  EndOfFile = "EndOfFile"
}

type BaseEngineDelegateEvent<KKind extends EngineDelegateEventKind> = {
  kind: KKind;
};

export type EvaluatedEvent = {
  uri: string;
  data: EvaluateData;
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
  allDependencies: string[];
};

export type ChangedSheetsEvent = {
  uri: string;
  data: ChangedSheetsData;
} & BaseEngineDelegateEvent<EngineDelegateEventKind.ChangedSheets>;

export type BaseEngineErrorEvent<TErrorType extends EngineErrorKind> = {
  uri: string;
  errorKind: TErrorType;
} & BaseEngineDelegateEvent<EngineDelegateEventKind.Error>;

export enum GraphErrorInfoType {
  Syntax = "Syntax",
  IncludeNotFound = "IncludeNotFound",
  NotFound = "NotFound"
}

type BaseGraphErrorInfo<KKind extends GraphErrorInfoType> = {
  kind: KKind;
};

export type SyntaxGraphErrorInfo = {
  kind: ParseErrorKind;
  message: string;
  location: SourceLocation;
} & BaseGraphErrorInfo<GraphErrorInfoType.Syntax>;

export type IncludNotFoundErrorInfo = {
  uri: string;
  message: string;
  location: SourceLocation;
} & BaseGraphErrorInfo<GraphErrorInfoType.IncludeNotFound>;

export type GraphErrorInfo = SyntaxGraphErrorInfo | IncludNotFoundErrorInfo;

export type GraphErrorEvent = {
  info: GraphErrorInfo;
  message: string;
} & BaseEngineErrorEvent<EngineErrorKind.Graph>;

export type RuntimeErrorEvent = {
  uri: string;
  message: string;
  location: SourceLocation;
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
