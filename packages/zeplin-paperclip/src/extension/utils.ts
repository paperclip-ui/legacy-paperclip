import cssEscape from "css.escape";

export const generateIdentifier = str => {
  let escapedStr = str
    .trim()
    .replace(/[^\s\w-]/g, "")
    .replace(/^(-?\d+)+/, "")
    .replace(/\s+/g, "-");

  escapedStr = cssEscape(escapedStr);

  return escapedStr;
};
