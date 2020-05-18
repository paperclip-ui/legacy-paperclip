import { camelCase } from "lodash";
import * as path from "path";
import {
  getMetaValue,
  Node,
  Element,
  AS_ATTR_NAME,
  getAttributeStringValue
} from "paperclip";

export const RENAME_PROPS = {
  class: "className",
  autofocus: "autoFocus",
  autocomplete: "autoComplete",
  for: "htmlFor"
};

export type Options = {
  definition?: boolean;
};

export const pascalCase = (value: string) => {
  const newValue = camelCase(value);
  return newValue.charAt(0).toUpperCase() + newValue.substr(1);
};

export const getBaseComponentName = (root: Node, filePath: string) => {
  return `Base${getComponentName(root, filePath)}`;
};

export const getComponentName = (root: Node, filePath: string) => {
  return (
    getMetaValue("react-class", root) ||
    pascalCase(
      `${path
        .basename(filePath)
        .split(".")
        .shift()}View`
    )
  );
};

export const getPartClassName = (part: Element) => {
  return strToClassName(getAttributeStringValue(AS_ATTR_NAME, part));
};

export const strToClassName = (value: string) => {
  let safeClassName = value.replace(/[^\w_$]/g, "");

  if (!isNaN(Number(safeClassName.charAt(0)))) {
    safeClassName = "_" + safeClassName;
  }

  return safeClassName;
};

export const classNameToStyleName = (value: string) => {
  return value.charAt(0).toLowerCase() + value.substr(1);
};

export const getClassExportNameMap = (classNames: string[]) => {
  const map = {};
  for (const className of classNames) {
    const mapName = className.replace(/^_.*?_/g, "");

    if (!map[mapName]) {
      map[mapName] = className;
    } else {
      // combine class names in case they're defined in other imported styles
      map[mapName] = map[mapName] + " " + className;
    }
  }
  return map;
};
