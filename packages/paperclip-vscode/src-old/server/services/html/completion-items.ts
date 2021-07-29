import {
  stringArrayToAutoCompleteItems,
  RETRIGGER_COMMAND,
  tagCompletionItem
} from "./utils";
import {
  CompletionItemKind,
  CompletionItem,
  InsertTextFormat
} from "vscode-languageserver";
import {
  CSS_DECLARATION_NAMES,
  CSS_DECLARATION_VALUE_MAP,
  CSS_AT_RULE_NAMES
} from "./css-constants";
import { ELEMENT_ATTRIBUTES, ALL_TAG_NAMES } from "./html-constants";
import { merge } from "lodash";

const ATTRIBUTE_NAME_COMPLETION_ITEMS = {};

for (const tagName in ELEMENT_ATTRIBUTES) {
  ATTRIBUTE_NAME_COMPLETION_ITEMS[tagName] = [];

  for (const attrName of ELEMENT_ATTRIBUTES[tagName]) {
    let item: CompletionItem = {
      label: attrName
    };

    if (tagName === "import" && attrName === "src") {
      item = {
        ...item,
        insertText: `src="$1"`,
        insertTextFormat: InsertTextFormat.Snippet,
        command: RETRIGGER_COMMAND
      };
    } else if (attrName === "as" || attrName === "className") {
      item = {
        ...item,
        insertText: `${attrName}="$1"`,
        insertTextFormat: InsertTextFormat.Snippet
      };
    }

    ATTRIBUTE_NAME_COMPLETION_ITEMS[tagName].push(item);
  }
}

const TAG_NAME_COMPLETION_ITEMS = [];

for (const tagName of ALL_TAG_NAMES) {
  const item = tagCompletionItem(
    tagName,
    ATTRIBUTE_NAME_COMPLETION_ITEMS[tagName].length > 0
  );
  TAG_NAME_COMPLETION_ITEMS.push(item);
}

const AT_RULE_COMPLETION_ITEMS = [];

for (const name of CSS_AT_RULE_NAMES) {
  AT_RULE_COMPLETION_ITEMS.push({
    label: name,
    insertText: `${name} `,
    insertTextFormat: InsertTextFormat.Snippet
  });
}

/**
 * CSS Declaration name completion items
 */

const CSS_DECLARATION_NAME_COMPLETION_ITEMS = stringArrayToAutoCompleteItems(
  CSS_DECLARATION_NAMES
).map(
  ({ label }): CompletionItem => {
    if (label === "box-shadow") {
      return {
        label: "box-shadow",
        insertText:
          "box-shadow: ${1:offset-x} ${2:offset-y} ${3:blur} ${4:spread} ${5:color};",
        insertTextFormat: InsertTextFormat.Snippet
      };
    }

    return {
      label,
      kind: CompletionItemKind.Property,
      insertText: label + ": ${1:};",
      insertTextFormat: InsertTextFormat.Snippet,
      command: CSS_DECLARATION_VALUE_MAP[label]?.length
        ? RETRIGGER_COMMAND
        : null,
      data: {
        cssDeclarationName: label
      }
    };
  }
);

CSS_DECLARATION_NAME_COMPLETION_ITEMS.push({
  label: "box-shadow inset",
  insertText:
    "box-shadow: inset ${1:offset-x} ${2:offset-y} ${3:blur} ${4:spread} ${5:color};",
  insertTextFormat: InsertTextFormat.Snippet
});

/**
 * CSS Declaration value completion items
 */

let CSS_DECLARATION_VALUE_COMPLETION_ITEMS: Record<
  string,
  CompletionItem[]
> = {};

for (const name in CSS_DECLARATION_VALUE_MAP) {
  const values = CSS_DECLARATION_VALUE_MAP[name];
  CSS_DECLARATION_VALUE_COMPLETION_ITEMS[name] = values.map(
    (value): CompletionItem => ({
      label: value,
      insertText: value
    })
  );
}

const URL_COMPLETION_ITEM: CompletionItem = {
  label: "url",
  detail: "url()",
  insertText: "url($1)",
  insertTextFormat: InsertTextFormat.Snippet,
  command: RETRIGGER_COMMAND
};

const ANIMATION_TIMING_FUNCTION_COMPLETION_ITEMS: CompletionItem[] = [
  {
    label: "steps",
    detail: "steps(int, start|end)",
    insertText: "steps($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "cubic-bezier",
    detail: "cubic-bezier(n, n, n, n)",
    insertText: "cubic-bezier($1)",
    insertTextFormat: InsertTextFormat.Snippet
  }
];

const BACKGROUND_IMAGE_COMPLETION_ITEMS: CompletionItem[] = [
  URL_COMPLETION_ITEM,
  {
    label: "linear-gradient",
    detail: "linear-gradient()",
    insertText: "linear-gradient($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "radial-gradient",
    detail: "radial-gradient()",
    insertText: "radial-gradient($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "repeating-linear-gradient",
    detail: "repeating-linear-gradient()",
    insertText: "repeating-linear-gradient($1)",
    insertTextFormat: InsertTextFormat.Snippet
  }
];

const CONTENT_COMPLETION_ITEMS: CompletionItem[] = [
  URL_COMPLETION_ITEM,
  {
    label: "attr",
    detail: "attr(attribute)",
    insertText: "attr($1)",
    insertTextFormat: InsertTextFormat.Snippet
  }
];

