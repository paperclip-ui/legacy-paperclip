import { ExportSettings } from "./state";

export const CONFIG_FILE_NAME = "figmark.json";
export const PC_CONFIG_FILE_NAME = "pcconfig.json";
export const PC_FILE_EXTENSION = ".pc";
export const DEPENDENCIES_NAMESPACE = "dependencies";
export const DEFAULT_COMPILER_TARGET_NAME = "@paperclip-ui/compiler-react";
export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  suffix: "",
  format: "SVG",
  constraint: { value: 1, type: "SCALE" }
};
export const EMPTY_ARRAY = [];
