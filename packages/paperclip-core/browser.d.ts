import { EngineDelegate, EngineOptions } from "./src/core";

export function loadEngineDelegate(
  options: EngineOptions,
  onCrash: any
): Promise<EngineDelegate>;
