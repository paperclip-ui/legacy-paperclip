import { actionCreator } from "./base";
import { InstanceAction } from "./instance-actions";

export enum ServerActionType {
  INSTANCE_CHANGED = "INSTANCE_CHANGED"
}

export type BaseAction<TType extends ServerActionType, TPayload = undefined> = {
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

export const instanceChanged = actionCreator<InstanceChanged>(
  ServerActionType.INSTANCE_CHANGED
);

export type ServerAction = InstanceChanged;
