import { ArtboardFacade } from "@opendesign/sdk/dist/artboard-facade";
import { DesignFacade } from "@opendesign/sdk/dist/design-facade";
import { LayerFacade } from "@opendesign/sdk/dist/layer-facade";
import { PageFacade } from "@opendesign/sdk/dist/page-facade";
import { IText } from "@opendesign/octopus-reader/dist/types/text.iface";
import { add, kebabCase, uniq } from "lodash";
import * as path from "path";

type Point = {
  x: number;
  y: number;
};

type TranslateContext = {
  content: string;
  options: TranslateOptions;
  lineNumber: number;
  isNewLine: boolean;
  indent: string;
};

type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type FileOutput = {
  filePath: string;
  content: string;
};

type TranslateDesignOutput = {
  files: FileOutput[];
};

const VALUE_ALIASES = {
  baseline: {
    superScript: "super",
    subScript: "sub"
  }
};

type TranslateOptions = {
  dir: string;
  includes: string[];
};

export const translateDesign = async (
  design: DesignFacade,
  options: TranslateOptions
): Promise<TranslateDesignOutput> => {
  const projectName = kebabCase(
    path.basename(design.octopusFilename).replace(/.octopus$/, "")
  );

  design.setFallbackFonts(["sans-serif"]);

  const pages = design.getPages();

  // TODO: include assets too
  const files: FileOutput[] = [];

  for (const page of pages) {
    const relativePath = path.join(projectName, kebabCase(page.name)) + ".pc";
    const filePath = path.join(options.dir, relativePath);
    files.push({
      content: await translatePage(page, filePath, options),
      filePath
    });
  }

  return { files };
};

const translatePage = async (
  page: PageFacade,
  filePath: string,
  options: TranslateOptions
) => {
  let context = createContext(options);

  for (const include of options.includes) {
    context = addBuffer(
      `<import src="${path.relative(
        path.dirname(filePath),
        include
      )}" inject-styles />\n`,
      context
    );
  }
  if (options.includes.length) {
    context = addBuffer("\n", context);
  }
  for (const artboard of page.getArtboards()) {
    context = await translateArtboard(artboard, context);
  }

  return context.content;
};

export const translateArtboard = async (
  artboard: ArtboardFacade,
  context: TranslateContext
): Promise<TranslateContext> => {
  const bounds = await artboard.getBounds();
  context = addBuffer(`<!--\n`, context);
  context = startBlock(context);
  context = addBuffer(
    `@frame { title: ${JSON.stringify(artboard.name)}, width: ${
      bounds.width
    }, height: ${bounds.height}, x: ${bounds.left}, y: ${bounds.top}}\n`,
    context
  );
  context = endBlock(context);
  context = addBuffer(`-->\n`, context);
  context = addBuffer("<div>\n", context);
  context = startBlock(context);

  const rootLayers = await artboard.getRootLayers();

  const children = [];

  rootLayers.forEach(child => {
    children.unshift(child);
  });

  children.forEach(
    child => (context = translateLayer(child, context, { x: 0, y: 0 }))
  );

  context = endBlock(context);

  context = addBuffer(`</div>\n\n`, context);
  return context;
};

const translateLayer = (
  layer: LayerFacade,
  context: TranslateContext,
  offset: Point
) => {
  const bounds = layer.octopus.bounds;

  context = addBuffer(
    `<div aria-label=${JSON.stringify(layer.name)}>\n`,
    context
  );

  if (layer.type === "shapeLayer") {
    // console.log(JSON.stringify(layer.octopus, null, 2));
    const ab = layer.getComponentArtboard();
    // console.log("AB", ab);
    const shape = layer.getShape();
    // console.log("SHP", shape);
  }

  context = startBlock(context);
  context = translateLayerStyle(layer, context, offset);

  const children = [];

  layer.getNestedLayers().forEach(child => {
    children.unshift(child);
  });

  children.forEach(
    child =>
      (context = translateLayer(child, context, {
        x: bounds.left,
        y: bounds.top
      }))
  );

  if (layer.type === "textLayer") {
    const text = layer.getText();
    context = translateText(text, context);
  }
  context = endBlock(context);
  context = addBuffer(`</div>\n`, context);

  return context;
};

const translateText = (text: IText, context: TranslateContext) => {
  context = addBuffer("<span>\n", context);
  context = startBlock(context);
  const { styles } = text.octopus;

  context = addBuffer("<style>\n", context);
  context = startBlock(context);
  const defaultStyleObj = getTextStyle(text.octopus.defaultStyle || {});
  context = translateStyles(defaultStyleObj, context);

  for (const style of styles) {
    const styleObj = getTextStyle(style);
    const selectorText = style.ranges
      .map(range => `._${range.from}-${range.to}`)
      .join(", ");
    context = addBuffer("\n", context);
    context = addBuffer(`${selectorText} {\n`, context);
    context = startBlock(context);
    context = translateStyles(styleObj, context);
    context = endBlock(context);
    context = addBuffer("}\n", context);
  }
  context = endBlock(context);
  context = addBuffer("</style>\n", context);

  const value = text.getTextContent();
  let currRange;
  let prevRange;

  for (let i = 0, { length } = value; i < length; i++) {
    for (const style of styles) {
      for (const range of style.ranges) {
        if (range.from <= i && range.to > i) {
          currRange = range;
          break;
        }
      }
    }
    if (currRange && currRange !== prevRange) {
      if (prevRange) {
        const closeTagName = rangeContainsParagraphChar(value, prevRange)
          ? "span"
          : "span";
        context = addBuffer(`</${closeTagName}>\n`, context);
      }

      const openTagName = rangeContainsParagraphChar(value, currRange)
        ? "span"
        : "span";

      context = addBuffer(
        `<${openTagName} class="_${currRange.from}-${currRange.to}">`,
        context
      );
    }

    context = addBuffer(convertChar(value.charAt(i)), context);

    prevRange = currRange;
  }

  if (prevRange) {
    const closeTagName = rangeContainsParagraphChar(value, prevRange)
      ? "span"
      : "span";
    context = addBuffer(`</${closeTagName}>`, context);
  }
  context = endBlock(context);
  context = addBuffer("\n", context);
  context = addBuffer("</span>\n", context);

  return context;
};

