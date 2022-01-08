// TODO - move this to @paperclip-ui/utils

import { clamp, random } from "lodash";
import {
  randomChars,
  pickRandom,
  randomArray,
  Options,
  Context
} from "./utils";

export const generateRandomPaperclipDocument = (options: Options) => {
  let buffer = "";

  const context: Context = { depth: 0 };

  buffer += randomArray(options.minWidth, options.maxWidth)
    .map(() => {
      return generateNode(options, context);
    })
    .join("\n");
};

export const generateNode = (options: Options, context: Context) => {
  return pickRandom(
    [generateTextNode, generateFragment, generateBinding, generateElement],
    [1, 1, 1, 3]
  )(options, context);
};

const generateTextNode = (options: Options, context: Context) => {
  return randomChars(0, 20);
};

const generateFragment = (options: Options, context: Context) => {
  return `<fragment>${generateChildNodes(options, context)}</fragment>`;
};

const generateElement = (options: Options, context: Context) => {
  let tagName;

  while (1) {
    tagName = randomChars(1, 3, 3);

    // Probably never going to happen, but no harm in checking
    if (!/img|br|import/.test(tagName)) {
      break;
    }
  }
  let buffer = `<` + tagName;

  buffer += randomArray(options.minWidth, options.maxWidth)
    .map(() => {
      return " " + generateAttribute(options, context);
    })
    .join("");

  if (pickRandom([true, false], [3, 1])) {
    buffer += ">";

    buffer += generateChildNodes(options, context);
    return buffer + `</${tagName}>`;
  } else {
    // play with whitespace at end
    return buffer + pickRandom([" />", "/>", "/>"]);
  }
};
const generateChildNodes = (options: Options, context: Context) => {
  if (context.depth >= options.maxDepth) {
    return "";
  }

  let buffer = "";

  if (context.depth < options.maxDepth) {
    buffer +=
      generateNode(options, { ...context, depth: context.depth + 1 }) + "\n";
  }

  return buffer;
};

const generateAttribute = (options: Options, context: Context) => {
  return pickRandom([generateKeyValueAttribute, generateBinding], [2, 1])(
    options,
    context
  );
};

const generateKeyValueAttribute = (options: Options, context: Context) => {
  const buffer = randomChars(1, 3, 3);

  if (pickRandom([true, false], [2, 1])) {
    return buffer + "=" + generateAttributeValue(options, context);
  } else {
    return buffer;
  }
};

const generateAttributeValue = (options: Options, context: Context) => {
  return pickRandom([
    generateAttributeStringValue,
    generateAttributeDynamicStringValue,
    generateBinding
  ])(options, context);
};

const generateAttributeStringValue = (options: Options, context: Context) => {
  return `"${randomChars(0, 3, 3)}"`;
};

const generateAttributeDynamicStringValue = (
  options: Options,
  context: Context
) => {
  let buffer = `"`;

  buffer += randomArray(options.minWidth, options.maxWidth)
    .map(() => {
      return pickRandom([
        randomChars(1, 3),
        `{${randomChars(1, 3)}}`,
        `{${randomChars(1, 3)}?}` // optional
      ]);
    })
    .join(" ");

  return buffer + `"`;
};

const generateBinding = (options: Options, context: Context) => {
  return pickRandom([
    `{${randomChars(1, 3)}}`,
    `{${randomChars(1, 3)}?}` // optional
  ]);
};
