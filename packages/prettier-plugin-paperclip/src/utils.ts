// https://www.w3schools.com/html/html_blocks.asp

const INLINE_TAG_NAMES = [
  "a",
  "i",
  "object",
  "small",
  "time",
  "abbr",
  "button",
  "img",
  "output",
  "span",
  "tt",
  "acronym",
  "cite",
  "input",
  "q",
  "strong",
  "var",
  "b",
  "code",
  "kbd",
  "samp",
  "sub",
  "bdo",
  "dfn",
  "label",
  "sup",
  "big",
  "em",
  "map",
  "select",
  "textarea"
];

export const isBlockTagName = (name: string) =>
  !INLINE_TAG_NAMES.includes(name);
