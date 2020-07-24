import { Engine, EngineOptions } from "./lib";
export * from "./lib";
export declare const createEngine: (
  options?: EngineOptions,
  onCrash?: any
) => Promise<Engine>;
