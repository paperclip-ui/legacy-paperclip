import { actionCreator } from "./base";

export enum ExternalActionType {
  CONTENT_CHANGED = "CONTENT_CHANGED",
  CONFIG_CHANGED = "CONFIG_CHANGED"
}

type BaseAction<TType extends ExternalActionType, TPayload = undefined> = {
  type: TType;
  payload: TPayload;
};

export type ContentChanged = BaseAction<
  ExternalActionType.CONTENT_CHANGED,
  {
    fileUri: string;
    content: string;
  }
>;

export type ConfigChanged = BaseAction<
  ExternalActionType.CONFIG_CHANGED,
  {
    browserstackCredentials: {
      username: string;
      password: string;
    };
  }
>;

export const contentChanged = actionCreator<ContentChanged>(
  ExternalActionType.CONTENT_CHANGED
);
export const configChanged = actionCreator<ConfigChanged>(
  ExternalActionType.CONFIG_CHANGED
);

export type ExternalAction = ContentChanged | ConfigChanged;
