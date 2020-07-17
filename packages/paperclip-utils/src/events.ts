// TODO  - move all non-specific event stuff to payload, or data prop so that
// event can remain ephemeral.

import { Node } from "./ast";
import { SourceLocation } from "./base-ast";
import { Mutation } from "./virt-mtuation";
import {
  VirtualNode,
  EvaluateData,
  DiffedData,
  LoadedData,
  SheetInfo
} from "./virt";
import { PCExports } from "./exports";

export enum EngineEventKind {
  Loading = "Loading",
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

type BaseEngineEvent<KKind extends EngineEventKind> = {
  kind: KKind;
};

export type EvaluatedEvent = {
  uri: string;
  data: EvaluateData;
} & BaseEngineEvent<EngineEventKind.Evaluated>;

export type DiffedEvent = {
  uri: string;
  data: DiffedData;
} & BaseEngineEvent<EngineEventKind.Diffed>;

export type NodeParsedEvent = {
  uri: string;
  node?: Node;
} & BaseEngineEvent<EngineEventKind.NodeParsed>;

export type ChangedSheetsData = {
  newSheets: SheetInfo[];
  removedSheetUris: string[];
  allDependencies: string[];
};

export type ChangedSheetsEvent = {
  uri: string;
  data: ChangedSheetsData;
} & BaseEngineEvent<EngineEventKind.ChangedSheets>;

export type BaseEngineErrorEvent<TErrorType extends EngineErrorKind> = {
  uri: string;
  errorKind: TErrorType;
} & BaseEngineEvent<EngineEventKind.Error>;

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
} & BaseEngineEvent<EngineEventKind.Loaded>;

export type EngineErrorEvent = GraphErrorEvent | RuntimeErrorEvent;
export type EngineEvent =
  | EvaluatedEvent
  | EngineErrorEvent
  | ChangedSheetsEvent
  | NodeParsedEvent
  | LoadedEvent
  | DiffedEvent;
