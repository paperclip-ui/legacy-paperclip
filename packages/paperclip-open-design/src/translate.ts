import { ArtboardFacade } from "@opendesign/sdk/dist/artboard-facade";
import { DesignFacade } from "@opendesign/sdk/dist/design-facade";
import { LayerFacade } from "@opendesign/sdk/dist/layer-facade";
import { PageFacade } from "@opendesign/sdk/dist/page-facade";
import { kebabCase } from "lodash";
import * as path from "path";

type TranslateContext = {
  content: string;
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
  relativePath: string;
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

export const translateDesign = async (
  design: DesignFacade
): Promise<TranslateDesignOutput> => {
  const projectName = kebabCase(
    path.basename(design.octopusFilename).replace(/.octopus$/, "")
  );

  const pages = design.getPages();

  // TODO: include assets too
  const files: FileOutput[] = [];

  for (const page of pages) {
    const relativePath = path.join(projectName, kebabCase(page.name)) + ".pc";
    files.push({
      content: await translatePage(page),
      relativePath
    });
  }

  return { files };
};

const translatePage = async (page: PageFacade) => {
  let context = createContext();
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

  children.forEach(child => (context = translateLayer(child, context)));

  context = endBlock(context);

  context = addBuffer(`</div>\n\n`, context);
  return context;
};

const translateLayer = (layer: LayerFacade, context: TranslateContext) => {
  context = addBuffer(
    `<div aria-label=${JSON.stringify(layer.name)}>\n`,
    context
  );

  context = startBlock(context);
  context = translateLayerStyle(layer, context);

  const children = [];

  layer.getNestedLayers().forEach(child => {
    children.unshift(child);
  });
  children.forEach(child => (context = translateLayer(child, context)));

  if (layer.type === "textLayer") {
    const text = layer.getText();
    context = addBuffer(
      `${text.getTextContent().replace(/[^\w\s]/g, "")}\n`,
      context
    );
  }
  context = endBlock(context);
  context = addBuffer(`</div>\n`, context);

  return context;
};

const translateLayerStyle = (
  layer: LayerFacade,
  context: TranslateContext
): TranslateContext => {
  const style = getLayerStyle(layer);

  context = addBuffer("<style>\n", context);
  context = startBlock(context);
  for (const name in style) {
    let value = style[name];
    if (typeof value === "number") {
      value = `${parseFloat(value.toFixed(2))}`;
    }
    context = addCSSDeclaration(kebabCase(name), value, context);
  }
  context = endBlock(context);
  context = addBuffer("</style>\n", context);

  return context;
};

const getLayerStyle = (layer: LayerFacade) => {
  const { bounds, visible, effects, text } = layer.octopus;

  const style: any = {
    position: "fixed",
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height
  };

  if (!visible) {
    style.display = "none";
  }

  if (effects) {
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

  if (text) {
    const { color, font = {} } = text.defaultStyle || {};
    if (color) {
      style.color = translateColor(color);
    }
    if (font.align) {
      style.textAlign = font.align;
    }
    if (font.baseline) {
      style.verticalAlign = getAlias("baseline", font.baseline);
    }
    if (font.bold) {
      style.fontWeight = "bold";
    }
    if (font.italic) {
      style.fontStyle = "italic";
    }
    if (font.kerning) {
      style.fontKerning = "normal";
    }
    if (font.letterSpacing) {
      style.letterSpacing = font.letterSpacing;
    }
    // TODO
    // if (font.ligatures) {
    //   font.ligatures
    // }

    if (font.lineHeight) {
      style.lineHeight = font.lineHeight;
    }
    if (font.size) {
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
  }

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

const createContext = (): TranslateContext => ({
  content: "",
  lineNumber: 0,
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

export const startBlock = (context: TranslateContext) => ({
  ...context,
  lineNumber: context.lineNumber + 1
});

export const endBlock = (context: TranslateContext) => ({
  ...context,
  lineNumber: context.lineNumber - 1
});
