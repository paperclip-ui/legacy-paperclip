import { ExprTextSource } from "../base/virt";
import { memoize } from "../core/memo";

export enum VirtJsObjectKind {
  JsObject = "JsObject",
  ScriptArray = "ScriptArray",
  JsBoolean = "JsBoolean",
  JsNumber = "JsNumber",
  ScriptString = "ScriptString"
}

type BaseVirtJsObject<TKind extends VirtJsObjectKind> = {
  kind: TKind;
};

export type VirtJsObject = {
  values: Record<string, VirtJsValue>;
  source: ExprTextSource;
} & BaseVirtJsObject<VirtJsObjectKind.JsObject>;
export type VirtScriptArray = {
  values: VirtJsValue[];
} & BaseVirtJsObject<VirtJsObjectKind.ScriptArray>;
export type VirtJsNumber = {
  value: number;
} & BaseVirtJsObject<VirtJsObjectKind.JsNumber>;
export type VirtJsBoolean = {
  value: boolean;
} & BaseVirtJsObject<VirtJsObjectKind.JsBoolean>;
export type VirtScriptString = {
  value: string;
} & BaseVirtJsObject<VirtJsObjectKind.ScriptString>;

export type VirtJsValue =
  | VirtJsObject
  | VirtScriptArray
  | VirtJsNumber
  | VirtJsBoolean
  | VirtScriptString;

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
      kind: VirtJsObjectKind.ScriptArray,
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
      kind: VirtJsObjectKind.ScriptString,
      value
    };
  } else if (typeof value === "boolean") {
    return {
      kind: VirtJsObjectKind.JsBoolean,
      value
    };
  }
});

export const computeVirtJSValue = memoize((obj: VirtJsValue) => {
  switch (obj.kind) {
    case VirtJsObjectKind.JsObject: {
      return computeVirtJSObject(obj);
    }
    case VirtJsObjectKind.ScriptArray: {
      return obj.values.map(computeVirtJSValue);
    }
    case VirtJsObjectKind.ScriptString:
    case VirtJsObjectKind.JsBoolean:
    case VirtJsObjectKind.JsNumber: {
      return obj.value;
    }
  }
});
