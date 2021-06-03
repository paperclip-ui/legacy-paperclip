import * as path from "path";
import {
  DependencyGraph,
  DependencyKind,
  DesignDependency,
  extractMixedInSyles,
  getNodeDependency,
  getNodeFrame,
  getNodeParent
} from "../state";
import {
  addBuffer,
  addFile,
  endBlock,
  getLayerStyle,
  px,
  startBlock,
  startFile,
  TranslateContext2
} from "./context";
import {
  getDesignModulesFile,
  getDesignPageFile,
  getFontFile,
  writeElementBlock,
  writeStyleDeclarations
} from "./utils";

export const writeDesignPages = (
  dep: DesignDependency,
  context: TranslateContext2
) => {
  for (const page of dep.document.children) {
    context = writePage(page, dep, context);
  }
  return context;
};

const writePage = (
  page: any,
  dep: DesignDependency,
  context: TranslateContext2
) => {
  context = startFile(getDesignPageFile(page, dep), dep.fileKey, context);
  context = writePageImports(dep, context);
  context = writePageFrames(page, context);
  context = addFile(context);
  return context;
};

const writePageFrames = (page: any, context: TranslateContext2) => {
  for (const frame of page.children) {
    context = writePageFrame(frame, context);
  }
  return context;
};
const writePageFrame = (frame: any, context: TranslateContext2) => {
  context = writeFrameComment(frame, context);
  context = writeLayer(frame, context);
  return context;
};

const writeLayer = (layer: any, context: TranslateContext2) => {
  switch (layer.type) {
    case "COMPONENT_SET":
    case "GROUP":
    case "COMPONENT":
    case "INSTANCE":
    case "FRAME":
    case "RECTANGLE":
      return writeElementLayer(layer, context);
    case "TEXT":
      return writeTextLayer(layer, context);
    case "ELLIPSE":
    case "LINE":
    case "BOOLEAN_OPERATION":
    case "VECTOR":
      return writeVectorLayer(layer, context);
  }
  return context;
};

const writeVectorLayer = (layer: any, context: TranslateContext2) => {
  return context;
};

const writeElementLayer = (layer: any, context: TranslateContext2) => {
  context = writeElementBlock(
    { tagName: "div" },
    context => {
      context = writeLayerStyle(layer, context);
      if (layer.children) {
        for (const child of layer.children) {
          context = writeLayer(child, context);
        }
      }
      return context;
    },
    context
  );
  return context;
};

const writeLayerStyle = (layer: any, context: TranslateContext2) => {
  const style = getInlineStyle(layer, context);
  context = writeElementBlock(
    { tagName: "style" },
    context => {
      context = writeStyleDeclarations(style, context);
      return context;
    },
    context
  );
  return context;
};

const writeTextLayer = (layer: any, context: TranslateContext2) => {
  context = writeElementBlock(
    { tagName: "span" },
    context => {
      context = writeLayerStyle(layer, context);
      context = addBuffer(layer.characters + "\n", context);
      return context;
    },
    context
  );
  return context;
};

const writePageImports = (
  entry: DesignDependency,
  context: TranslateContext2
) => {
  const importFilePaths = {};
  Object.assign(
    importFilePaths,
    getDependencyImportFilePaths(entry, context.graph)
  );
  importFilePaths[getDesignModulesFile(entry)] = 1;

  for (const relativePath in importFilePaths) {
    context = addBuffer(
      `<import src="${resolvePath(relativePath, context)}" inject-styles />\n`,
      context
    );
  }
  context = addBuffer("\n", context);
  return context;
};

const resolvePath = (to: string, context: TranslateContext2) => {
  let relative = path.relative(
    path.dirname(context.currentRelativeFilePath),
    to
  );
  if (relative.charAt(0) !== ".") {
    relative = "./" + relative;
  }
  return relative;
};

const writeFrameComment = (
  layer: any,
  context: TranslateContext2,
  visible = true
) => {
  const { width, height, x, y } = layer.absoluteBoundingBox;

  context = {
    ...context,
    isFrame: true,
    framePosition: layer.absoluteBoundingBox
  };

  context = addBuffer(`<!--\n`, context);
  context = startBlock(context);
  context = addBuffer(
    `@frame { title: ${JSON.stringify(
      layer.name
    )}, width: ${width}, height: ${height}, x: ${x}, y: ${y}, visible: ${visible} }\n`,
    context
  );
  context = endBlock(context);
  context = addBuffer(`-->\n`, context);
  return context;
};

const getDependencyImportFilePaths = (
  entry: DesignDependency,
  graph: DependencyGraph
) => {
  const filePaths = {};
  for (const refId in entry.imports) {
    const imp = entry.imports[refId];
    const dep = graph[imp.fileKey];
    if (dep.kind === DependencyKind.Font) {
      if (dep.content) {
        filePaths[getFontFile(dep)] = 1;
      }
    } else {
      filePaths[getDesignModulesFile(dep)] = 1;
    }
  }

  return filePaths;
};

const getInlineStyle = (layer: any, context: TranslateContext2) => {
  const { absoluteBoundingBox } = layer;
  const parent = getNodeParent(
    layer,
    getNodeDependency(layer, context.graph).document
  );
  let style: any = {};

  if (parent.type === "CANVAS") {
    Object.assign(style, {
      width: `100vw`,
      height: `100vh`
    });
  } else {
    const frame = getNodeFrame(
      layer,
      getNodeDependency(layer, context.graph).document
    );
    Object.assign(style, {
      position: "fixed",
      width: px(absoluteBoundingBox.width),
      height: px(absoluteBoundingBox.height),
      left: px(absoluteBoundingBox.x - frame.absoluteBoundingBox.x),
      top: px(absoluteBoundingBox.y - frame.absoluteBoundingBox.y)
    });
  }

  Object.assign(style, getLayerStyle(layer));
  style = addStyleMixins(layer, style, context);

  return style;
};

const addStyleMixins = (layer: any, style: any, context: TranslateContext2) => {
  const dep = context.graph[context.currentFileKey] as DesignDependency;
  let newStyle = { ...style };
  const mixedInStyles = extractMixedInSyles(layer);
  for (const refId in mixedInStyles) {
    const imp = dep.imports[refId] as any;
    const mixinId = imp?.nodeId || refId;
    const impDep = (imp ? context.graph[imp.fileKey] : dep) as DesignDependency;
    const mixin = impDep.styles[mixinId];
  }
  return newStyle;
};
