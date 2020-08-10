import { Engine, EngineOptions } from "./src";
export * from "./src";
export declare const createEngine: (
  options?: EngineOptions,
  onCrash?: any
) => Promise<Engine>;

/**
 * Beware, doesn't work in browsers.
 */

export declare const createEngineSync: (
  options?: EngineOptions,
  onCrash?: any
) => Engine;
