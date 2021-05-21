import { kebabCase, pick } from "lodash";
import * as path from "path";
import * as chalk from "chalk";
import { OutputFile } from "./base";
import { memoize } from "./memo";
import { DependencyGraph } from "./state";
import {
  TranslateOptions,
  TranslateContext,
  createContext,
  writeElementBlock,
  writeStyleBlock,
  writeStyleDeclarations,
  getLayerStyle,
  writeStyleDeclaration
} from "./translate-utils";
import { findLayer, logError } from "./utils";

export const translatePCAtoms = (
  fileKey: string,
  graph: DependencyGraph,
  options: TranslateOptions
): OutputFile[] => {
  let context = createContext(fileKey, graph, options);
  context = translateStyleAtoms(context);

  return [
    {
      path: path.join(options.cwd, "atoms.pc"),
      content: context.content
    }
  ];
};

const translateStyleAtoms = (context: TranslateContext) => {
  return writeElementBlock(
    { tagName: "style" },
    context => {
      return writeStyleBlock(
        "@export",
        context => {
          context = translateRootVars(context);
          return context;
        },
        context
      );
    },
    context
  );
};

const translateRootVars = (context: TranslateContext) => {
  const vars = {};
  const usedNames = {};

  const dep = context.graph[context.fileKey];
  for (const styleId in dep.styles) {
    const style = dep.styles[styleId];

    // names are defined as mixins which are unique IDs. If there's a duplicate name, then
    // we need to skip. Though -- need to notify developer to change name so that designer can do this. Fix is as easy
    // as renaming since references are maintained.
    if (usedNames[style.name]) {
      logError(
        `Duplicate style ${chalk.bold(
          style.name
        )}. This should be renamed in Figma.`
      );
      continue;
    }

    usedNames[style.name] = true;

    const modelLayer = findLayer(dep.document, layer => {
      if (layer.styles) {
        for (const styleType in layer.styles) {
          if (layer.styles[styleType] === styleId) {
            return true;
          }
        }
      }
    });

    if (!modelLayer) {
      continue;
    }

    vars[styleId] = modelLayer;
  }

  context = writeStyleBlock(
    ":root",
    context => {
      for (const styleId in vars) {
        context = translateRootVar(
          styleId,
          dep.styles[styleId],
          vars[styleId],
          context
        );
      }
      return context;
    },
    context
  );

  for (const styleId in vars) {
    context = translateMixin(
      styleId,
      dep.styles[styleId],
      vars[styleId],
      context
    );
  }

  return context;
};

const translateRootVar = (
  styleId: any,
  styleMixin: any,
  modelLayer: any,
  context: TranslateContext
) => {
  const name = "--" + kebabCase(styleMixin.name);
  const mixedInStyles = extractMixedInSyles(modelLayer);
  const value = mixedInStyles[styleId];
  if (styleMixin.styleType === "FILL") {
    context = writeStyleDeclaration(name, value as string, context, false);
  }

  return context;
};

const translateMixin = (
  styleId: any,
  styleMixin: any,
  modelLayer: any,
  context: TranslateContext
) => {
  const name = kebabCase(styleMixin.name);
  const mixedInStyles = extractMixedInSyles(modelLayer);
  const value = mixedInStyles[styleId];
  if (styleMixin.styleType === "EFFECT" || styleMixin.styleType === "TEXT") {
    context = writeStyleBlock(
      `@mixin ${name}`,
      context => {
        return writeStyleDeclarations(value, context);
      },
      context
    );
  } else {
    console.log(`Can't handle styleType ${chalk.bold(styleMixin.styleType)}`);
  }

  return context;
};

const extractMixedInSyles = memoize(
  (layer: any): Record<string, any> => {
    const style = getLayerStyle(layer);
    const ret = {};
    for (const type in layer.styles) {
      const mixinId = layer.styles[type];
      if (type === "fill" || type === "fills") {
        ret[mixinId] = style.color || style.background;
      } else if (type === "effect") {
        ret[mixinId] = pick(style, "boxShadow");
      } else if (type === "text") {
        ret[mixinId] = pick(
          style,
          "fontFamily",
          "letterSpacing",
          "lineHeight",
          "fontWeight",
          "fontSize",
          "textAlign"
        );
      } else {
        logError(`Unknown layer type ${chalk.bold(type)}`);
      }
    }

    return ret;
  }
);

const getMixedInStyles = memoize((layer: any) => {
  const style = getLayerStyle(layer);

  const styles = {};

  for (const styleType in layer.styles) {
    const mixinStyle: any = (styles[styleType] = {});
    if (styleType === "fill") {
      if (layer.type === "TEXT") {
        mixinStyle.color = layer.style;
      } else {
        mixinStyle.background = layer.background;
      }
    }
  }

  return styles;
});
