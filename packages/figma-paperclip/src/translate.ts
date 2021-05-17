import { OutputFile } from "./base";
import * as path from "path";
import { kebabCase, uniq, snakeCase, isEqual, flatten } from "lodash";
import * as chalk from "chalk";
import { logWarn } from "./utils";
import {
  Dependency2,
  flattenNodes,
  getMixinStyles,
  DependencyGraph,
  getNodeById
} from "./state";

type TranslateOptions = {
  cwd: string;
  includes: string[];
};

type TranslateContext = {
  content: string;
  options: TranslateOptions;
  graph: DependencyGraph;
  lineNumber: number;
  isNewLine: boolean;
  indent: string;
  fileKey: string;
  mixins: Record<string, string>;
  isFrame: boolean;
  framePosition?: Point;
};

type Point = { x: number; y: number };

const BLEND_MODE_MAP = {
  NORMAL: "normal",
  DARKEN: "darken",
  MULTIPLY: "multiply",
  COLOR_BURN: "color-burn",
  LIGHTEN: "lighten",
  SCREEN: "screen",
  COLOR_DODGE: "color-dodge",
  OVERLAY: "overlay",
  SOFT_LIGHT: "soft-light",
  HARD_LIGHT: "hard-light",
  DIFFERENCE: "difference",
  EXCLUSION: "exclusion",
  HUE: "hue",
  LUMINOSITY: "luminosity",
  SATURATION: "saturation",
  COLOR: "color"
};

