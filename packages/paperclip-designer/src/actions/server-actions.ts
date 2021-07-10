import { LoadedData } from "paperclip";
import { ContentChange } from "paperclip-source-writer";
import { ExprSource } from "paperclip-utils";
import { AvailableBrowser, VirtualNodeSourceInfo } from "../state";
import { actionCreator } from "./base";
import { InstanceAction } from "./instance-actions";

export enum ServerActionType {
  INSTANCE_CHANGED = "INSTANCE_CHANGED",
  CRASHED = "CRASHED",
  ALL_PC_CONTENT_LOADED = "ALL_PC_CONTENT_LOADED",
  REVEAL_EXPRESSION_SOURCE_REQUESTED = "REVEAL_EXPRESSION_SOURCE_REQUESTED",
  INIT_PARAM_DEFINED = "INIT_PARAM_DEFINED",
  BROWSERSTACK_BROWSERS_LOADED = "INIT_PARAM_BROWSERSTACK_BROWSERS_LOADEDDEFINED",
  PC_SOURCE_EDITED = "PC_SOURCE_EDITED",
  VIRTUAL_NODE_SOURCES_LOADED = "VIRTUAL_NODE_SOURCES_LOADED"
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

export type RevealExpressionSourceRequested = BaseAction<
  ServerActionType.REVEAL_EXPRESSION_SOURCE_REQUESTED,
  ExprSource
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

export type PCSourceEdited = BaseAction<
  ServerActionType.PC_SOURCE_EDITED,
  Record<string, ContentChange[]>
>;

export type Crashed = BaseAction<ServerActionType.CRASHED>;
export type VirtualNodeSourcesLoaded = BaseAction<
  ServerActionType.VIRTUAL_NODE_SOURCES_LOADED,
  Array<VirtualNodeSourceInfo>
>;

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
export const revealExpressionSourceRequested = actionCreator<
  RevealExpressionSourceRequested
>(ServerActionType.REVEAL_EXPRESSION_SOURCE_REQUESTED);

export const virtualNodeSourcesLoaded = actionCreator<VirtualNodeSourcesLoaded>(
  ServerActionType.VIRTUAL_NODE_SOURCES_LOADED
);
export const pcSourceEdited = actionCreator<PCSourceEdited>(
  ServerActionType.PC_SOURCE_EDITED
);

export type ServerAction =
  | InstanceChanged
  | RevealExpressionSourceRequested
  | VirtualNodeSourcesLoaded
  | Crashed
  | PCSourceEdited
  | AllPCContentLoaded
  | InitParamsDefined
  | BrowserstackBrowsersLoaded;
