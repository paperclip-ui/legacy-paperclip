#!/usr/bin/env node
import {
  CONFIG_FILE_NAME,
  PC_FILE_EXTENSION,
  DEPENDENCIES_NAMESPACE,
  PC_CONFIG_FILE_NAME,
  DEFAULT_COMPILER_TARGET_NAME
} from "./constants";
import * as inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";
import * as fsa from "fs-extra";
import * as https from "https";
import * as chalk from "chalk";
import * as mime from "mime";
import { camelCase, kebabCase, snakeCase } from "lodash";
import * as crypto from "crypto";
import plimit from "p-limit";
import {
  Config,
  readConfigSync,
  flattenNodes,
  Node,
  isExported,
  ExportSettings,
  getNodeExportFileName,
  FileNameFormat,
  CompilerOptions,
  Project,
  ProjectFile,
  NodeType,
  getAllComponents,
  DependencyGraph,
  Dependency2,
  Import,
  getNodeById
} from "./state";
import { translateFigmaProjectToPaperclip } from "./translate-pc";
import {
  logInfo,
  logSuccess,
  pascalCase,
  logWarn,
  exec,
  SourceUrlInfo,
  installDependencies,
  logError,
  extractSourceUrlInfo
} from "./utils";
import { FigmaApi } from "./api";

const cwd = process.cwd();
const WATCH_TIMEOUT = 1000 * 5;
const LATEST_VERSION_NAME = "latest";
const MAX_CONCURRENT_DOWNLOADS = 10;

const configFilePath = path.join(cwd, CONFIG_FILE_NAME);

export const init = async () => {
  const { personalAccessToken, sourceUrl, dest } = await inquirer.prompt([
    {
      name: "personalAccessToken",
      message: "What's your Figma personal access token?"
    },
    {
      name: "sourceUrl",
      message: "What project URL would you like to sync?"
    },
    {
      name: "dest",
      default: "./src/design-generated",
      message: "Where would you like the Figma files to live?"
    }
  ]);

  const client = new FigmaApi(personalAccessToken);
  const projectUrlInfo = extractSourceUrlInfo(sourceUrl);

  logInfo("Fetching files versions...");

  const fileVersions = await getFileVersions(
    client,
    projectUrlInfo,
    () => LATEST_VERSION_NAME
  );

  const pcConfig = {
    compilerOptions: {
      // TODO - this eventuall be a list
      name: "paperclip-compiler-react"
    },
    filesGlob: "./" + path.join(dest, "**/*.pc"),
    dropPcExtension: true
  };

  const config: Config = {
    dest,
    fileNameFormat: FileNameFormat.KebabCase,
    personalAccessToken,
    sourceUrl,
    fileVersions,
    compilerOptions: {
      includeAbsoluteLayout: false,
      includePreviews: true
    },
    compileOnPull: true
  };

  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
  logInfo(
    `Created ${CONFIG_FILE_NAME} - ${chalk.gray(
      "this is there your config lives"
    )}`
  );

  if (!fs.existsSync(path.join(cwd, "package.json"))) {
    await exec("npm", ["init", "--fl"], cwd, false);
    logInfo(
      `Created package.json - ${chalk.gray("this is for Figmark dependencies")}`
    );
  }

  // TODO - may want to incude version numbers here
  await installDependencies(
    [DEFAULT_COMPILER_TARGET_NAME, "paperclip", "paperclip-cli"],
    cwd,
    true
  );

  fs.writeFileSync(
    path.join(cwd, PC_CONFIG_FILE_NAME),
    JSON.stringify(pcConfig, null, 2)
  );
  logInfo(
    `Created ${PC_CONFIG_FILE_NAME} - ${chalk.gray("compile target config")}`
  );
  fsa.mkdirpSync(dest);
  logInfo(`Created ${dest}`);
  logSuccess(`All done! Go ahead and run ${chalk.bold("figmark pull")}`);
};

type SyncOptions = {
  watch?: boolean;
};

const defaultVersionGetter = (versions: any[]) =>
  versions.length > 0 ? versions[0].id : LATEST_VERSION_NAME;

const getFileVersions = async (
  client: FigmaApi,
  sourceInfo: SourceUrlInfo,
  getVersion = defaultVersionGetter
) => {
  const files = await getSourceInfoFiles(client, sourceInfo);
  const map = {};
  for (const file of files) {
    const { versions } = await client.getVersions(file.key);
    map[file.key] = getVersion(versions);
  }
  return map;
};

const getSourceInfoFiles = (
  client: FigmaApi,
  { teamId, projectId }: SourceUrlInfo
) => {
  if (teamId) {
    return getTeamFiles(client, teamId);
  }
  return client.getProjectFiles(projectId);
};
const getSourceProjects = async (
  client: FigmaApi,
  { teamId, projectId, projectName }: SourceUrlInfo
) => {
  if (teamId) {
    return getTeamProjects(client, teamId);
  }
  return [await getAdditionalProjectInfo(client, projectId, projectName)];
};

