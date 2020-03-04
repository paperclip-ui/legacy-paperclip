import { VirtualNode } from "./virt";
import { Node } from "./ast";
import { SourceLocation } from "./base-ast";

export enum EngineEventKind {
  Loading = "Loading",
  Updating = "Updating",
  Evaluated = "Evaluated",
  Error = "Error",
  NodeParsed = "NodeParsed"
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
  node?: VirtualNode;
} & BaseEngineEvent<EngineEventKind.Evaluated>;

export type NodeParsedEvent = {
  uri: string;
  node?: Node;
} & BaseEngineEvent<EngineEventKind.NodeParsed>;

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
} & BaseEngineErrorEvent<EngineErrorKind.Graph>;

export type RuntimeErrorEvent = {
  uri: string;
  message: string;
  location: SourceLocation;
} & BaseEngineErrorEvent<EngineErrorKind.Runtime>;

export type LoadingEvent = {
  uri: string;
} & BaseEngineEvent<EngineEventKind.Loading>;
export type UpdatingEvent = {
  uri: string;
} & BaseEngineEvent<EngineEventKind.Updating>;

export type EngineErrorEvent = GraphErrorEvent | RuntimeErrorEvent;
export type EngineEvent =
  | EvaluatedEvent
  | EngineErrorEvent
  | NodeParsedEvent
  | LoadingEvent
  | UpdatingEvent;
