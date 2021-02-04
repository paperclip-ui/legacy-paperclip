import { generateNode } from "./html";
import { Options, Context, randomArray, pickRandom } from "./utils";
import { generateStyleElement } from "./styles";

// TODO - include component definitions & imports here

export const generateRandomPaperclipDocument = (options: Options) => {
  let buffer = "";

  const context: Context = { depth: 0 };

  buffer += randomArray(options.minWidth, options.maxWidth)
    .map(() => {
      return pickRandom([generateNode, generateStyleElement], [4, 1])(
        options,
        context
      );
    })
    .join("\n");

  return buffer;
};
