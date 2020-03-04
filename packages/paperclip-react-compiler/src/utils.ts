import { camelCase } from "lodash";
import * as path from "path";
import {
  getMetaValue,
  Node,
  Element,
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
  return pascalCase(getAttributeStringValue("id", part));
};
