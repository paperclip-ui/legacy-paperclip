import { actionCreator } from "./base";
import { Action as VisualEditorAction } from "paperclip-visual-editor";

// to be used with sendNotification
export const $$ACTION_NOTIFICATION = "$$ACTION_NOTIFICATION";

export enum ActionType {
  DEV_SERVER_INITIALIZED = "DEV_SERVER_INITIALIZED",
  DEV_SERVER_CHANGED = "DEV_SERVER_CHANGED"
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
  VisualEditorAction
>;

export const devServerInitialized = actionCreator<DevServerInitialized>(
  ActionType.DEV_SERVER_INITIALIZED
);
export const devServerChanged = actionCreator<DevServerChanged>(
  ActionType.DEV_SERVER_CHANGED
);

export type Action = DevServerInitialized | DevServerChanged;
