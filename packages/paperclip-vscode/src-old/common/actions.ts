import { actionCreator } from "./base";
import * as ve from "paperclip-designer";

// to be used with sendNotification
export const $$ACTION_NOTIFICATION = "$$ACTION_NOTIFICATION";

export enum ActionType {
  DEV_SERVER_INITIALIZED = "DEV_SERVER_INITIALIZED",
  DEV_SERVER_CHANGED = "DEV_SERVER_CHANGED",
  ENHANCE_CALM_REQUESTED = "ENHANCE_CALM_REQUESTED",
  GOOSEFRABA = "GOOSEFRABA"
}

type BaseAction<TType extends ActionType, TPayload = undefined> = {
  type: TType;
  payload: TPayload;
};

export type DevServerInitialized = BaseAction<
  ActionType.DEV_SERVER_INITIALIZED,
  { port: number }
>;
export type DevServerChanged = BaseAction<
  ActionType.DEV_SERVER_CHANGED,
  ve.ServerAction
>;

export type Goosefraba = BaseAction<ActionType.GOOSEFRABA>;
export type EnhanceCalmRequested = BaseAction<
  ActionType.ENHANCE_CALM_REQUESTED
>;

export const devServerInitialized = actionCreator<DevServerInitialized>(
  ActionType.DEV_SERVER_INITIALIZED
);
export const devServerChanged = actionCreator<DevServerChanged>(
  ActionType.DEV_SERVER_CHANGED
);
export const goosefraba = actionCreator<Goosefraba>(ActionType.GOOSEFRABA);
export const enhanceCalmRequested = actionCreator<EnhanceCalmRequested>(
  ActionType.ENHANCE_CALM_REQUESTED
);

export type Action =
  | DevServerInitialized
  | DevServerChanged
  | Goosefraba
  | EnhanceCalmRequested;
