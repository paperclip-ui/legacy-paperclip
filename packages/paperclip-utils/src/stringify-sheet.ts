import * as path from "path";
import { relative, resolve } from "path";
import * as url from "url";

export type StringifySheetOptions = {
  resolveUrl?: (url: string) => string;
  uri?: string;
};

export const stringifyCSSSheet = (
  sheet,
  options: StringifySheetOptions = {}
) => {
  return sheet.rules.map(rule => stringifyCSSRule(rule, options)).join("\n");
};

export const stringifyCSSRule = (rule, options: StringifySheetOptions = {}) => {
  switch (rule.kind) {
    case "Style":
      return stringifyStyleRule(rule, options);
    case "Page":
    case "Supports":
    case "Media":
      return stringifyConditionRule(rule, options);
    case "FontFace":
      return stringifyFontFaceRule(rule, options);
    case "Keyframes":
      return stringifyKeyframesRule(rule, options);
  }
};

const stringifyConditionRule = (
  { name, conditionText, rules },
  options: StringifySheetOptions
) => {
  return `@${name} ${conditionText} {
    ${rules.map(style => stringifyCSSRule(style, options)).join("\n")}
  }`;
};

const stringifyKeyframesRule = (
  { name, rules },
  options: StringifySheetOptions
) => {
  return `@keyframes ${name} {
    ${rules.map(style => stringifyKeyframeRule(style, options)).join("\n")}
  }`;
};

const stringifyKeyframeRule = (
  { key, style },
  options: StringifySheetOptions
) => {
  return `${key} {
    ${style.map(style => stringifyStyle(style, options)).join("\n")}
  }`;
};

const stringifyFontFaceRule = ({ style }, options: StringifySheetOptions) => {
  return `@font-face {
    ${style.map(style => stringifyStyle(style, options)).join("\n")}
  }`;
};

const stringifyStyleRule = (
  { selector_text, style },
  options: StringifySheetOptions
) => {
  return `${selector_text} {
    ${style.map(style => stringifyStyle(style, options)).join("\n")}
  }`;
};

const stringifyStyle = (
  { name, value },
  { uri, resolveUrl }: StringifySheetOptions
) => {
  if (value) {
    // required for bundling, otherwise file protocol is maintained
    if (uri) {
      const urls = value.match(/(file:\/\/.*?)(?=['")])/g) || [];
      const selfPathname = url.fileURLToPath(uri);
      for (const foundUrl of urls) {
        const pathname = url.fileURLToPath(foundUrl);
        let relativePath = path.relative(path.dirname(selfPathname), pathname);
        if (relativePath.charAt(0) !== ".") {
          relativePath = "./" + relativePath;
        }

        value = value.replace(foundUrl, relativePath);
      }
    }

    if (value && value.includes("file:") && resolveUrl) {
      const url = value.match(/(file:\/\/[^)]+)/)[1];
      value = value.replace(url, resolveUrl(url));
    }
  }

  return `${name}:${value};`;
};
