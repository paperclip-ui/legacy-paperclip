/*

For copying declaration names:

https://www.w3schools.com/cssref/

Paste into console: Array.from(document.querySelectorAll("tr > td > a")).map(a => a.textContent).filter(content => content.charAt(0) !== "@");

Copy printed object


*/

import { CSS_DECLARATION_VALUE_MAP } from "./css-declaration-constants";

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

const CSS_DECLARATION_NAMES = Object.keys(CSS_DECLARATION_VALUE_MAP);

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

// https://www.w3schools.com/cssref/css3_pr_flex-direction.asp
const FLEX_DIRECTION_VALUES = [
  "row",
  "row-reverse",
  "column",
  "column-reverse",
  "initial",
  "inherit"
];

// https://www.w3schools.com/cssref/css3_pr_text-overflow.asp
const TEXT_OVERFLOW_VALUES = [
  "clip",
  "ellipsis",
  "string",
  "initial",
  "inherit"
];

// https://www.w3schools.com/cssref/pr_pos_vertical-align.asp
const VERTICAL_ALIGN_VALUES = [
  "baseline",
  "length",
  "sub",
  "super",
  "top",
  "text-bottom",
  "middle",
  "bottom",
  "text-bottom",
  "initial",
  "inherit"
];

// https://www.w3schools.com/css/css_overflow.asp
const OVERFLOW_VALUES = ["visible", "hidden", "scroll", "auto"];

// https://www.w3schools.com/cssref/css3_pr_animation-name.asp
const ANIMATION_NAME_VALUES = ["none", "initial", "inhert"];

// https://www.w3schools.com/cssref/css3_pr_animation-timing-function.asp

// TODO - cub-bezie, steps
const ANIMATION_TIMING_FUNCTION = "plinear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|initial|inherit".split(
  "|"
);

// https://www.w3schools.com/cssref/pr_background-repeat.asp
const BACKGROUND_REPEAT_VALUES = [
  "repeat",
  "repeat-x",
  "repeat-y",
  "no-repeat",
  "initial",
  "inherit"
];

// https://www.w3schools.com/cssref/css3_pr_animation-iteration-count.asp
const ANIMATION_ITERATION_COUNT = "infinite|initial|inherit".split("|");

const ANIMATION_DIRECTION = "normal|reverse|alternate|alternate-reverse|initial|inherit".split(
  "|"
);

export { CSS_AT_RULE_NAMES, CSS_DECLARATION_NAMES, CSS_DECLARATION_VALUE_MAP };
