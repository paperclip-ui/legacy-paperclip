import { ExprSource } from "./base-virt";
import { memoize } from "./memo";

export enum VirtJsObjectKind {
  JsObject = "JsObject",
  JsArray = "JsArray",
  JsNumber = "JsNumber",
  JsString = "JsString"
}

type BaseVirtJsObject<TKind extends VirtJsObjectKind> = {
  kind: TKind;
};

export type VirtJsObject = {
  values: Record<string, VirtJsValue>;
  source: ExprSource;
} & BaseVirtJsObject<VirtJsObjectKind.JsObject>;
export type VirtJsArray = {
  values: VirtJsValue[];
} & BaseVirtJsObject<VirtJsObjectKind.JsArray>;
export type VirtJsNumber = {
  value: number;
} & BaseVirtJsObject<VirtJsObjectKind.JsNumber>;
export type VirtJsString = {
  value: string;
} & BaseVirtJsObject<VirtJsObjectKind.JsString>;

export type VirtJsValue =
  | VirtJsObject
  | VirtJsArray
  | VirtJsNumber
  | VirtJsString;

export const computeVirtJSObject = memoize((obj: VirtJsObject) => {
  const values = {};
  for (const key in obj.values) {
    values[key] = computeVirtJSValue(obj.values[key]);
  }
  return values;
});

export const toVirtJsValue = memoize((value: any) => {
  if (Array.isArray(value)) {
    return {
      kind: VirtJsObjectKind.JsArray,
      values: value.map(toVirtJsValue)
    };
  } else if (value && typeof value === "object") {
    const values = {};
    for (const k in value) {
      values[k] = toVirtJsValue(value[k]);
    }
    return {
      kind: VirtJsObjectKind.JsObject,
      values
    };
  } else if (typeof value === "number") {
    return {
      kind: VirtJsObjectKind.JsNumber,
      value
    };
  } else if (typeof value === "string") {
    return {
      kind: VirtJsObjectKind.JsString,
      value
    };
  }
});

export const computeVirtJSValue = memoize((obj: VirtJsValue) => {
  switch (obj.kind) {
    case VirtJsObjectKind.JsObject: {
      return computeVirtJSObject(obj);
    }
    case VirtJsObjectKind.JsArray: {
      return obj.values.map(computeVirtJSValue);
    }
    case VirtJsObjectKind.JsString:
    case VirtJsObjectKind.JsNumber: {
      return obj.value;
    }
  }
});
