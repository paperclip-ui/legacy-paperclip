import { OutputFile } from "./base";
import * as path from "path";
import { kebabCase, uniq } from "lodash";
import * as chalk from "chalk";
import { logWarn } from "./utils";

type TranslateOptions = {
  cwd: string;
};

type TranslateContext = {
  content: string;
  options: TranslateOptions;
  lineNumber: number;
  isNewLine: boolean;
  indent: string;
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
  options: TranslateOptions
): OutputFile[] => {
  const pagePath = path.join(options.cwd, kebabCase(page.name) + ".pc");
  let context = createContext(options);

  const files: OutputFile[] = [];

  context = translateCanvas(page, context);

  // TODO - include dependencies
  return [
    {
      path: path.join(options.cwd, kebabCase(page.name) + ".pc"),
      content: context.content
    }
  ];
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
  const style = getLayerStyle(layer, point, context);
  context = translateStyleDeclarations(style, context);
  context = endBlock(context);
  context = addBuffer(`</style>\n`, context);
  return context;
};

const getLayerStyle = (layer: any, point: Point, context: TranslateContext) => {
  const { absoluteBoundingBox } = layer;

  const style: any = {};

  if (!context.isFrame) {
    Object.assign(style, {
      position: "fixed",
      width: px(absoluteBoundingBox.width),
      height: px(absoluteBoundingBox.height),
      left: px(absoluteBoundingBox.x - context.framePosition.x),
      top: px(absoluteBoundingBox.y - context.framePosition.y)
    });
  }

  if (layer.type !== "TEXT") {
    if (layer.fills) {
      const value = getFillStyleValue(layer, layer.fills);

      if (value) {
        style.background = value;
        const containsBlendModes = layer.fills.some(fill => {
          return fill.blendMode !== "NORMAL";
        });

        if (containsBlendModes) {
          style["background-blend-mode"] = layer.fills
            .map(fill => {
              return BLEND_MODE_MAP[fill.blendMode];
            })
            .join(", ");
        }
      }
    }

    if (layer.rectangleCornerRadii) {
      if (uniq(layer.rectangleCornerRadii).length === 1) {
        style.borderRadius = px(layer.rectangleCornerRadii[0]);
      } else {
        style["border-top-left-radius"] = layer.rectangleCornerRadii[0] + "px";
        style["border-top-right-radius"] = layer.rectangleCornerRadii[1] + "px";
        style["border-bottom-left-radius"] =
          layer.rectangleCornerRadii[2] + "px";
        style["border-bottom-right-radius"] =
          layer.rectangleCornerRadii[3] + "px";
      }
    }
  }

  if (layer.type === "TEXT") {
    const solidFill = layer.fills.find(fill => fill.type === "SOLID");

    if (solidFill) {
      style.color = getCSSRGBAColor(solidFill.color);
    }

    if (layer.style.lineHeightPercentFontSize) {
      style.lineHeight = `${round(layer.style.lineHeightPercentFontSize, 2)}%`;
    }

    style.fontFamily = layer.style.fontFamily;
    style.fontWeight = layer.style.fontWeight;
    style.fontSize = layer.style.fontSize;
    style.textAlign = layer.style.textAlignHorizontal;
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

const createContext = (options: TranslateOptions): TranslateContext => ({
  content: "",
  lineNumber: 0,
  options,
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
