import { ColorFormat } from "./state";
import Color from "zeplin-extension-style-kit/values/color";
import * as cssEscape from "css.escape";
import { camelCase } from "lodash";

export const stringifyColor = (color: any, colorFormat: ColorFormat) => {
  const kitColor = new Color(color);
  return kitColor.toStyleValue({ colorFormat }, {});
};
export const generateIdentifier = str => {
  let escapedStr = str
    .trim()
    .replace(/[^\s\w-]/g, "")
    .replace(/^(-?\d+)+/, "")
    .replace(/\s+/g, "-");

  escapedStr = cssEscape(escapedStr);

  return escapedStr;
};

export const pascalCase = (name: string) => {
  name = camelCase(name);
  return name.charAt(0).toUpperCase() + name.substr(1);
};
