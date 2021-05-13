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

type FileOutput = {
  relativePath: string;
  content: string;
};

type TranslateDesignOutput = {
  files: FileOutput[];
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
  context = rootLayers.reduce((context, layer) => {
    context = translateLayer(layer, context);
    return context;
  }, context);

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
  context = endBlock(context);
  context = addBuffer(`</div>\n`, context);

  return context;
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
