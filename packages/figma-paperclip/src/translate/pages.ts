import { camelCase, omit } from "lodash";
import * as path from "path";
import * as chalk from "chalk";
import {
  DependencyGraph,
  DependencyKind,
  DesignDependency,
  extractMixedInStyles,
  FRAME_EXPORT_SETTINGS,
  getInstanceComponent,
  getNodeDependency,
  getNodeExportFileName,
  getNodeFrame,
  getNodeParent,
  isExported
} from "../state";
import {
  addBuffer,
  addFile,
  endBlock,
  getLayerStyle,
  logContextWarn,
  px,
  startBlock,
  startPageFile,
  TranslateContext2
} from "./context";
import {
  getDesignModulesFile,
  getDesignPageFile,
  getFontFile,
  getLayerMediaPath,
  getStyleName,
  isStyleMixin,
  isStyleVar,
  writeElementBlock,
  writeStyleDeclarations
} from "./utils";
import { getAtoms } from "./modules";

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
  context = startPageFile(
    getDesignPageFile(page, dep),
    dep.fileKey,
    page.name,
    context
  );

  // skip altogether if relative path is null
  if (context.currentRelativeFilePath == null) {
    return context;
  }
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
  // context = writeLayer(frame, context);
  context = writeFrameSummary(frame, context);
  return context;
};

const writeFrameSummary = (frame: any, context: TranslateContext2) => {
  const framePreviewAssetPath = getLayerMediaPath(
    frame,
    context.graph[context.currentFileKey] as DesignDependency,
    FRAME_EXPORT_SETTINGS
  );

  // Just want to display the frame preview and not the whole thing
  context = writeElementBlock(
    {
      tagName: "img",
      attributes: `src="${resolvePath(framePreviewAssetPath, context)}"`
    },
    context => {
      context = writeElementBlock(
        { tagName: "style" },
        context => {
          context = writeStyleDeclarations(
            {
              width: "100vw"
            },
            context
          );
          return context;
        },
        context
      );
      return context;
    },
    context
  );

  return context;
};

const writeLayer = (layer: any, context: TranslateContext2) => {
  if (isExported(layer)) {
    return writeExportedLayer(layer, context);
  }

  switch (layer.type) {
    case "COMPONENT_SET":
    case "GROUP":
    case "COMPONENT":
    case "FRAME":
    case "RECTANGLE":
      return writeElementLayer(layer, context);
    case "INSTANCE":
      return writeInstanceLayer(layer, context);
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

const writeExportedLayer = (
  layer: any,
  context: TranslateContext2,
  instance = layer
) => {
  const assetPath = getLayerMediaPath(
    layer,
    getNodeDependency(layer, context.graph),
    layer.exportSettings[0]
  );

  const attributes = `src="${path.relative(
    path.dirname(context.currentRelativeFilePath),
    assetPath
  )}"`;

  context = writeElementBlock(
    { tagName: "img", attributes },
    context => {
      context = writeLayerStyle(
        instance,
        context,
        WriteLayerStyleMode.Position
      );
      return context;
    },
    context
  );
  return context;
};

const writeInstanceLayer = (layer: any, context: TranslateContext2) => {
  const component = getInstanceComponent(
    layer,
    getNodeDependency(layer, context.graph).fileKey,
    context.graph
  );
  if (!component || !isExported(component)) {
    return writeElementLayer(layer, context);
  }
  return writeExportedLayer(component, context, layer);
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

enum WriteLayerStyleMode {
  Position = 1 << 2,
  Style = 2 << 2,
  Everything = (1 << 2) | (2 << 2)
}

const writeLayerStyle = (
  layer: any,
  context: TranslateContext2,
  mode: WriteLayerStyleMode = WriteLayerStyleMode.Everything
) => {
  let style;
  [style, context] = getInlineStyle(layer, context, mode);
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

      context = addBuffer(encodeURIComponent(layer.characters) + "\n", context);
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
      `<import src="${resolvePath(relativePath, context)}" as="${getImportId(
        relativePath
      )}" inject-styles />\n`,
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
  context = addBuffer(
    `@source ${JSON.stringify(
      `https://www.figma.com/file/${
        context.currentFileKey
      }?node-id=${encodeURIComponent(layer.id)}`
    )}\n`,
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
    } else if (dep.kind === DependencyKind.Design) {
      filePaths[getDesignModulesFile(dep)] = 1;
    }
  }

  return filePaths;
};

const getInlineStyle = (
  layer: any,
  context: TranslateContext2,
  mode: WriteLayerStyleMode = WriteLayerStyleMode.Everything
) => {
  const { absoluteBoundingBox } = layer;
  const parent = getNodeParent(
    layer,
    getNodeDependency(layer, context.graph).document
  );
  let style: any = {};

  if (parent.type === "CANVAS" && mode & WriteLayerStyleMode.Position) {
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

  if (mode & WriteLayerStyleMode.Style) {
    Object.assign(style, getLayerStyle(layer));
    [style, context] = addStyleMixins(layer, style, context);
  }

  return [style, context];
};

const addStyleMixins = (layer: any, style: any, context: TranslateContext2) => {
  const dep = getNodeDependency(layer, context.graph) as DesignDependency;
  let newStyle = { ...style };

  // { mixinId: styleObject }
  const mixedInStyles = extractMixedInStyles(layer);
  for (const refId in mixedInStyles) {
    const imp = dep.imports[refId] as any;
    const mixinId = imp?.nodeId || refId;
    const impDep = (imp ? context.graph[imp.fileKey] : dep) as DesignDependency;
    const mixin = impDep.styles[mixinId];
    const mixedInStyle = mixedInStyles[refId];
    const atoms = getAtoms(impDep, context.graph);
    const mixinName = getStyleName(mixin);

    if (!atoms.mixins[mixinName] && !atoms.vars[mixinName]) {
      context = logContextWarn(
        `Could not find style ${chalk.bold(mixin.name)} in design ${chalk.bold(
          `${dep.name} / ${context.currentPageName}`
        )}`,
        context
      );
      continue;
    }

    if (isStyleMixin(mixin)) {
      newStyle = omit(newStyle, Object.keys(mixedInStyle));

      const path = [getDependencyImportId(impDep), mixinName];

      newStyle = addInclude(path.join("."), newStyle);
    } else if (isStyleVar(mixin)) {
      for (const key in mixedInStyle) {
        newStyle[key] = `var(${mixinName})`;
      }
    }
  }
  return [newStyle, context];
};

const addInclude = (value: string, style: any) => {
  let newStyle = { ...style };
  if (!newStyle["@include"]) {
    newStyle["@include"] = [];
  }
  newStyle["@include"].push(value);
  return newStyle;
};

const getDependencyImportId = (dep: DesignDependency) => {
  return getImportId(getDesignModulesFile(dep));
};

const getImportId = (relativePath: string) => {
  return camelCase(relativePath.replace(/\.pc$/, "").replace("/index", ""));
};
