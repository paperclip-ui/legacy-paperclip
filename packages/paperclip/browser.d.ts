import { EngineDelegate, EngineOptions } from "./src";

export function loadEngineDelegate(
  options: EngineOptions,
  onCrash: any
): Promise<EngineDelegate>;