const getTeamProjects = async (client: FigmaApi, teamId: string) => {
  const projects: Project[] = [];
  const { projects: remoteProjects } = await client.getTeamProjects(teamId);
  for (const project of remoteProjects) {
    projects.push(
      await getAdditionalProjectInfo(client, project.id, project.name)
    );
  }

  return projects;
};

const getAdditionalProjectInfo = async (
  client: FigmaApi,
  projectId: number,
  projectName: string
) => {
  const { files: remoteFiles } = await client.getProjectFiles(projectId);

  return {
    id: projectId,
    name: projectName,
    files: remoteFiles.map(file => ({
      key: file.key,
      name: file.name
    }))
  };
};

const getTeamFiles = async (client: FigmaApi, teamId: string) => {
  const projects = await getTeamProjects(client, teamId);
  const allFiles: ProjectFile[] = [];
  for (const project of projects) {
    allFiles.push(...project.files);
  }

  return allFiles;
};

export const pull = async ({ watch }: SyncOptions) => {
  if (!fs.existsSync(configFilePath)) {
    return console.error(
      `No config found -- try running "figmark init" first.`
    );
  }

  logInfo(`Downloading latest Figma designs`);

  const config: Config = readConfigSync(process.cwd());
  const {
    personalAccessToken,
    dest,
    sourceUrl,
    fileVersions,
    fileNameFormat,
    compilerOptions
  } = config;

  const syncDir = path.join(cwd, dest);
  const sourceInfo = extractSourceUrlInfo(sourceUrl);

  const client = new FigmaApi(personalAccessToken);

  let graph;

  // for testing
  if (true) {
    graph = JSON.parse(
      fs.readFileSync(__dirname + "/../mock/graph-1.json", "utf8")
    );
  } else {
    graph = await loadDependencyGraph(
      client,
      syncDir,
      fileNameFormat,
      sourceInfo
    );
  }
  fs.writeFileSync(
    __dirname + `/../mock/graph-1.json`,
    JSON.stringify(graph, null, 2)
  );

  for (const filePath in graph) {
    await downloadProjectFile(
      client,
      graph[filePath],
      graph,
      compilerOptions,
      config
    );
  }

  if (watch) {
    setTimeout(pull, WATCH_TIMEOUT, { watch });
  } else {
    logInfo(`Downloaded all assets 🎨`);
  }
};

const EXTENSIONS = {
  "image/png": ".png",
  "image/svg+xml": ".svg",
  "image/jpeg": ".jpg"
};

const formatFileName = (name: string, fileNameFormat: FileNameFormat) => {
  switch (fileNameFormat) {
    case FileNameFormat.CamelCase: {
      return camelCase(name);
    }
    case FileNameFormat.KebabCase: {
      return kebabCase(name);
    }
    case FileNameFormat.PascalCase: {
      return pascalCase(name);
    }
    case FileNameFormat.SnakeCase: {
      return snakeCase(name);
    }
    default: {
      return name;
    }
  }
};

const loadDependencyGraph = async (
  client: FigmaApi,
  syncDir: string,
  fileNameFormat: FileNameFormat,
  source: SourceUrlInfo
) => {
  const projects = await getSourceProjects(client, source);
  const graph: DependencyGraph = {};
  for (const project of projects) {
    for (const file of project.files) {
      await loadDependency(
        client,
        syncDir,
        file.key,
        fileNameFormat,
        projects,
        graph
      );
    }
  }
  return graph;
};

const loadDependency = async (
  client: FigmaApi,
  syncDir: string,
  fileKey: string,
  fileNameFormat: FileNameFormat,
  projects: Project[],
  graph: DependencyGraph
) => {
  const imports: Record<string, Import> = {};

  const filePath = getFileKeySourcePath(
    fileKey,
    syncDir,
    fileNameFormat,
    projects
  );

  if (graph[filePath]) {
    return;
  }

  const file = await client.getFile(fileKey, {
    geometry: "paths"
  });
  logInfo(`Loading ${file.name}`);

  graph[filePath] = {
    imports,
    filePath,
    name: file.name,
    fileKey,
    document: file.document as any
  };

  const limit = plimit(10);
  const componentIds = Object.keys(file.components).filter(importId => {
    const node = getNodeById(importId, file.document);
    if (node && node.type == NodeType.Component) {
      return false;
    }

    return true;
  });
  // const progress = new Progress(`Loading ${file.name}: :bar`, { total: componentIds.length + 1 });

  await Promise.all(
    componentIds.map(importId => {
      return limit(async () => {
        const componentRef = file.components[importId];
        if (componentRef.key) {
          let componentInfo;

          try {
            componentInfo = (await client.getComponent(
              componentRef.key
            )) as any;
          } catch (e) {
            if (e.status === 404) {
              logError(`Unable to find component: ${componentRef.name}`);
              return;
            }

            throw e;
          }

          // progress.tick();

          if (componentInfo.meta.file_key === fileKey) {
            return;
          }
          const depFilePath = getFileKeySourcePath(
            componentInfo.meta.file_key,
            syncDir,
            fileNameFormat,
            projects
          );
          imports[importId] = {
            nodeId: componentInfo.meta.node_id,
            filePath: depFilePath
          };

          await loadDependency(
            client,
            syncDir,
            componentInfo.meta.file_key,
            fileNameFormat,
            projects,
            graph
          );

          // progress.tick();
        }
      });
    })
  );
};

