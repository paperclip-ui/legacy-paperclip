import * as chalk from "chalk";
import * as path from "path";
import { FigmaApi } from "./api";
import * as fsa from "fs-extra";
import { findLayer, httpGet, logError, logVerb, logWarn, md5 } from "./utils";
import * as https from "https";
import {
  DependencyGraph,
  DependencyKind,
  DesignDependency,
  DesignFileFontImport,
  DesignFileImport,
  DesignFileImportKind,
  ExportSettings,
  flattenNodes,
  ExcludeRule,
  FRAME_EXPORT_SETTINGS,
  getNodeById,
  getNodeExportFileName,
  getNodeParent,
  isExported,
  NodeType,
  getUniqueNodeName,
  shouldExport,
  getNodePage
} from "./state";
import { kebabCase, uniq } from "lodash";
import { DEFAULT_EXPORT_SETTINGS } from "./constants";

const LOAD_CHUNK_SIZE = 50;

type LoadDependenciesOptions = {
  exclude: ExcludeRule[];
  cwd: string;
};

export const loadDependencies = async (
  fileKeys: string[],
  api: FigmaApi,
  options: LoadDependenciesOptions
) => {
  let graph: DependencyGraph = {};

  // for TESTING only!
  const cacheFile = path.join(
    options.cwd,
    `${md5(JSON.stringify(fileKeys))}.cache`
  );

  if (fsa.existsSync(cacheFile) && !process.env.REFETCH) {
    graph = JSON.parse(fsa.readFileSync(cacheFile, "utf-8"));
  } else {
    // load all
    for (const fileKey of fileKeys) {
      await loadDesignFile(fileKey, api, options, graph);
    }

    if (process.env.CACHE || process.env.REFETCH) {
      fsa.writeFileSync(cacheFile, JSON.stringify(graph, null, 2));
    }
  }

  return graph;
};

const loadDesignFile = async (
  fileKey: string,
  api: FigmaApi,
  options: LoadDependenciesOptions,
  graph: DependencyGraph = {}
): Promise<DependencyGraph> => {
  if (graph[fileKey]) {
    return graph;
  }

  const imports: Record<string, DesignFileImport> = {};

  const dep = (graph[fileKey] = {
    kind: DependencyKind.Design,
    imports,
    name: null,
    fileKey,
    document: null,
    styles: null
  });

  const file = await api.getFile(fileKey);

  Object.assign(dep, {
    name: file.name,
    document: file.document,
    styles: file.styles
  });

  logVerb(`Loading design ${chalk.bold(file.name)}`);

  const fonts = await loadFonts(dep, graph);
  Object.assign(imports, fonts);

  // await loadFramePreviews(dep, graph, api);
  await loadMedia(dep, graph, api);

  const foreignComponentIds = Object.keys(file.components).filter(importId => {
    const node = getNodeById(importId, file.document);
    if (node && node.type == NodeType.Component) {
      return false;
    }
    return true;
  });

  await Promise.all(
    foreignComponentIds.map(async importId => {
      let componentInfo: any;

      const componentRef = file.components[importId];
      try {
        componentInfo = (await api.getComponent(componentRef.key)) as any;
      } catch (e) {
        if (e.status === 404) {
          logWarn(`Unable to find component ${chalk.bold(componentRef.name)}`);
          return;
        }
        return;
      }
      if (componentInfo.meta.file_key === fileKey) {
        return;
      }

      imports[importId] = {
        kind: DesignFileImportKind.Design,
        nodeId: componentInfo.meta.node_id,
        fileKey: componentInfo.meta.file_key
      };

      await loadDesignFile(componentInfo.meta.file_key, api, options, graph);
    })
  );

  await Promise.all(
    Object.keys(file.styles).map(async id => {
      const style = file.styles[id];
      try {
        const info = await api.getStyle(style.key);

        if (info.meta.file_key === fileKey) {
          return;
        }

        imports[id] = {
          kind: DesignFileImportKind.Design,
          nodeId: info.meta.node_id,
          fileKey: info.meta.file_key
        };
        await loadDesignFile(info.meta.file_key, api, options, graph);
      } catch (e) {
        logWarn(`Can't load style info for ${chalk.bold(style.name)}`);
        // console.log(e);
      }
    })
  );

  return graph;
};

const loadFonts = async (dep: DesignDependency, graph: DependencyGraph) => {
  const deps: Record<string, DesignFileFontImport> = {};
  const fonts = getDesignFonts(dep);

  await Promise.all(
    fonts.map(async font => {
      const fileKey = getFontKey(font);
      deps[font] = {
        kind: DesignFileImportKind.Font,
        fileKey
      };

      if (graph[fileKey]) {
        return;
      }

      const dep = (graph[fileKey] = {
        kind: DependencyKind.Font,
        fileKey: fileKey,
        content: null
      });

      try {
        logVerb(`Loading font ${chalk.bold(font)}`);

        let css = await httpGet({
          host: `fonts.googleapis.com`,
          path: `/css?family=${encodeURIComponent(
            font
          )}:100,200,300,400,500,600,700`
        });

        // PC doesn't support urls without "
        css = css.replace(/url\((.*?)\)/g, (_, url, ...args) => {
          return `url("${url}")`;
        });

        dep.content = "<style>\n" + css + "</style>";
      } catch (e) {
        logWarn(
          `Could not download ${chalk.bold(
            font
          )} font, you'll need to do it manually.`
        );
      }
    })
  );

  return deps;
};

