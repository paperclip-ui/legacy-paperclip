import { StringDecoder } from "string_decoder";

export enum VirtJsObjectKind {
  VirtJsObject = "VirtJsObject",
  VirtJsArray = "VirtJsArray",
  VirtJsNumber = "VirtJsNumber",
  VirtJsString = "VirtJsString"
}

type BaseVirtJsObject<TKind extends VirtJsObjectKind> = {
  kind: TKind;
};

export type VirtJsObject = {
  values: Record<string, VirtJsValue>;
} & BaseVirtJsObject<VirtJsObjectKind.VirtJsObject>;
export type VirtJsArray = {
  values: VirtJsValue[];
} & BaseVirtJsObject<VirtJsObjectKind.VirtJsArray>;
export type VirtJsNumber = {
  value: number;
} & BaseVirtJsObject<VirtJsObjectKind.VirtJsNumber>;
export type VirtJsString = {
  value: string;
} & BaseVirtJsObject<VirtJsObjectKind.VirtJsString>;

export type VirtJsValue =
  | VirtJsObject
  | VirtJsArray
  | VirtJsNumber
  | VirtJsString;