const rangeContainsParagraphChar = (value: string, range: any) => {
  const chunk = value.substr(range.from, range.to);
  return chunk.includes("\u2029");
};

const convertChar = (c: string) => {
  if (c === "\u2029") {
    return "<br /><br />";
  }
  return c;
};

const translateLayerStyle = (
  layer: LayerFacade,
  context: TranslateContext,
  offset: Point
): TranslateContext => {
  const style = getLayerStyle(layer, context, offset);

  context = addBuffer("<style>\n", context);
  context = startBlock(context);
  context = translateStyles(style, context);
  context = endBlock(context);
  context = addBuffer("</style>\n", context);

  return context;
};

const getTextStyle = ({ color, font }: any) => {
  const style: any = {};

  if (color) {
    style.color = translateColor(color);
  }
  if (font.align) {
    style.textAlign = font.align;
  }
  if (font.baseline) {
    style.verticalAlign = getAlias("baseline", font.baseline);
  }
  if (font.weight) {
    style.fontWeight = font.weight;
  }
  if (font.italic) {
    style.fontStyle = "italic";
  }
  if (font.kerning) {
    style.fontKerning = "normal";
  }

  if (font.letterSpacing) {
    style.letterSpacing = px(parseFloat(font.letterSpacing.toFixed(2)));
  }

  if (font.align) {
    font.textAlign = font.align;
  }
  // TODO
  // if (font.ligatures) {
  //   font.ligatures
  // }

  if (font.lineHeight) {
    style.lineHeight = px(parseFloat(font.lineHeight));
  }
  if (font.name) {
    style.fontFamily = font.name;
  }
  // if (font.postScriptName)
  // if (font.smallcaps)
  // if (font.syntheticPostScriptName)
  // if (font.underline) {}
  // if (font.uppercase)
  if (font.size) {
    style.fontSize = font.size + "px";
  }

  return style;
};

const translateStyles = (style: any, context: TranslateContext) => {
  for (const name in style) {
    let value = style[name];
    if (typeof value === "number") {
      value = parseFloat(value.toFixed(2));
    }
    context = addCSSDeclaration(kebabCase(name), value, context);
  }
  return context;
};

const getLayerStyle = (
  layer: LayerFacade,
  context: TranslateContext,
  offset: Point
) => {
  const { bounds, visible, effects } = layer.octopus;

  // if (px(bounds.left - offset.x) === "348px" && effects?.fills) {
  // }
  // console.log(JSON.stringify(layer.octopus, null, 2));

  // some props not part of typed definition
  const { shapeRadius, isSymbolMaster } = layer.octopus as any;

  const style: any = {
    position: "absolute",
    left: px(bounds.left - offset.x),
    top: px(bounds.top - offset.y),
    width: px(bounds.width),
    height: px(bounds.height),
    overflow: "hidden"
  };

  if (!visible) {
    style.display = "none";
  }

  // if isSymbolMaster then background already exists as child (isVirtual)
  if (effects && !isSymbolMaster) {
    if (effects.fills) {
      const background = effects.fills
        .map(fill => {
          if (fill.color) {
            return translateColor(fill.color);
          }
          if (fill.pattern) {
            // TODO - need to download this resource
            return `url("${fill.pattern.filename}")`;
          }
        })
        .join(", ");

      style.background = background;
    }
  }

  if (shapeRadius) {
    if (uniq(shapeRadius).length === 1) {
      style.borderRadius = px(shapeRadius[0]);
    }
  }

  // if (text) {
  //   // Object.assign(style, getTextStyle(text.defaultStyle || {}));
  // }

  return style;
};

const getAlias = (name: string, value: string) => {
  return (VALUE_ALIASES[name] && VALUE_ALIASES[name][value]) || value;
};

const translateColor = ({ r, g, b, a }: Color) =>
  `rgba(${r}, ${g}, ${b}, ${a})`;
const addCSSDeclaration = (
  name: string,
  value: string,
  context: TranslateContext
) => {
  return addBuffer(`${name}: ${value};\n`, context);
};

const createContext = (options: TranslateOptions): TranslateContext => ({
  content: "",
  lineNumber: 0,
  options,
  isNewLine: false,
  indent: "  "
});

export const addBuffer = (buffer: string, context: TranslateContext) => ({
  ...context,
  content:
    context.content +
    (context.isNewLine ? context.indent.repeat(context.lineNumber) : "") +
    buffer,
  isNewLine: buffer.lastIndexOf("\n") === buffer.length - 1
});

const px = (v: any) => `${v}px`;

export const startBlock = (context: TranslateContext) => ({
  ...context,
  lineNumber: context.lineNumber + 1
});

export const endBlock = (context: TranslateContext) => ({
  ...context,
  lineNumber: context.lineNumber - 1
});
