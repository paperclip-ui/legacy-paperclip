import { LoadedData, EngineErrorEvent, EngineEvent } from "paperclip-utils";

export type AppState = {
  currentLoadedData?: LoadedData;
  currentEngineError?: EngineErrorEvent;
  currentEngineEvent?: EngineEvent;
};

export const INITIAL_STATE: AppState = {};