const downloadProjectFile = async (
  client: FigmaApi,
  module: Dependency2,
  graph: DependencyGraph,
  compilerOptions: CompilerOptions,
  config: Config
) => {
  const fileDir = path.dirname(module.filePath);
  fsa.mkdirpSync(fileDir);

  logInfo(`Translating ${chalk.bold(module.name)} to Paperclip`);

  const fontPaths = await downloadFonts(module, config.fileNameFormat);

  const pcContent = translateFigmaProjectToPaperclip(
    module.filePath,
    graph,
    compilerOptions,
    fontPaths
  );

  // if (fs.existsSync(module.filePath)) {
  //   const existingFileContent = fs.readFileSync(module.filePath, "utf8");

  //   if (existingFileContent === pcContent) {
  //     return;
  //   }
  // }

  fs.writeFileSync(module.filePath, pcContent);

  // await downloadImageRefs(client, module, fileDir);
  // await downloadNodeImages(
  //   client,
  //   module,
  //   fileDir
  // );

  // Compiling for convenience so that users can start including
  // designs immediately
  if (config.compileOnPull) {
    await compilePC(module.filePath);
  }
};

const compilePC = async (filePath: string) => {
  logInfo(`Compiling ${path.relative(cwd, filePath)}`);

  // Note that since we're compiling to JS directly, we need to drop the *.pc extension
  // so that the file can be loaded into NodeJS. (*.pc.js doesn't work since require("./*.pc") loads the *.pc file instead)
  await exec(`./node_modules/.bin/paperclip`, [filePath], cwd, false);
  await exec(
    `./node_modules/.bin/paperclip`,
    [filePath, "--only=d.ts"],
    cwd,
    false
  );
};

const downloadFonts = async (
  module: Dependency2,
  fileNameFormat: FileNameFormat
): Promise<string[]> => {
  const fontFamilyMap = {};
  for (const node of flattenNodes(module.document) as any) {
    if (node.style && node.style.fontFamily) {
      if (!fontFamilyMap[node.style.fontFamily]) {
        fontFamilyMap[node.style.fontFamily] = {};
      }
      fontFamilyMap[node.style.fontFamily][node.style.fontWeight || 400] = 1;
    }
  }
  const limit = plimit(5);

  const fontFamilies = Object.keys(fontFamilyMap);
  return (
    await Promise.all(
      fontFamilies.map(family => {
        const weights = Object.keys(fontFamilyMap[family]);
        return limit(() => {
          return new Promise(resolve => {
            https.get(
              `https://fonts.googleapis.com/css?family=${encodeURIComponent(
                family
              )}:${weights.join(",")}`,
              response => {
                if (response.statusCode !== 200) {
                  logWarn(
                    `Cannot download Google font ${chalk.bold(
                      family
                    )}. You'll need to include it manually.`
                  );
                  return resolve(null);
                }

                let buffer = "";

                response.on("data", chunk => {
                  buffer += chunk;
                });

                response.on("end", async chunk => {
                  const fontUrls = buffer
                    .match(/url\((.*?)\)/g)
                    .map(url => url.replace(/url\((.*?)\)/, "$1"));

                  for (const url of fontUrls) {
                    const fileName = await downloadFont(
                      url,
                      path.dirname(module.filePath)
                    );
                    buffer = buffer.replace(url, `./${fileName}`);
                  }
                  const basename =
                    formatFileName(family, fileNameFormat) + ".pc";

                  fs.writeFileSync(
                    path.join(path.dirname(module.filePath), basename),
                    wrapCSSContentInPC(buffer)
                  );
                  resolve(basename);
                });
              }
            );
          });
        });
      })
    )
  ).filter(Boolean) as string[];
};

const wrapCSSContentInPC = (buffer: string) => {
  return `<style>\n` + buffer + `\n</style>`;
};