const GRID_AUTO_COLUMNS_COMPLETION_ITEMS: CompletionItem[] = [
  {
    label: "fit-content",
    detail: "fit-content(unit)",
    insertText: "fit-content($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "minmax",
    detail: "minmax(min, max)",
    insertText: "minmax(${1:min}, ${2:max})",
    insertTextFormat: InsertTextFormat.Snippet
  }
];

const FILTER_COMPLETION_ITEMS: CompletionItem[] = [
  URL_COMPLETION_ITEM,
  {
    label: "blur",
    detail: "blur(px)",
    insertText: "blur($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "brightness",
    detail: "brightness(%)",
    insertText: "brightness($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "contrast",
    detail: "contrast(%)",
    insertText: "contrast($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "drop-shadow",
    detail: "drop-shadow()",
    insertText: "drop-shadow(${1:h-shadow} ${2:v-shadow} ${3:blur} ${5:color})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "grayscale",
    detail: "grayscale(%)",
    insertText: "grayscale($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "hue-rotate",
    detail: "hue-rotate(deg)",
    insertText: "hue-rotate($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "invert",
    detail: "invert(%)",
    insertText: "invert($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "opacity",
    detail: "opacity(%)",
    insertText: "opacity($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "saturate",
    detail: "saturate(%)",
    insertText: "saturate($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "sepia",
    detail: "sepia(%)",
    insertText: "sepia($1)",
    insertTextFormat: InsertTextFormat.Snippet
  }
];

const TRANSFORM_COMPLETION_ITEMS: CompletionItem[] = [
  {
    label: "matrix3d",
    detail: "matrix3d()",
    insertText: "matrix3d($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "translate",
    detail: "translate()",
    insertText: "translate(${1:x}, ${2:y})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "translate3d",
    detail: "translate3d()",
    insertText: "translate3d(${1:x}, ${2:y}, ${2:z})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "translateX",
    detail: "translateX()",
    insertText: "translateX(${1:x})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "translateY",
    detail: "translateY()",
    insertText: "translateY(${1:y})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "translateZ",
    detail: "translateZ()",
    insertText: "translateZ(${1:z})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "scale",
    detail: "scale()",
    insertText: "scale($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "scale3d",
    detail: "scale3d()",
    insertText: "scale3d(${1:x}, ${2:y}, ${2:z})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "scaleX",
    detail: "scaleX()",
    insertText: "scaleX(${1:x})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "scaleY",
    detail: "scaleY()",
    insertText: "scaleY(${1:y})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "scaleZ",
    detail: "scaleZ()",
    insertText: "scaleZ(${1:z})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "rotate",
    detail: "rotate()",
    insertText: "rotate($1)",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "rotate3d",
    detail: "rotate3d()",
    insertText: "rotate3d(${1:x}, ${2:y}, ${2:z})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "rotateX",
    detail: "rotateX()",
    insertText: "rotateX(${1:x})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "rotateY",
    detail: "rotateY()",
    insertText: "rotateY(${1:y})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "rotateZ",
    detail: "rotateZ()",
    insertText: "rotateZ(${1:z})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "skew",
    detail: "skew()",
    insertText: "skew(${1:x}, ${1:y})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "skew",
    detail: "skewX()",
    insertText: "skewX(${1:x})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "skewY",
    detail: "skewY()",
    insertText: "skewY(${1:y})",
    insertTextFormat: InsertTextFormat.Snippet
  },
  {
    label: "perspective",
    detail: "perspective()",
    insertText: "perspective($1)",
    insertTextFormat: InsertTextFormat.Snippet
  }
];

// TODO: https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path
const CLIP_PATH_COMPLETION_ITEMS: CompletionItem[] = [];

CSS_DECLARATION_VALUE_COMPLETION_ITEMS = merge(
  {},
  CSS_DECLARATION_VALUE_COMPLETION_ITEMS,
  {
    "clip-path": [...CLIP_PATH_COMPLETION_ITEMS],
    "transition-timing-function": [
      ...ANIMATION_TIMING_FUNCTION_COMPLETION_ITEMS
    ],
    "animation-timing-function": [
      ...ANIMATION_TIMING_FUNCTION_COMPLETION_ITEMS
    ],
    animation: [...ANIMATION_TIMING_FUNCTION_COMPLETION_ITEMS],
    "background-image": [...BACKGROUND_IMAGE_COMPLETION_ITEMS],
    "mask-image": [...BACKGROUND_IMAGE_COMPLETION_ITEMS],
    background: [...BACKGROUND_IMAGE_COMPLETION_ITEMS],
    mask: [...BACKGROUND_IMAGE_COMPLETION_ITEMS],
    content: [...CONTENT_COMPLETION_ITEMS],
    filter: [...FILTER_COMPLETION_ITEMS],
    "grid-auto-columns": [...GRID_AUTO_COLUMNS_COMPLETION_ITEMS],
    transform: [...TRANSFORM_COMPLETION_ITEMS]
  }
);

export {
  CSS_DECLARATION_VALUE_COMPLETION_ITEMS,
  AT_RULE_COMPLETION_ITEMS,
  CSS_DECLARATION_NAME_COMPLETION_ITEMS,
  ATTRIBUTE_NAME_COMPLETION_ITEMS,
  TAG_NAME_COMPLETION_ITEMS
};
