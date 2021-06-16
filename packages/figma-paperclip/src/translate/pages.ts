import { camelCase, curry, omit } from "lodash";
import * as path from "path";
import * as chalk from "chalk";
import * as tc from "tinycolor2";
import {
  DependencyGraph,
  DependencyKind,
  DesignDependency,
  extractMixedInStyles,
  flattenNodes,
  FRAME_EXPORT_SETTINGS,
  DEFAULT_SHAPE_EXPORT_SETTINGS,
  getInstanceComponent,
  getMixin,
  getNodeDependency,
  getNodeExportFileName,
  getNodeFrame,
  getNodeParent,
  isExported,
  shouldExport,
  DesignFileDesignImport,
  getUniqueNodeName,
  getNodeById
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
  getMixinName,
  getMixinValue,
  getStyleVarName,
  isStyleMixin,
  isStyleVar,
  writeElementBlock,
  writeStyleBlock,
  writeStyleDeclarations
} from "./utils";
import { getAtoms } from "./modules";
import { memoize } from "../memo";

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
  context = writeGenericStyles(context);
  context = writeGenericComponents(context);
  context = writePageFrames(page, context);
  context = addFile(context);
  return context;
};

const writeGenericStyles = (context: TranslateContext2) => {
  // style reset to make sure guides look good
  context = writeElementBlock(
    { tagName: "style" },
    context => {
      context = writeStyleBlock(
        "*",
        context => {
          return writeStyleDeclarations(
            {
              fontFamily: `sans-serif`
            },
            context
          );
        },
        context
      );
      context = writeStyleBlock(
        "hr",
        context => {
          return writeStyleDeclarations(
            {
              opacity: 0.5
            },
            context
          );
        },
        context
      );
      context = writeStyleBlock(
        ".asset-info",
        context => {
          return writeStyleDeclarations(
            {
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap"
            },
            context
          );
        },
        context
      );
      context = writeStyleBlock(
        ".frame-atom-info",
        context => {
          context = writeStyleDeclarations(
            {
              padding: "32px"
            },
            context
          );
          return context;
        },
        context
      );
      context = writeStyleBlock(
        ".color-blocks",
        context => {
          context = writeStyleDeclarations(
            {
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gridColumnGap: px(16),
              gridRowGap: px(16)
            },
            context
          );
          return context;
        },
        context
      );
      context = writeStyleBlock(
        ".color-block",
        context => {
          context = writeStyleDeclarations(
            {
              padding: px(20),
              fontWeight: 500
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

const writeGenericComponents = (context: TranslateContext2) => {
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
  context = writeFrameSummary(frame, context);
  return context;
};

const writeFrameSummary = (frame: any, context: TranslateContext2) => {
  return writeFrameSummaryOuter(frame, context);
};

const writeFrameSummaryOuter = (frame: any, context: TranslateContext2) => {
  return writeElementBlock(
    { tagName: "div" },
    context => {
      return writeFrameSummaryInner(frame, context);
    },
    context
  );
};

const writeFrameSummaryInner = (frame: any, context: TranslateContext2) => {
  context = writeFramePreview(frame, context);
  context = writeFrameAtomInfo(frame, context);
  return context;
};

const writeFramePreview = (frame: any, context: TranslateContext2) => {
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

const writeFrameAtomInfo = (frame: any, context: TranslateContext2) => {
  return writeElementBlock(
    { tagName: "div", attributes: `className="frame-atom-info"` },
    context => {
      return writeFrameAtomInfoInner(frame, context);
    },
    context
  );
};

const writeFrameAtomInfoInner = (frame: any, context: TranslateContext2) => {
  const colors = getFrameMixins(frame, "FILL", context);
  const typography = getFrameMixins(frame, "TEXT", context);
  const assets = getFrameAssets(
    frame,
    context.graph[context.currentFileKey] as DesignDependency
  );
  context = writeInfoSection(
    `Component Instances`,
    context => {
      context = writeInstancePreviews(frame, context);
      return context;
    },
    context
  );

  if (Object.keys(colors).length) {
    context = writeInfoSection(
      `Colors`,
      context => {
        context = writeColorBlocks(colors, context);
        return context;
      },
      context
    );
  }
  if (Object.keys(typography).length) {
    context = writeInfoSection(
      `Typography`,
      context => {
        context = writeTypographyInfo(typography, context);
        return context;
      },
      context
    );
  }

  if (assets.length) {
    context = writeInfoSection(
      `Assets`,
      context => {
        context = writeAssetInfo(assets, context);
        return context;
      },
      context
    );
  }

  return context;
};

const writeInstancePreviews = (frame: any, context: TranslateContext2) => {
  const dep = context.graph[context.currentFileKey] as DesignDependency;
  const instances = flattenNodes(frame).filter(
    layer => layer.type === "INSTANCE"
  ) as any;

  const used = {};

  for (const instance of instances) {
    context = writeInstancePreview(instance, dep, used, context);
  }

  return context;
};

const writeInstancePreview = (
  instance: any,
  dep: DesignDependency,
  used: any,
  context: TranslateContext2
) => {
  const imp = dep.imports[instance.componentId] as DesignFileDesignImport;

  let impDep;
  let component;

  if (imp) {
    impDep = context.graph[imp.fileKey] as DesignDependency;
    component = getNodeById(imp.nodeId, impDep.document);
  } else {
    impDep = dep;
    component = getNodeById(instance.componentId, dep.document);
  }

  if (!component || used[component.id]) {
    // console.log("SKIP", instance.componentId, !!imp);
    return context;
  }

  used[component.id] = 1;

  const path = [];

  if (impDep !== dep) {
    path.push(getDependencyImportId(impDep));
  }

  path.push(camelCase(getUniqueNodeName(component, impDep)));

  context = writeElementBlock(
    { tagName: "div" },
    context => {
      context = addBuffer(
        `<img src="${resolvePath(
          getLayerMediaPath(component, impDep, FRAME_EXPORT_SETTINGS),
          context
        )}" />\n`,
        context
      );
      return context;
    },
    context
  );

  return context;
};

const getFrameAssets = (frame: any, dep: DesignDependency) => {
  const exports = [];
  const walk = (node: any) => {
    if (node.type === "INSTANCE") {
      return;
    }

    if (isExported(node)) {
      exports.push(node);
    }

    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  };

  walk(frame);

  return exports.map(exp =>
    getLayerMediaPath(
      exp,
      dep,
      isExported(exp) ? exp.exportSettings[0] : DEFAULT_SHAPE_EXPORT_SETTINGS
    )
  );
};

const writeColorBlocks = (
  colors: Record<string, string>,
  context: TranslateContext2
) => {
  context = writeElementBlock(
    { tagName: "div", attributes: `className="color-blocks"` },
    context => {
      for (const name in colors) {
        context = writeColorBlock(name, colors[name], context);
      }
      return context;
    },
    context
  );
  return context;
};

const writeTypographyInfo = (
  typography: Record<string, any>,
  context: TranslateContext2
) => {
  for (const name in typography) {
    context = addBuffer(`<div className="${name}">.${name}</div>\n`, context);
  }
  return context;
};

const writeAssetInfo = (assets: string[], context: TranslateContext2) => {
  return writeElementBlock(
    { tagName: "div", attributes: "asset-info" },
    context => {
      for (const asset of assets) {
        context = writeAssetInfoItem(asset, context);
      }
      return context;
    },
    context
  );
};

const writeAssetInfoItem = (asset: string, context: TranslateContext2) => {
  return writeElementBlock(
    { tagName: "div", attributes: "asset-info-item" },
    context => {
      context = addBuffer(
        `<img src="${resolvePath(asset, context)}" />`,
        context
      );
      context = addBuffer(`<label>${asset}</label>`, context);
      return context;
    },
    context
  );
};

const writeColorBlock = (
  name: string,
  value: string,
  context: TranslateContext2
) => {
  const color = tc(value);
  const contrastedColor = color.isDark() ? "white" : "black";
  context = writeElementBlock(
    {
      tagName: "div",
      attributes: `className="color-block" style="background-color: var(${name}); color: ${contrastedColor}"`
    },
    context => {
      context = addBuffer(`var(${name})\n`, context);
      return context;
    },
    context
  );
  return context;
};

const getFrameMixins = (
  frame: any,
  styleType: string,
  context: TranslateContext2
) => {
  const dep = context.graph[context.currentFileKey] as DesignDependency;
  const layersWithMixins = getLayersWithMixins(frame) as any[];

  const info = {};

  for (const layer of layersWithMixins) {
    const mixedInStyled = extractMixedInStyles(layer);
    for (const mixinId in mixedInStyled) {
      const mixin = getMixin(mixinId, dep, context.graph);
      if (mixin.styleType === styleType) {
        info[getMixinName(mixin)] = getMixinValue(
          mixin,
          mixedInStyled[mixinId]
        );
      }
    }
  }

  return info;
};

const getLayersWithMixins = memoize((node: any) => {
  const flattened = [];
  const walk = (node: any) => {
    if (/^(INSTANCE|ELLIPSE|LINE|BOOLEAN_OPERATION|VECTOR)$/.test(node.type)) {
      return;
    }
    if (node.styles && Object.keys(node.styles).length) {
      flattened.push(node);
    }
    if (node.children) {
      node.children.forEach(walk);
    }
  };
  walk(node);
  return flattened;
});

const writeInfoSection = (
  label: string,
  write: (context: TranslateContext2) => TranslateContext2,
  context: TranslateContext2
) => {
  context = addBuffer(`<h1>${label}</h1>\n`, context);
  context = addBuffer(`<hr />\n`, context);
  context = write(context);
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
    const mixinName = getMixinName(mixin);

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
