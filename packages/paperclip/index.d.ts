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

export declare const createEngineDelegateSync: (
  options?: EngineOptions,
  onCrash?: any
) => EngineDelegate;

/**
 * Beware, doesn't work in browsers.
 */

export declare const createEngineSync: (
  options?: EngineOptions,
  onCrash?: any
) => Engine;
