import { EngineDelegate, EngineOptions } from "./src/core";
export * from "./src/core";
export * from "./src/node";

export function createEngineDelegate(
  options?: EngineOptions,
  onCrash?: any
): EngineDelegate;
