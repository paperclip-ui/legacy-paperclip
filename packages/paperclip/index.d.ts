import { Engine, EngineDelegate, EngineOptions } from "./src";
export * from "./src";
export declare const createEngine: (
  options?: EngineOptions,
  onCrash?: any
) => Promise<Engine>;

export declare const createEngineDelegate: (
  options?: EngineOptions,
  onCrash?: any
) => Promise<EngineDelegate>;

/**
 * Beware, doesn't work in browsers.
 */

export declare const createEngineSync: (
  options?: EngineOptions,
  onCrash?: any
) => Engine;
