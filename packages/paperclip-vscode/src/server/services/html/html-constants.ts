import { merge } from "lodash";

const NATIVE_VISIBLE_TAGS = [
  "a",
  "b",
  "body",
  "button",
  "canvas",
  "nav",
  "img",
  "i",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "footer",
  "form",
  "div",
  "iframe",
  "input",
  "ul",
  "tbody",
  "td",
  "span",
  "p",
  "ol",
  "li"
];
const NATIVE_INVISIBLE_TAGS = [];

export const NATIVE_TAG_NAMES = [
  ...NATIVE_VISIBLE_TAGS,
  ...NATIVE_INVISIBLE_TAGS,
  "abbr",
  "acronym",
  "address",
  "applet",
  "area",
  "article",
  "aside",
  "audio",
  "base",
  "basefont",
  "bdi",
  "bdo",
  "bgsound",
  "big",
  "blink",
  "blockquote",
  "br",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "command",
  "content",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "dir",
  "dl",
  "dt",
  "element",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "font",
  "frame",
  "frameset",
  "head",
  "header",
  "hgroup",
  "html",
  "image",
  "ins",
  "isindex",
  "kbd",
  "keygen",
  "label",
  "legend",
  "link",
  "listing",
  "main",
  "map",
  "mark",
  "marquee",
  "math",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "multicol",
  "nextid",
  "nobr",
  "noembed",
  "noframes",
  "noscript",
  "object",
  "optgroup",
  "option",
  "output",
  "param",
  "picture",
  "plaintext",
  "pre",
  "progress",
  "q",
  "rb",
  "rbc",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "shadow",
  "slot",
  "small",
  "source",
  "spacer",
  "strike",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "svg",
  "table",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "tt",
  "u",
  "var",
  "video",
  "wbr",
  "xmp"
].sort();

const RESERVED_TAG_NAMES = ["import"];

const ALL_TAG_NAMES = [...NATIVE_TAG_NAMES, ...RESERVED_TAG_NAMES].sort();

// https://www.w3.org/TR/html401/struct/global.html#h-7.5.4
const VISIBLE_ELEMENT_ATTRIBUTE_NAMES = [
  "id",
  "style",
  "className",
  "onClick",
  "onDoubleClick",
  "onMouseDown",
  "onMouseUp",
  "onMouseOver",
  "onMouseMove",
  "onMouseOut",
  "onKeyPress",
  "onKeyDown",
  "onKeyUp"
];

let ELEMENT_ATTRIBUTES: Record<string, string[]> = ALL_TAG_NAMES.reduce(
  (obj, tagName) => {
    obj[tagName] = [];
    return obj;
  },
  {}
);

ELEMENT_ATTRIBUTES = merge({}, ELEMENT_ATTRIBUTES, {
  import: ["src", "as"]
});

for (const tagName of NATIVE_TAG_NAMES) {
  if (NATIVE_VISIBLE_TAGS.includes(tagName)) {
    ELEMENT_ATTRIBUTES[tagName] = [
      ...ELEMENT_ATTRIBUTES[tagName],
      ...VISIBLE_ELEMENT_ATTRIBUTE_NAMES
    ];
  }
}

export { ELEMENT_ATTRIBUTES, ALL_TAG_NAMES };
