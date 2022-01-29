import { ExprTextSource } from "../base/virt";
import { memoize } from "../core/memo";

export enum VirtScriptObjectKind {
  Object = "Object",
  Array = "Array",
  Boolean = "Boolean",
  Number = "Number",
  Str = "Str",
}

type BaseVirtScriptObject<TKind extends VirtScriptObjectKind> = {
  kind: TKind;
};

export type VirtScriptObject = {
  values: Record<string, VirtJsValue>;
  sourceId: string;
} & BaseVirtScriptObject<VirtScriptObjectKind.Object>;
export type VirtScriptArray = {
  values: VirtJsValue[];
} & BaseVirtScriptObject<VirtScriptObjectKind.Array>;
export type VirtScriptNumber = {
  value: number;
} & BaseVirtScriptObject<VirtScriptObjectKind.Number>;
export type VirtScriptBoolean = {
  value: boolean;
} & BaseVirtScriptObject<VirtScriptObjectKind.Boolean>;
export type VirtScriptString = {
  value: string;
} & BaseVirtScriptObject<VirtScriptObjectKind.Str>;

export type VirtJsValue =
  | VirtScriptObject
  | VirtScriptArray
  | VirtScriptNumber
  | VirtScriptBoolean
  | VirtScriptString;

export const computeVirtScriptObject = memoize((obj: VirtScriptObject) => {
  const values = {};
  for (const key in obj.values) {
    values[key] = computeVirtScriptValue(obj.values[key]);
  }
  return values;
});

export const toVirtScriptValue = memoize((value: any) => {
  if (Array.isArray(value)) {
    return {
      kind: VirtScriptObjectKind.Array,
      values: value.map(toVirtScriptValue),
    };
  } else if (value && typeof value === "object") {
    const values = {};
    for (const k in value) {
      values[k] = toVirtScriptValue(value[k]);
    }
    return {
      kind: VirtScriptObjectKind.Object,
      values,
    };
  } else if (typeof value === "number") {
    return {
      kind: VirtScriptObjectKind.Number,
      value,
    };
  } else if (typeof value === "string") {
    return {
      kind: VirtScriptObjectKind.Str,
      value,
    };
  } else if (typeof value === "boolean") {
    return {
      kind: VirtScriptObjectKind.Boolean,
      value,
    };
  }
});

export const computeVirtScriptValue = memoize((obj: VirtJsValue) => {
  switch (obj.kind) {
    case VirtScriptObjectKind.Object: {
      return computeVirtScriptObject(obj);
    }
    case VirtScriptObjectKind.Array: {
      return obj.values.map(computeVirtScriptValue);
    }
    case VirtScriptObjectKind.Str:
    case VirtScriptObjectKind.Boolean:
    case VirtScriptObjectKind.Number: {
      return obj.value;
    }
  }
});
