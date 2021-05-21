import { OutputFile } from "./base";
import * as path from "path";
import { kebabCase, uniq, snakeCase, isEqual, flatten, pick } from "lodash";
import * as chalk from "chalk";
import { logWarn, pascalCase } from "./utils";
import {
  Dependency2,
  flattenNodes,
  getMixinStyles,
  DependencyGraph,
  getNodeById,
  Point,
  getNodeParent
} from "./state";

import {
  TranslateContext,
  TranslateOptions,
  createContext,
  addBuffer,
  startBlock,
  endBlock,
  writeStyleDeclaration,
  round,
  px,
  writeStyleDeclarations,
  getLayerStyle,
  writeElementBlock,
  writeFrameComment
} from "./translate-utils";

export const translatePage = (
  page: any,
  fileKey: string,
  graph: DependencyGraph,
  options: TranslateOptions
): OutputFile[] => {
  const pagePath = path.join(options.cwd, kebabCase(page.name) + ".pc");
  let context = createContext(fileKey, graph, options);

  const files: OutputFile[] = [];

  context = translateIncludes(options.includes, context);
  context = translateComponentSets(page, context);
  context = translateComponents(page, context);
  context = translateImports(context);
  context = translateCanvas(page, context);

  // TODO - include dependencies
  return [
    {
      path: path.join(options.cwd, kebabCase(page.name) + ".pc"),
      content: context.content
    }
  ];
};

const translateIncludes = (includes: string[], context: TranslateContext) => {
  for (const inc of includes) {
    let relPath = path.relative(context.options.cwd, inc);
    if (relPath.charAt(0) !== ".") {
      relPath = "./" + relPath;
    }
    context = addBuffer(`<import src="${relPath}" inject-styles />\n`, context);
  }

  if (includes.length) {
    context = addBuffer("\n", context);
  }

  return context;
};

const translateComponentSets = (page: any, context: TranslateContext) => {
  const dep = context.graph[context.fileKey];
  const componentSets = flattenNodes(page).filter(
    layer => layer.type === "COMPONENT_SET"
  );
  for (const componentSet of componentSets) {
    context = translateComponentSet(componentSet, context);
  }
  return context;
};

const translateComponentSet = (
  componentSet: any,
  context: TranslateContext
) => {
  context = writeFrameComment(componentSet, context, true);
  const attributes = `export component as="${pascalCase(componentSet.name)}"`;

  return writeElementBlock(
    { tagName: "div", attributes },
    context => {
      return context;
    },
    context
  );
};

const translateComponents = (page: any, context: TranslateContext) => {
  const dep = context.graph[context.fileKey];
  const components = flattenNodes(page).filter(
    layer =>
      layer.type === "COMPONENT" &&
      getNodeParent(layer, dep.document).type !== "COMPONENT_SET"
  );

  console.log("COMPONENTS", components);
  return context;
};

const translateImports = (context: TranslateContext) => {
  const module = context.graph[context.fileKey];
  const imported = {};
  for (const importId in module.imports) {
    const imp = module.imports[importId];
    if (imported[imp.fileKey]) {
      continue;
    }
    imported[imp.fileKey] = true;
    const dep = context.graph[imp.fileKey];
    // context = addBuffer(`<import src="${path.relative(context.options.cwd, )}`)
  }
  return context;
};

const translateCanvas = (canvas: any, context: TranslateContext) => {
  for (const artboard of canvas.children) {
    context = translateArtboard(artboard, context);
  }

  return context;
};

const translateArtboard = (artboard: any, context: TranslateContext) => {
  context = {
    ...context,
    isFrame: true,
    framePosition: artboard.absoluteBoundingBox
  };

  context = writeFrameComment(artboard, context);
  context = translateLayer(artboard, { x: 0, y: 0 }, context);
  context = addBuffer(`\n`, context);
  return context;
};
const translateLayer = (
  layer: any,
  point: Point,
  context: TranslateContext
) => {
  switch (layer.type) {
    case "TEXT":
      return translateTextLayer(layer, context);
    case "VECTOR":
      return translateVectorLayer(layer, context);
    case "INSTANCE":
      return translateInstance(layer, context);

    // NOOP
    case "COMPONENT":
    case "COMPONENT_SET": {
      return translateComponentSetAsInstance(layer, context);
    }
    default: {
      return translateBasicLayer(layer, point, context);
    }
  }
};

const translateComponentSetAsInstance = (
  layer: any,
  context: TranslateContext
) => {
  return context;
};

const translateTextLayer = (layer: any, context: TranslateContext) => {
  context = addBuffer(`<span>\n`, context);
  context = startBlock(context);
  context = translateLayerStyleElement(layer, null, context);
  context = addBuffer(`${layer.characters}\n`, context);
  context = endBlock(context);
  context = addBuffer(`</span>\n`, context);
  return context;
};

const translateVectorLayer = (layer: any, context: TranslateContext) => {
  return context;
};

const translateInstance = (layer: any, context: TranslateContext) => {
  context = addBuffer("INST", context);
  return context;
};

const translateRectangleLayer = (
  layer: any,
  point: Point,
  context: TranslateContext
) => {
  context = addBuffer(
    `<div aria-label=${JSON.stringify(layer.name)}>\n`,
    context
  );
  context = startBlock(context);
  context = translateLayerStyleElement(layer, point, context);
  context = endBlock(context);
  context = addBuffer(`</div>\n`, context);
  return context;
};

const translateBasicLayer = (
  layer: any,
  point: Point,
  context: TranslateContext
) => {
  context = addBuffer(
    `<div aria-label=${JSON.stringify(layer.name)}>\n`,
    context
  );
  context = startBlock(context);
  context = translateLayerStyleElement(layer, point, context);
  if (layer.children) {
    context = translateLayerChildren(layer, point, context);
  }
  context = endBlock(context);
  context = addBuffer(`</div>\n`, context);
  return context;
};

const translateLayerChildren = (
  layer: any,
  point: Point,
  context: TranslateContext
) => {
  context = { ...context, isFrame: false };
  for (const child of layer.children) {
    context = translateLayer(child, calcLayerPoint(child, point), context);
  }
  return context;
};

const calcLayerPoint = ({ absoluteBoundingBox }: any, parentPoint: Point) => {
  return {
    x: absoluteBoundingBox.x - parentPoint.x,
    y: absoluteBoundingBox.x - parentPoint.y
  };
};

const translateLayerStyleElement = (
  layer: any,
  point: Point,
  context: TranslateContext
) => {
  context = addBuffer(`<style>\n`, context);
  context = startBlock(context);
  const style = getInlineStyle(layer, context);
  context = writeStyleDeclarations(style, context);
  context = endBlock(context);
  context = addBuffer(`</style>\n`, context);
  return context;
};

const getInlineStyle = (layer: any, context: TranslateContext) => {
  const { absoluteBoundingBox } = layer;
  const style: any = {};
  if (context.isFrame) {
    Object.assign(style, {
      width: `100vw`,
      height: `100vh`
    });
  } else {
    Object.assign(style, {
      position: "fixed",
      width: px(absoluteBoundingBox.width),
      height: px(absoluteBoundingBox.height),
      left: px(absoluteBoundingBox.x - context.framePosition.x),
      top: px(absoluteBoundingBox.y - context.framePosition.y)
    });
  }

  Object.assign(style, getLayerStyle(layer));

  return style;
};
