import { LoadedData } from "paperclip";
import { SecureVersion } from "tls";
import { AvailableBrowser } from "../state";
import { actionCreator } from "./base";
import { InstanceAction } from "./instance-actions";

export enum ServerActionType {
  INSTANCE_CHANGED = "INSTANCE_CHANGED",
  CRASHED = "CRASHED",
  ALL_PC_CONTENT_LOADED = "ALL_PC_CONTENT_LOADED",
  INIT_PARAM_DEFINED = "INIT_PARAM_DEFINED",
  BROWSERSTACK_BROWSERS_LOADED = "INIT_PARAM_BROWSERSTACK_BROWSERS_LOADEDDEFINED"
}

type BaseAction<TType extends ServerActionType, TPayload = undefined> = {
  type: TType;
  payload: TPayload;
};

export type InstanceChanged = BaseAction<
  ServerActionType.INSTANCE_CHANGED,
  {
    targetPCFileUri: string;
    action: InstanceAction;
  }
>;

export type InitParamsDefined = BaseAction<
  ServerActionType.INIT_PARAM_DEFINED,
  {
    readonly: boolean;
    availableBrowsers: AvailableBrowser[];
  }
>;

export type BrowserstackBrowsersLoaded = BaseAction<
  ServerActionType.BROWSERSTACK_BROWSERS_LOADED,
  AvailableBrowser[]
>;

export type AllPCContentLoaded = BaseAction<
  ServerActionType.ALL_PC_CONTENT_LOADED,
  Record<string, LoadedData>
>;

export type Crashed = BaseAction<ServerActionType.CRASHED>;

export const instanceChanged = actionCreator<InstanceChanged>(
  ServerActionType.INSTANCE_CHANGED
);
export const initParamsDefined = actionCreator<InitParamsDefined>(
  ServerActionType.INIT_PARAM_DEFINED
);
export const crashed = actionCreator<Crashed>(ServerActionType.CRASHED);
export const allPCContentLoaded = actionCreator<AllPCContentLoaded>(
  ServerActionType.ALL_PC_CONTENT_LOADED
);
export const browserstackBrowsersLoaded = actionCreator<
  BrowserstackBrowsersLoaded
>(ServerActionType.BROWSERSTACK_BROWSERS_LOADED);

export type ServerAction =
  | InstanceChanged
  | Crashed
  | AllPCContentLoaded
  | InitParamsDefined
  | BrowserstackBrowsersLoaded;
