import {
  COMMAND_NAME,
  configFileExists,
  logError,
  extractSourceUrlInfo,
  readConfig,
  SourceUrlInfo,
  logInfo,
  httpGet,
  findLayer,
  logWarn
} from "./utils";
import * as chalk from "chalk";
import * as path from "path";
import * as fsa from "fs-extra";
import * as plimit from "p-limit";
import { FigmaApi } from "./api";
import { kebabCase, uniq } from "lodash";
import { translate } from "./translate";
import { OutputFile } from "./base";
import { Dependency2, DependencyGraph, getNodeById, NodeType } from "./state";

export type PullOptions = {
  cwd: string;
  token: string;
};

export const pull = async ({ cwd, token }: PullOptions) => {
  if (!configFileExists(cwd)) {
    return logError(
      `Config not found, try running ${chalk.bold(
        `${COMMAND_NAME} init`
      )} first!`
    );
  }

  const config = readConfig(cwd);

  const api = new FigmaApi(token);
  const info = config.sources.map(extractSourceUrlInfo);
  const fileKeys = await getFileKeys(info, api);

  const outputDir = path.join(cwd, config.outputDir);

  const graph = await loadDependencies(fileKeys, api);
  const fontFiles: OutputFile[] = await downloadFonts(graph, outputDir);
  // const exportFiles: OutputFile[] = await downloadExports(graph, api);
  const pcFiles: OutputFile[] = await translateDesigns(graph, outputDir, [
    ...fontFiles.map(file => file.path)
  ]);

  const allFiles = [...fontFiles, ...pcFiles];

  for (const file of allFiles) {
    await writeFile(file, api);
  }
};

const loadDependencies = async (fileKeys: string[], api: FigmaApi) => {
  const graph: DependencyGraph = {};
  for (const fileKey of fileKeys) {
    await loadDependency(fileKey, api, graph);
  }
  return graph;
};

const loadDependency = async (
  fileKey: string,
  api: FigmaApi,
  graph: DependencyGraph = {}
): Promise<DependencyGraph> => {
  if (graph[fileKey]) {
    return graph;
  }

  const imports = {};

  const dep = (graph[fileKey] = {
    imports,
    name: null,
    fileKey,
    document: null
  });

  const file = await api.getFile(fileKey);

  Object.assign(dep, {
    name: file.name,
    document: file.document
  });

  logInfo(`Loading ${file.name}`);

  const limit = plimit(10);
  const foreignComponentIds = Object.keys(file.components).filter(importId => {
    const node = getNodeById(importId, file.document);
    if (node && node.type == NodeType.Component) {
      return false;
    }

    return true;
  });

  await Promise.all(
    foreignComponentIds.map(importId => {
      return limit(async () => {
        const componentRef = file.components[importId];

        let componentInfo: any;

        try {
          componentInfo = (await api.getComponent(componentRef.key)) as any;
        } catch (e) {
          if (e.status === 404) {
            logWarn(`Unable to find component: ${componentRef.name}`);
            return;
          }

          throw e;
        }

        if (componentInfo.meta.file_key === fileKey) {
          return;
        }

        imports[importId] = {
          nodeId: componentInfo.meta.node_id,
          fileKey: componentInfo.meta.file_key
        };

        await loadDependency(componentInfo.meta.file_key, api, graph);
      });
    })
  );

  await Promise.all(
    Object.keys(file.styles).map(id =>
      limit(async () => {
        const style = file.styles[id];
        try {
          const info = await api.getStyle(style.key);
          await loadDependency(info.meta.file_key, api, graph);
        } catch (e) {
          logWarn(`Can't load style info for ${chalk.bold(style.name)}`);
        }
      })
    )
  );

  return graph;
};

