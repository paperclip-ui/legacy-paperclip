import { EngineDelegate, EngineOptions } from "./src";
export * from "./src";

export function createEngineDelegate(
  options?: EngineOptions,
  onCrash?: any
): EngineDelegate;