export const translate = (
  page: any,
  fileKey: string,
  graph: DependencyGraph,
  options: TranslateOptions
): OutputFile[] => {
  const pagePath = path.join(options.cwd, kebabCase(page.name) + ".pc");
  let context = createContext(fileKey, graph, options);

  const files: OutputFile[] = [];

  context = translateIncludes(options.includes, context);
  context = translateExports(page, context);
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

const translateExports = (canvas: any, context: TranslateContext) => {
  const allLayers = flattenNodes(canvas) as any;
  const existingStyles = {};
  const mixins = {};
  context = addBuffer(`<style>\n`, context);
  context = startBlock(context);
  context = addBuffer(`@export {\n`, context);
  context = startBlock(context);
  context = translateReusableStyles(context);

  for (const layer of allLayers) {
    if (layer.type === "CANVAS") {
      continue;
    }

    context = translateMixin(layer, context, existingStyles, mixins);
  }

  context = endBlock(context);
  context = addBuffer(`}\n`, context);
  context = endBlock(context);
  context = addBuffer(`</style>\n`, context);

  context = { ...context, mixins };
  return context;
};
const translateReusableStyles = (context: TranslateContext) => {
  const dep = context.graph[context.fileKey];

  for (const styleId in dep.styles) {
    const style = dep.styles[styleId];
    const styleDep = context.graph[styleId];

    // must be same, otherwise it's an external dependency that must be imported in
    if (styleDep !== dep) {
      continue;
    }
    console.log("FLAT");

    // note that contains the actual styles
    const modelNode = flattenNodes(styleDep.document).find(
      (node: any) =>
        node.styles &&
        node.styles[style && style.styleType.toLowerCase()] === styleId
    );

    // Style that's not used
    if (!modelNode) {
      continue;
    }

    console.log(modelNode);
  }

  return context;
};

const translateMixin = (
  layer: any,
  context: TranslateContext,
  existingStyles: any = {},
  mixins: any = {}
) => {
  let name = snakeCase(layer.name);

  if (layer.styles) {
    for (const type in layer.styles) {
      const id = layer.styles[type];
      getMixinStyles(id, context.fileKey, context.graph);
    }
  }

  // refs are invalid if starting with 0-9, so prefix with something
  // safe
  if (!isNaN(Number(name.charAt(0)))) {
    name = "_" + name;
  }

  const refName = snakeCase(name + "_" + layer.id);

  const style = getLayerStyle(layer, context);

  if (!Object.keys(style).length) {
    return context;
  }

  let existingRefName: string;

  if (!existingStyles[name]) {
    existingStyles[name] = [];
  }

  for (let i = 0, { length } = existingStyles[name]; i < length; i++) {
    const [ref, existingStyle] = existingStyles[name][i];
    if (isEqual(style, existingStyle)) {
      existingRefName = ref;
      break;
    }
  }
  if (!existingRefName) {
    existingStyles[name].push([refName, style]);
  }

  mixins[layer.id] = existingRefName || refName;
  if (!existingRefName) {
    context = addBuffer(`@mixin ${refName} {\n`, context);
    context = startBlock(context);
    context = translateStyleDeclarations(style, context);
    context = endBlock(context);
    context = addBuffer(`}\n\n`, context);
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

  context = addBuffer(`<!--\n`, context);
  context = startBlock(context);
  const { width, height, x, y } = artboard.absoluteBoundingBox;
  context = addBuffer(
    `@frame { title: ${JSON.stringify(
      artboard.name
    )}, width: ${width}, height: ${height}, x: ${x}, y: ${y} }\n`,
    context
  );
  context = endBlock(context);
  context = addBuffer(`-->\n`, context);
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
    default: {
      return translateBasicLayer(layer, point, context);
    }
  }
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
  context = translateStyleDeclarations(style, context);
  if (context.mixins[layer.id]) {
    context = addBuffer(`@include ${context.mixins[layer.id]};\n`, context);
  }
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

  if (!context.mixins[layer.id]) {
    Object.assign(style, getLayerStyle(layer, context));
  }

  return style;
};

const getLayerStyle = (layer: any, context: TranslateContext) => {
  const style: any = {};

  if (layer.type !== "TEXT") {
    if (layer.fills) {
      const value = getFillStyleValue(layer, layer.fills);

      if (value) {
        style.background = value;
        const containsBlendModes = layer.fills.some(fill => {
          return fill.blendMode !== "NORMAL";
        });

        if (containsBlendModes) {
          style.backgroundBlendMode = layer.fills
            .map(fill => {
              return BLEND_MODE_MAP[fill.blendMode];
            })
            .join(", ");
        }
      }
    }

    if (layer.effects) {
    }

    if (layer.rectangleCornerRadii) {
      if (uniq(layer.rectangleCornerRadii).length === 1) {
        style.borderRadius = px(layer.rectangleCornerRadii[0]);
      } else {
        style.borderTopLeftRadius = layer.rectangleCornerRadii[0] + "px";
        style.borderTopRightRadius = layer.rectangleCornerRadii[1] + "px";
        style.borderBottomLeftRadius = layer.rectangleCornerRadii[2] + "px";
        style.borderBottomRightRadius = layer.rectangleCornerRadii[3] + "px";
      }
    }
  }

  if (layer.type === "TEXT") {
    const solidFill = layer.fills.find(fill => fill.type === "SOLID");

    if (solidFill) {
      style.color = getCSSRGBAColor(solidFill.color);
    }

    style.lineHeight = px(layer.style.lineHeightPx);
    style.fontFamily = layer.style.fontFamily + ", sans-serif";
    style.fontWeight = layer.style.fontWeight;
    style.fontSize = px(layer.style.fontSize);
    style.textAlign = layer.style.textAlignHorizontal.toLowerCase();
    style.letterSpacing = layer.style.letterSpacing;
  }

  return style;
};

const getFillStyleValue = (layer: any, fills: any[]) =>
  fills
    .reverse()
    .filter(fill => fill.visible !== false)
    .map((fill, index) => {
      switch (fill.type) {
        case "SOLID": {
          return getCSSRGBAColor(fill.color, index === fills.length - 1);
        }
        case "GRADIENT_LINEAR": {
          return getCSSLinearGradient(fill);
        }
        case "GRADIENT_RADIAL": {
          return getCSSRadialGradient(fill);
        }
        case "IMAGE": {
          return getCSSImageBackground(fill);
        }
        default: {
          // TODO - all gradient fills should work
          logLayerWarn(layer, `Cannot translate ${fill.type} fill to CSS`);
          return null;
        }
      }
    })
    .filter(Boolean)
    .join(", ");

const getCSSRGBAColor = ({ r, g, b, a }: any, last: boolean = true) => {
  const r2 = Math.round(r * 255);
  const g2 = Math.round(g * 255);
  const b2 = Math.round(b * 255);

  // TODO - generate hash
  let color;
  if (a !== 1) {
    color = `rgba(${r2}, ${g2}, ${b2}, ${a})`;
  } else {
    color = rgbToHex(r2, g2, b2);
  }

  return last ? color : `linear-gradient(0deg, ${color}, ${color})`;
};

const getCSSImageBackground = ({ imageRef }: any) => {
  // TODO: https://github.com/crcn/figmark/issues/13
  // TODO - need to get actual extension info.
  return `url("./${imageRef}.png")`;
};

const getCSSRadialGradient = ({ gradientStops }: any) => {
  // TODO: https://github.com/crcn/figmark/issues/13
  return `radial-gradient(${gradientStops
    .map(stop => {
      return `${getCSSRGBAColor(stop.color)} ${stop.position * 100}%`;
    })
    .join(", ")})`;
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const logLayerWarn = (node: any, message: string) => {
  logWarn(`Layer ${chalk.bold(node.name)}: ${message}`);
};

const getCSSLinearGradient = ({
  gradientHandlePositions,
  gradientStops
}: any) => {
  // TODO: https://github.com/crcn/figmark/issues/12
  const radians = calcGradiantHandleRadians(gradientHandlePositions);
  return `linear-gradient(${radians}rad, ${gradientStops
    .map(stop => {
      return `${getCSSRGBAColor(stop.color)} ${stop.position * 100}%`;
    })
    .join(", ")})`;
};

const calcGradiantHandleRadians = ([first, second]: any) => {
  const ydiff = second.y - first.y;
  const xdiff = first.x - second.x;
  const radians = Math.atan2(-xdiff, -ydiff);
  return Number(radians.toFixed(3));
};

const px = (value: number) => round(value, 2) + "px";

const round = (value: number, dec: number) => parseFloat(value.toFixed(dec));

const translateStyleDeclarations = (style: any, context: TranslateContext) => {
  for (const property in style) {
    context = translateStyleDeclaration(property, style[property], context);
  }
  return context;
};

const translateStyleDeclaration = (
  name: string,
  value: string,
  context: TranslateContext
) => addBuffer(`${kebabCase(name)}: ${value};\n`, context);

const createContext = (
  fileKey: string,
  graph: DependencyGraph,
  options: TranslateOptions
): TranslateContext => ({
  content: "",
  lineNumber: 0,
  fileKey,
  graph,
  options,
  mixins: {},
  isNewLine: false,
  indent: "  ",
  isFrame: false
});

export const addBuffer = (buffer: string, context: TranslateContext) => ({
  ...context,
  content:
    context.content +
    (context.isNewLine ? context.indent.repeat(context.lineNumber) : "") +
    buffer,
  isNewLine: buffer.lastIndexOf("\n") === buffer.length - 1
});

export const startBlock = (context: TranslateContext) => ({
  ...context,
  lineNumber: context.lineNumber + 1
});

export const endBlock = (context: TranslateContext) => ({
  ...context,
  lineNumber: context.lineNumber - 1
});