const loadMedia = async (
  dep: DesignDependency,
  graph: DependencyGraph,
  api: FigmaApi
) => {
  let nodeIdsByExport: Record<
    string,
    {
      settings: ExportSettings;
      nodes: Record<string, Node>;
    }
  > = {};

  let mediaCount = 0;

  const walk = (node: any, each: any) => {
    if (node.type === "INSTANCE") {
      return;
    }
    each(node);
    if (node.children) {
      for (const child of node.children) {
        walk(child, each);
      }
    }
  };

  walk(dep.document, child => {
    if (shouldExport(child)) {
      const exportSettings = ((child as any).exportSettings?.length &&
        (child as any).exportSettings) || [
        DEFAULT_EXPORT_SETTINGS,
        FRAME_EXPORT_SETTINGS
      ];

      for (const setting of exportSettings) {
        if (setting.format === "PDF") {
          logWarn(`Cannot download PDF for layer: "${child.name}"`);
          continue;
        }

        if (setting.constraint.type !== "SCALE") {
          logWarn(
            `Cannot download "${child.name}" export since it doesn't have SCALE constraint.`
          );
          continue;
        }

        nodeIdsByExport = addNodeToDownload(child, nodeIdsByExport, setting);
        mediaCount++;
      }
    }
  });

  if (mediaCount === 0) {
    return;
  }

  logVerb(`Loading media for ${chalk.bold(dep.name)} (${mediaCount} assets)`);

  await Promise.all(
    Object.keys(nodeIdsByExport).map(async key => {
      const { settings, nodes } = nodeIdsByExport[key];
      await loadImages(nodes, settings, graph, dep, api);
    })
  );
};

const loadImages = async (
  nodes,
  settings: ExportSettings,
  graph: DependencyGraph,
  dep: DesignDependency,
  api: FigmaApi
) => {
  const nodeIds = Object.keys(nodes);

  // Need to chunk these assets, otherwise we may hug Figma to death.
  // let prog = 0;
  const promises = [];

  for (let i = 0, { length } = nodeIds; i < length; i += LOAD_CHUNK_SIZE) {
    const chunkIds = nodeIds.slice(i, i + LOAD_CHUNK_SIZE);
    // prog += chunkIds.length;
    // console.log((prog / length) * 100);
    promises.push(
      (async () => {
        try {
          const result = await api.getImage(dep.fileKey, {
            ids: chunkIds.join(","),
            format: settings.format.toLowerCase() as any,
            scale: settings.constraint.value
          });

          for (const nodeId in result.images) {
            const url = result.images[nodeId];
            const node = getNodeById(nodeId, dep.document);

            if (!url) {
              logError(
                `Could not fetch asset for ${chalk.bold(
                  String(dep.name) +
                    " / " +
                    getNodePage(nodeId, dep.document).name +
                    " / " +
                    node.name
                )}`
              );
              continue;
            }
            const fileKey = getNodeExportFileName(
              nodes[nodeId] as any,
              dep.document,
              settings
            );

            graph[fileKey] = {
              nodeId,
              settings,
              fileKey,
              kind: DependencyKind.Media,
              url: result.images[nodeId]
            };
          }
        } catch (e) {
          logError(`Can't fetch assets: ${chunkIds.join(", ")}`);
          logError(JSON.stringify(e));
        }
      })()
    );
  }

  await Promise.all(promises);
};

const loadFramePreviews = async (
  dep: DesignDependency,
  graph: DependencyGraph,
  api: FigmaApi
) => {
  const frames = {};
  logVerb(`Loading previews for ${chalk.bold(dep.name)}`);
  for (const canvas of dep.document.children) {
    if (canvas.type === NodeType.Canvas) {
      for (const frame of canvas.children) {
        if ((frame as any).visible !== false) {
          frames[frame.id] = frame;
        }
      }
    }
  }

  await loadImages(frames, FRAME_EXPORT_SETTINGS, graph, dep, api);
};

const getFontKey = font => kebabCase(font);

const getDesignFonts = (dep: DesignDependency) => {
  let fonts: string[] = [];

  findLayer(dep.document, descendent => {
    if (descendent.type === "TEXT") {
      fonts.push(descendent.style.fontFamily);
    }
    return false;
  });

  fonts = uniq(fonts);
  return fonts;
};

const addNodeToDownload = (child, rec, setting: any): any => {
  const key = getSettingKey(setting);

  if (!rec[key]) {
    rec[key] = { settings: setting, nodes: {} };
  }
  rec[key].nodes[child.id] = child;

  return rec;
};

const getSettingKey = setting =>
  setting.format + setting.constraint.type + setting.constraint.value;