const downloadFont = (url: string, dir: string) =>
  new Promise((resolve, reject) => {
    https.get(url, response => {
      const contentType = response.headers["content-type"];
      const ext = mime.getExtension(contentType);
      const hash =
        crypto
          .createHash("md5")
          .update(url)
          .digest("hex") + url.match(/\.\w+/).pop();
      const fileName = `${hash}.${ext}`;

      const stream = fs.createWriteStream(path.join(dir, fileName));
      response.pipe(stream);

      response.on("close", () => {
        resolve(fileName);
      });
    });
  });

const downloadImageRefs = async (
  client: FigmaApi,
  module: Dependency2,
  destPath: string
) => {
  const result = await client.getImageFills(module.fileKey);
  const allComponentNodes = getAllComponents(module.document).reduce(
    (allComponents, component) => {
      allComponents.push(...flattenNodes(component));
      return allComponents;
    },
    []
  );

  let refIdsToInclude = {};

  for (const node of allComponentNodes) {
    if (node.fills) {
      for (const fill of node.fills) {
        if (fill.type === "IMAGE") {
          refIdsToInclude[fill.imageRef] = 1;
        }
      }
    }
  }

  const limit = plimit(MAX_CONCURRENT_DOWNLOADS);

  const promises = [];

  for (const refId in result.meta.images) {
    if (!refIdsToInclude[refId]) {
      continue;
    }
    promises.push(
      limit(() => {
        return downloadImageRef(
          client,
          destPath,
          refId,
          result.meta.images[refId]
        );
      })
    );
  }
  await Promise.all(promises);
};

const getFileKeySourcePath = (
  key: string,
  dest: string,
  fileNameFormat: FileNameFormat,
  projects: Project[]
) => {
  let projectName = DEPENDENCIES_NAMESPACE;
  let fileName = key;

  for (const project of projects) {
    for (const file of project.files) {
      if (file.key === key) {
        projectName = project.name;
        fileName = file.name;
        break;
      }
    }
  }
  return path.join(
    dest,
    formatFileName(projectName, fileNameFormat),
    `${formatFileName(fileName, fileNameFormat)}${PC_FILE_EXTENSION}`
  );
};

const downloadNodeImages = async (
  client: FigmaApi,
  module: Dependency2,
  destPath: string
) => {
  logInfo(`Download ${chalk.bold(module.name)} exports`);
  // only want to export components & their children
  const allNodes = getAllComponents(module.document).reduce(
    (allNodes, component) => {
      allNodes.push(...flattenNodes(component));
      return allNodes;
    },
    []
  );

  let nodeIdsByExport: Record<
    string,
    {
      settings: ExportSettings;
      nodes: Record<string, Node>;
    }
  > = {};

  for (const child of allNodes) {
    if (isExported(child)) {
      for (const setting of child.exportSettings) {
        if (setting.format === "PDF") {
          logWarning(`Cannot download PDF for layer: "${child.name}"`);
          continue;
        }

        if (setting.constraint.type !== "SCALE") {
          logWarning(
            `Cannot download "${child.name}" export since it doesn't have SCALE constraint.`
          );
          continue;
        }

        nodeIdsByExport = addNodeToDownload(child, nodeIdsByExport, setting);
      }
    }

    // export all SVG-like nodes
    // DON'T do this, otherwise we'll be in a world of pain with super large files.
    // if (isVectorLike(child)) {
    //   const key = getSettingKey(DEFAULT_EXPORT_SETTINGS);
    //   nodeIdsByExport = addNodeToDownload(
    //     child,
    //     nodeIdsByExport,
    //     DEFAULT_EXPORT_SETTINGS
    //   );
    //   nodeIdsByExport[key].nodes[child.id] = child;
    // }
  }

  for (const key in nodeIdsByExport) {
    const { settings, nodes } = nodeIdsByExport[key];
    const result = await client.getImage(module.fileKey, {
      ids: Object.keys(nodes).join(","),
      format: settings.format.toLowerCase() as any,
      scale: settings.constraint.value
    });

    for (const nodeId in result.images) {
      await downloadImageRef(
        client,
        destPath,
        getNodeExportFileName(nodes[nodeId], module.document, settings)
          .split(".")
          .shift(),
        result.images[nodeId]
      );
    }
  }
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

const downloadImageRef = (
  client: FigmaApi,
  destPath: string,
  name: string,
  url: string
) => {
  logInfo(`Downloading ${url}`);
  return new Promise(resolve => {
    https.get(url, response => {
      const contentType = response.headers["content-type"];
      const ext = EXTENSIONS[contentType];
      if (!ext) {
        console.error(`⚠️ Cannot handle file type ${contentType}`);
        return;
      }
      const filePath = path.join(destPath, `${name}${ext}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      const localFile = fs.createWriteStream(filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      response.pipe(localFile).on("close", () => {
        resolve(null);
      });
    });
  });
};

const logWarning = (text: string) => {
  logWarn(text);
};
