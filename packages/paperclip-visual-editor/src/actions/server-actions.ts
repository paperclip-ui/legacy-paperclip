import { LoadedData } from "paperclip";
import { actionCreator } from "./base";
import { InstanceAction } from "./instance-actions";

export enum ServerActionType {
  INSTANCE_CHANGED = "INSTANCE_CHANGED",
  CRASHED = "CRASHED",
  ALL_PC_CONTENT_LOADED = "ALL_PC_CONTENT_LOADED"
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

export type AllPCContentLoaded = BaseAction<
  ServerActionType.ALL_PC_CONTENT_LOADED,
  Record<string, LoadedData>
>;

export type Crashed = BaseAction<ServerActionType.CRASHED>;

export const instanceChanged = actionCreator<InstanceChanged>(
  ServerActionType.INSTANCE_CHANGED
);
export const crashed = actionCreator<Crashed>(ServerActionType.CRASHED);
export const allPCContentLoaded = actionCreator<AllPCContentLoaded>(
  ServerActionType.ALL_PC_CONTENT_LOADED
);

export type ServerAction = InstanceChanged | Crashed | AllPCContentLoaded;