const downloadExports = async (graph: DependencyGraph, api: FigmaApi) => {
  const files: OutputFile[] = [];
  const exports = {};

  for (const design of Object.values(graph)) {
    findLayer(design.document, layer => {
      if (layer.exportSettings) {
        for (const settings of layer.exportSettings) {
          if (settings.format === "PDF") {
            logWarn(`Cannot download PDF for layer: "${layer.name}"`);
            continue;
          }

          if (settings.constraint.type !== "SCALE") {
            logWarn(
              `Cannot download "${layer.name}" export since it doesn't have SCALE constraint.`
            );
            continue;
          }
          addNodeToDownload(layer, exports, settings);
        }
      }
      return false;
    });

    for (const key in exports) {
      const { settings, nodes } = exports[key];

      const nodeIds = Object.keys(nodes);
      const chunkSize = 10;
      for (let i = 0, { length } = nodeIds; i < length; i += chunkSize) {
        const chunk = nodeIds.slice(i, i + chunkSize);

        console.log(chunk);

        try {
          const result = await api.getImage(design.fileKey, {
            ids: chunk.join(","),
            format: settings.format.toLowerCase() as any,
            scale: settings.constraint.value
          });
          for (const nodeId in result.images) {
            console.log(result.images[nodeId]);
            // await downloadImageRef(
            //   client,
            //   destPath,
            //   getNodeExportFileName(nodes[nodeId], module.document, settings)
            //     .split(".")
            //     .shift(),
            //   result.images[nodeId]
            // );
          }
        } catch (e) {
          logError(`Could not download exports for ${chunk.join(", ")}`);
          console.log(e);
        }
      }
    }
  }

  // const result = await client.getImage(module.fileKey, {
  //   ids: Object.keys(nodes).join(","),
  //   format: settings.format.toLowerCase() as any,
  //   scale: settings.constraint.value
  // });

  return files;
};

const getSettingKey = setting =>
  setting.format + setting.constraint.type + setting.constraint.value;

const addNodeToDownload = (child, rec, setting: any): any => {
  const key = getSettingKey(setting);

  if (!rec[key]) {
    rec[key] = { settings: setting, nodes: {} };
  }
  rec[key].nodes[child.id] = child;

  return rec;
};

const downloadFonts = async (graph: DependencyGraph, cwd: string) => {
  logInfo(`Loading fonts`);
  const files: OutputFile[] = [];
  const fonts = getDesignFonts(graph);

  const limit = plimit(6);

  await Promise.all(
    fonts.map(font =>
      limit(async () => {
        try {
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

          const content = "<style>\n" + css + "</style>";

          files.push({
            path: path.join(cwd, "typography", kebabCase(font) + ".pc"),
            content
          });
        } catch (e) {
          logError(
            `Could not download ${chalk.bold(
              font
            )} font, you'll need to do it manually.`
          );
        }
      })
    )
  );
  for (const font of fonts) {
  }

  return files;
};

const writeFile = (file: OutputFile, api: FigmaApi) => {
  fsa.mkdirpSync(path.dirname(file.path));

  if (file.content) {
    fsa.writeFileSync(file.path, file.content);
    logInfo(`Write ${path.relative(process.cwd(), file.path)}`);
  }
};

const translateDesigns = (
  graph: DependencyGraph,
  outputDir: string,
  includes: string[]
) => {
  const files: OutputFile[] = [];
  for (const dep of Object.values(graph)) {
    files.push(...translateDesign(dep, outputDir, includes));
  }
  return files;
};

const translateDesign = (
  dep: Dependency2,
  outputDir: string,
  includes: string[]
) => {
  const files: OutputFile[] = [];
  for (const page of dep.document.children) {
    files.push(...translatePage(page, dep.name, outputDir, includes));
  }
  return files;
};

const getDesignFonts = (graph: DependencyGraph) => {
  let fonts: string[] = [];
  for (const dep of Object.values(graph)) {
    findLayer(dep.document, descendent => {
      if (descendent.type === "TEXT") {
        fonts.push(descendent.style.fontFamily);
      }
      return false;
    });
  }
  fonts = uniq(fonts);
  return fonts;
};

const translatePage = (
  page: any,
  designName: string,
  cwd: string,
  includes: string[]
) => {
  // const filePath = path.join(cwd, kebabCase(designName), kebabCase(page.name) + ".pc");

  const content = translate(page, {
    cwd: path.join(cwd, kebabCase(designName)),
    includes
  });

  // return [{ path: filePath, content }]
  return content;
};

const getFileKeys = async (
  info: SourceUrlInfo[],
  api: FigmaApi
): Promise<string[]> => {
  const fileKeys = [];
  for (const part of info) {
    if (part.fileKey) {
      fileKeys.push(part.fileKey);
    } else if (part.projectId) {
      const projectFiles = await api.getProjectFiles(part.projectId);
      for (const projectFile of projectFiles) {
        fileKeys.push(projectFile.fileKey);
      }
    }
  }

  return fileKeys;
};
