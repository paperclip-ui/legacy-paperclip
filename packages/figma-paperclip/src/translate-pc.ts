import { camelCase, kebabCase, omit } from "lodash";
import { memoize } from "./memo";
import * as path from "path";
import {
  DependencyGraph,
  DependencyKind,
  DesignDependency,
  extractMixedInSyles,
  FontDependency,
  Frame,
  getNodeAncestors,
  getNodeDependency,
  getNodeFrame
} from "./state";
import {
  addBuffer,
  addFile,
  createContext2,
  endBlock,
  getLayerStyle,
  px,
  startBlock,
  startFile,
  TranslateContext2,
  TranslateOptions
} from "./translate-utils";
import { logWarn } from "./utils";

/*

Generates design files with the following folder structure:

atoms.pc
figma/
  atoms/
    colors.pc
    typography.pc
    shadows.pc
  assets/
    something.svg
  designs/
    my-design-file-name/
      page1.pc
      page2.pc
    components/
      page.pc
      page2.pc
    onboarding-activation/
      dev-ready-version-2.pc


pseudocode:

<import src="@captec/design/"
*/

export const translateFigmaGraph = (
  graph: DependencyGraph,
  options: TranslateOptions
) => {
  let context = createContext2(graph, options);

  // atoms are the publicly available pieces
  context = translateAtoms(context);

  // previews are private and should not be directly referenced
  context = writePreviews(context);

  return context.files;
};

const translateAtoms = (context: TranslateContext2) => {
  context = writeFonts(context);
  return context;
};

const writePreviews = (context: TranslateContext2) => {
  for (const fileKey in context.graph) {
    const dep = context.graph[fileKey];
    if (dep.kind !== DependencyKind.DesignFile) {
      continue;
    }
    context = writeDesign(dep, context);
  }

  return context;
};

const writeDesign = (dep: DesignDependency, context: TranslateContext2) => {
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
  const importFilePaths = getDependencyImportFilePaths(entry, context.graph);
  for (const relativePath in importFilePaths) {
    context = addBuffer(
      `<import src="${resolvePath(relativePath, context)}" />\n`,
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

const writeFonts = (context: TranslateContext2) => {
  for (const key in context.graph) {
    const dep = context.graph[key];

    // content may be NULL if there is an error
    if (dep.kind !== DependencyKind.Font || !dep.content) {
      continue;
    }

    context = startFile(getFontFile(dep), dep.fileKey, context);
    context = addBuffer(dep.content, context);
    context = addFile(context);
  }

  return context;
};
type WriteElementBlockParts = {
  tagName: string;
  attributes?: string;
};

const writeElementBlock = (
  { tagName, attributes }: WriteElementBlockParts,
  writeBody: (context: TranslateContext2) => TranslateContext2,
  context: TranslateContext2
) => {
  context = addBuffer(
    `<${tagName}${attributes ? " " + attributes : ""}>\n`,
    context
  );
  context = startBlock(context);
  context = writeBody(context);
  context = endBlock(context);
  context = addBuffer(`</${tagName}>\n`, context);
  return context;
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

const writeStyleBlock = (
  selector: string,
  writeBody: (context: TranslateContext2) => TranslateContext2,
  context: TranslateContext2
) => {
  context = addBuffer(`${selector} {\n`, context);
  context = startBlock(context);
  context = writeBody(context);
  context = endBlock(context);
  context = addBuffer(`}\n`, context);
  return context;
};

const writeStyleDeclaration = (
  name: string,
  value: string,
  context: TranslateContext2,
  format = true
) => {
  if (name === "@include") {
    return addBuffer(`@include ${value};\n`, context);
  } else {
    return addBuffer(
      `${format ? kebabCase(name) : name}: ${value};\n`,
      context
    );
  }
};

const writeStyleDeclarations = (style: any, context: TranslateContext2) => {
  for (const propertyName in style) {
    const value = style[propertyName];
    if (Array.isArray(value)) {
      for (const part of value) {
        context = writeStyleDeclaration(propertyName, part, context);
      }
    } else {
      context = writeStyleDeclaration(propertyName, value, context);
    }
  }
  return context;
};

const getFontFile = (dep: FontDependency) => `atoms/${dep.fileKey}.pc`;
const getDesignPageFile = (page: any, dep: DesignDependency) =>
  `previews/${kebabCase(dep.name)}/${kebabCase(page.name)}.pc`;
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
      // Object.assign(filePaths, getDesignFileImportPaths(dep, graph));
    }
  }

  return filePaths;
};

const getDesignFileImportPaths = memoize(
  (entry: DesignDependency, graph: DependencyGraph) => {
    const filePaths = {};
    for (const canvas of entry.document.children) {
      filePaths[getDesignPageFile(canvas, entry)] = 1;
    }
    return filePaths;
  }
);

const getInlineStyle = (layer: any, context: TranslateContext2) => {
  const { absoluteBoundingBox } = layer;
  const style: any = {};

  if (layer.type === "FRAME") {
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

  return style;
};
