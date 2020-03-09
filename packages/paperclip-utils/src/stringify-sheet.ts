export const stringifyCSSSheet = (sheet, protocol: string | null) => {
  return sheet.rules.map(rule => stringifyCSSRule(rule, protocol)).join("\n");
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
