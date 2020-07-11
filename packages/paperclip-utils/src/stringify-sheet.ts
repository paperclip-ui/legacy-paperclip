export const stringifyCSSSheet = (sheet, resourcePrefix: string | null) => {
  return sheet.rules
    .map(rule => stringifyCSSRule(rule, resourcePrefix))
    .join("\n");
};

const stringifyCSSRule = (rule, protocol) => {
  switch (rule.kind) {
    case "Style":
      return stringifyStyleRule(rule, protocol);
    case "Page":
    case "Supports":
    case "Media":
      return stringifyConditionRule(rule, protocol);
    case "FontFace":
      return stringifyFontFaceRule(rule, protocol);
    case "Keyframes":
      return stringifyKeyframesRule(rule, protocol);
  }
};

const stringifyConditionRule = (
  { name, condition_text, rules },
  protocol?: string
) => {
  return `@${name} ${condition_text} {
    ${rules.map(style => stringifyStyleRule(style, protocol)).join("\n")}
  }`;
};

const stringifyKeyframesRule = ({ name, rules }, protocol?: string) => {
  return `@keyframes ${name} {
    ${rules.map(style => stringifyKeyframeRule(style, protocol)).join("\n")}
  }`;
};

const stringifyKeyframeRule = ({ key, style }, protocol?: string) => {
  return `${key} {
    ${style.map(style => stringifyStyle(style, protocol)).join("\n")}
  }`;
};

const stringifyFontFaceRule = ({ style }, protocol?: string) => {
  return `@font-face {
    ${style.map(style => stringifyStyle(style, protocol)).join("\n")}
  }`;
};

const stringifyStyleRule = ({ selector_text, style }, protocol: string) => {
  return `${selector_text} {
    ${style.map(style => stringifyStyle(style, protocol)).join("\n")}
  }`;
};

const stringifyStyle = ({ name, value }, protocol) =>
  `${name}:${value && protocol ? value.replace(/file:/, protocol) : value};`;
