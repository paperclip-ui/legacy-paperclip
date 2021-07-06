import { SourceLocation } from "./base-ast";

export enum ParseErrorKind {
  EndOfFile = "EndOfFile",
  Unknown = "Unknown",
  Unexpected = "Unexpected",
  Unterminated = "Unterminated"
}

export type ParseError = {
  kind: ParseErrorKind;
  message: string;
  location: SourceLocation;
};

export enum GraphErrorInfoKind {
  IncludeNotFound = "IncludeNotFound",
  Syntax = "Syntax"
}

export type BaseGraphErrorInfo<TKind extends GraphErrorInfoKind> = {
  kind: TKind;
};

export type IncludeNotFoundErrorInfo = {
  uri: string;
  location: SourceLocation;
  message: string;
} & BaseGraphErrorInfo<GraphErrorInfoKind.IncludeNotFound>;

export type SyntaxErrorInfo = ParseError &
  BaseGraphErrorInfo<GraphErrorInfoKind.Syntax>;

export type GraphErrorInfo = IncludeNotFoundErrorInfo | SyntaxErrorInfo;

export type GraphError = {
  uri: string;
  info: GraphErrorInfo;
};

export type RuntimeError = {
  uri: string;
  location: SourceLocation;
  message: string;
};

export enum EngineErrorKind {
  Graph = "Graph",
  Runtime = "Runtime"
}

export type BaseEngineError<TKind = EngineErrorKind> = {
  errorKind: TKind;
};

export type RuntimeEngineError = RuntimeError &
  BaseEngineError<EngineErrorKind.Runtime>;
export type GraphEngineError = GraphError &
  BaseEngineError<EngineErrorKind.Graph>;

export type EngineError = RuntimeEngineError | GraphEngineError;
