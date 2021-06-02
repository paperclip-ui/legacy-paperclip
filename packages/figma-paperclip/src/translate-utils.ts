import { kebabCase, uniq } from "lodash";
import { DependencyGraph, OutputFile, Point } from "./state";
import { logWarn } from "./utils";
import * as chalk from "chalk";
import * as path from "path";
import { memoize } from "./memo";

export const BLEND_MODE_MAP = {
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

export type TranslateOptions = {
  includes: string[];
};

export type TranslateContext = {
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

export type TranslateContext2 = {
  content: string;
  options: TranslateOptions;
  graph: DependencyGraph;
  lineNumber: number;
  currentRelativeFilePath?: string;
  isNewLine: boolean;
  indent: string;
  currentFileKey?: string;
  mixins: Record<string, string>;
  isFrame: boolean;
  framePosition?: Point;
  files: OutputFile[];
};

export const ontext = (
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

export const startFile = (
  currentRelativeFilePath: string,
  currentFileKey: string,
  context: TranslateContext2
) => ({
  ...context,
  currentFileKey,
  currentRelativeFilePath
});

export const addBuffer = (buffer: string, context: TranslateContext2) => ({
  ...context,
  content:
    context.content +
    (context.isNewLine ? context.indent.repeat(context.lineNumber) : "") +
    buffer,
  isNewLine: buffer.lastIndexOf("\n") === buffer.length - 1
});

export const startBlock = (context: TranslateContext2) => ({
  ...context,
  lineNumber: context.lineNumber + 1
});

export const endBlock = (context: TranslateContext2) => ({
  ...context,
  lineNumber: context.lineNumber - 1
});

export const createContext = (
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

export const createContext2 = (
  graph: DependencyGraph,
  options: TranslateOptions
): TranslateContext2 => ({
  content: "",
  lineNumber: 0,
  graph,
  files: [],
  options,
  mixins: {},
  isNewLine: false,
  indent: "  ",
  isFrame: false
});

export const addFile = (context: TranslateContext2): TranslateContext2 => {
  return {
    ...context,
    content: "",
    lineNumber: 0,
    isNewLine: false,
    isFrame: false,
    currentRelativeFilePath: null,
    currentFileKey: null,
    files: [
      ...context.files,
      {
        relativePath: context.currentRelativeFilePath,
        content: context.content
      }
    ]
  };
};

export const px = (value: number) => round(value, 2) + "px";

export const round = (value: number, dec: number) =>
  parseFloat(value.toFixed(dec));

// TODO - need to create util for plucking out styles that are part of atoms
export const getLayerStyle = memoize((layer: any) => {
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
      const shadows = layer.effects.filter(
        effect =>
          (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") &&
          effect.visible
      );
      if (shadows.length) {
        style.boxShadow = shadows
          .map(shadow => {
            const buffer = [];

            if (shadow.type === "INNER_SHADOW") {
              buffer.push("inset");
            }

            buffer.push(
              px(shadow.offset.x),
              px(shadow.offset.y),
              px(shadow.radius),
              getCSSRGBAColor(shadow.color)
            );

            return buffer.join(" ");
          })
          .join(", ");
      }
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
    style.letterSpacing = round(layer.style.letterSpacing, 2);
  }

  if (layer.strokes?.length) {
    const [stroke] = layer.strokes;
    style.borderColor = getCSSRGBAColor(stroke.color);
    style.borderSyyle = stroke.type.toLowerCase();
    style.borderWidth = layer.strokeWeight;
  }

  return style;
});

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
    color = `rgba(${r2}, ${g2}, ${b2}, ${round(a, 2)})`;
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
