import { BaseAction, actionCreator } from "./base";
import { EngineEvent, LoadedData, EngineErrorEvent } from "paperclip-utils";

export enum ActionType {
  ENGINE_EVENT_RECEIVED = "ENGINE_EVENT_RECEIVED",
  ENGINE_ERROR_RECEIVED = "ENGINE_ERROR_RECEIVED",
  INIT_RECEIVED = "INIT_RECEIVED"
}

export type EngineEventReceived = BaseAction<
  ActionType.ENGINE_EVENT_RECEIVED,
  EngineEvent
>;
export type EngineErrorReceived = BaseAction<
  ActionType.ENGINE_ERROR_RECEIVED,
  EngineErrorEvent
>;
export type InitReceived = BaseAction<ActionType.INIT_RECEIVED, LoadedData>;

export const engineEventReceived = actionCreator<EngineEventReceived>(
  ActionType.ENGINE_EVENT_RECEIVED
);
export const engineErrorReceived = actionCreator<EngineErrorReceived>(
  ActionType.ENGINE_ERROR_RECEIVED
);
export const initReceived = actionCreator<InitReceived>(
  ActionType.INIT_RECEIVED
);

export type Action = EngineEventReceived | InitReceived | EngineErrorReceived;
