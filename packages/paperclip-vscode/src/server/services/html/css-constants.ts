/*

For copying declaration names:

https://www.w3schools.com/cssref/

Paste into console: Array.from(document.querySelectorAll("tr > td > a")).map(a => a.textContent).filter(content => content.charAt(0) !== "@");

Copy printed object


*/

// https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
const CSS_AT_RULE_NAMES = [
  "media",
  "font-face",
  "keyframes",
  "namespace",
  "charset",

  // custom
  "mixin"
].sort();

const CSS_DECLARATION_NAMES = [
  "align-content",
  "align-items",
  "align-self",
  "all",
  "animation",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-timing-function",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-repeat",
  "background-size",
  "border",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-decoration-break",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "color",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "content",
  "counter-increment",
  "counter-reset",
  "cursor",
  "direction",
  "display",
  "empty-cells",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "font",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-size",
  "font-size-adjust",
  "font-stretch",
  "font-style",
  "font-variant",
  "font-variant-caps",
  "font-weight",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-gap",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-gap",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphens",
  "isolation",
  "justify-content",
  "left",
  "letter-spacing",
  "line-height",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "margin-top",
  "max-height",
  "max-width",
  "min-height",
  "min-width",
  "mix-blend-mode",
  "object-fit",
  "object-position",
  "opacity",
  "order",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-x",
  "overflow-y",
  "padding",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "padding-top",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "perspective",
  "perspective-origin",
  "pointer-events",
  "position",
  "quotes",
  "resize",
  "right",
  "scroll-behavior",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-last",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-style",
  "text-indent",
  "text-justify",
  "text-overflow",
  "text-shadow",
  "text-transform",
  "top",
  "transform",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "unicode-bidi",
  "direction",
  "user-select",
  "vertical-align",
  "visibility",
  "white-space",
  "width",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "z-index"
];

// https://www.w3schools.com/cssref/pr_text_white-space.asp
const WHITE_SPACE_VALUES = [
  "normal",
  "nowrap",
  "pre",
  "pre-line",
  "pre-wrap",
  "initial",
  "inherit"
];

// https://www.w3schools.com/cssref/css3_pr_animation-name.asp
const ANIMATION_NAME_VALUES = ["none", "initial", "inhert"];

// https://www.w3schools.com/cssref/css3_pr_animation-timing-function.asp
const ANIMATION_TIMING_FUNCTION = [
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "step-start",
  "step-end"
];

// https://www.w3schools.com/cssref/css3_pr_animation-iteration-count.asp
const ANIMATION_ITERATION_COUNT = ["infinite"];

// https://www.w3schools.com/cssref/css3_pr_animation-direction.asp
const ANIMATION_DIRECTION = [
  "normal",
  "reserve",
  "alternate",
  "alternate-reverse"
];

// https://www.w3schools.com/cssref/css3_pr_animation-fill-mode.asp
const ANIMATION_FILL_MODE = ["backwards", "both"];

// https://www.w3schools.com/cssref/css3_pr_animation-play-state.asp
const ANIMATION_PLAY_STATE = ["paused", "running"];

const CSS_DECLARATION_VALUE_ITEMS = {
  // https://www.w3schools.com/cssref/pr_class_display.asp
  display: [
    "inline",
    "block",
    "contents",
    "flex",
    "grid",
    "inline-block",
    "inline-flex",
    "inline-grid",
    "inline-table",
    "list-item",
    "run-in",
    "table",
    "table-caption",
    "table-column-group",
    "table-header-group",
    "table-footer-group",
    "table-row-group",
    "table-cell",
    "table-column",
    "table-row",
    "none",
    "initial",
    "inherit"
  ].sort(),
  animation: [
    ...ANIMATION_NAME_VALUES,
    ...ANIMATION_TIMING_FUNCTION,
    ...ANIMATION_ITERATION_COUNT,
    ...ANIMATION_DIRECTION
  ],
  "animation-name": [...ANIMATION_NAME_VALUES],
  "white-space": [...WHITE_SPACE_VALUES]
};

export {
  CSS_AT_RULE_NAMES,
  CSS_DECLARATION_NAMES,
  CSS_DECLARATION_VALUE_ITEMS
};
