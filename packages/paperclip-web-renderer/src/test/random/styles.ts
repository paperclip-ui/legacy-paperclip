import {
  randomChars,
  Options,
  Context,
  randomArray,
  pickRandom
} from "./utils";

export const generateStyleElement = (options: Options, context: Context) => {
  let buffer = `<style>`;

  buffer += randomArray(options.minWidth, options.maxWidth)
    .map(() => generateCSSRule(options, context))
    .join("\n");

  return buffer + `</style>`;
};

const generateCSSRule = (options: Options, context: Context) => {
  return pickRandom([generateCSSStyleRule, generateCSSMediaRule])(
    options,
    context
  );
};

const generateCSSMediaRule = (options: Options, context: Context) => {
  return (
    `@media ${randomChars(1, 5, 5)} {\n` +
    `  ${randomArray(options.minWidth, options.maxWidth)
      .map(() =>
        generateCSSStyleRule(options, { ...context, depth: context.depth + 1 })
      )
      .join("\n")}` +
    `}\n\n`
  );
};

const generateCSSStyleRule = (options: Options, context: Context) => {
  return (
    `.${randomChars(1, 5, 5)} {\n` +
    ` ${randomArray(options.minWidth, options.maxWidth)
      .map(() => {
        return pickRandom(
          context.depth < options.maxDepth
            ? [generateCSSSDeclaration, generateCSSStyleRule]
            : [generateCSSSDeclaration]
        )(options, { ...context, depth: context.depth + 1 });
      })
      .join("\n")}` +
    `}\n\n`
  );
};

const generateCSSSDeclaration = (options: Options, context: Context) => {
  // don't want to be totally random
  return `${randomChars(1, 4, 3)}: ${randomChars(1, 4)};`;
};

randomChars;
