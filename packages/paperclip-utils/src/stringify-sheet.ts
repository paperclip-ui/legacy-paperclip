import * as path from "path";
import { relative } from "path";
import * as url from "url";

export const stringifyCSSSheet = (
  sheet,
  protocol: string | null,
  uri?: string
) => {
  return sheet.rules
    .map(rule => stringifyCSSRule(rule, protocol, uri))
    .join("\n");
};

const stringifyCSSRule = (rule, protocol, uri) => {
  switch (rule.kind) {
    case "Style":
      return stringifyStyleRule(rule, protocol, uri);
    case "Page":
    case "Supports":
    case "Media":
      return stringifyConditionRule(rule, protocol, uri);
    case "FontFace":
      return stringifyFontFaceRule(rule, protocol, uri);
    case "Keyframes":
      return stringifyKeyframesRule(rule, protocol);
  }
};

const stringifyConditionRule = (
  { name, condition_text, rules },
  protocol?: string,
  uri?: string
) => {
  return `@${name} ${condition_text} {
    ${rules.map(style => stringifyStyleRule(style, protocol, uri)).join("\n")}
  }`;
};

const stringifyKeyframesRule = (
  { name, rules },
  protocol?: string,
  uri?: string
) => {
  return `@keyframes ${name} {
    ${rules.map(style => stringifyKeyframeRule(style, protocol)).join("\n")}
  }`;
};

const stringifyKeyframeRule = (
  { key, style },
  protocol?: string,
  uri?: string
) => {
  return `${key} {
    ${style.map(style => stringifyStyle(style, protocol, uri)).join("\n")}
  }`;
};

const stringifyFontFaceRule = ({ style }, protocol?: string, uri?: string) => {
  return `@font-face {
    ${style.map(style => stringifyStyle(style, protocol, uri)).join("\n")}
  }`;
};

const stringifyStyleRule = (
  { selector_text, style },
  protocol: string,
  uri: string
) => {
  return `${selector_text} {
    ${style.map(style => stringifyStyle(style, protocol, uri)).join("\n")}
  }`;
};

const stringifyStyle = ({ name, value }, protocol, uri) => {
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
    if (protocol) {
      value = value.replace(/file:/, protocol);
    }
  }

  return `${name}:${value};`;
};
