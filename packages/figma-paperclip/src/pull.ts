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
import { FigmaApi } from "./api";
import { loadDependencies } from "./graph";

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
  const sourceInfo = config.sources.map(extractSourceUrlInfo);
  const fileKeys = await getFileKeys(sourceInfo, api);
  const outputDir = path.join(cwd, config.outputDir);

  logInfo(chalk.bold(`Loading dependency graph 🌎`));

  // 1. Load all dependencies, including
  const graph = await loadDependencies(fileKeys, cwd, api);

  logInfo(chalk.bold(`Translating Designs into code 🔨`));

  // 2. translate graph into files

  // const fontFiles: OutputFile[] = await downloadFonts(graph, outputDir);
  // const pcFiles: OutputFile[] = await translateDesigns(
  //   graph,
  //   path.join(outputDir, "designs"),
  //   [...fontFiles.map(file => file.path)]
  // );

  // const allFiles = [...fontFiles, ...pcFiles];

  // for (const file of allFiles) {
  //   await writeFile(file, api);
  // }
};

// const writeFile = (file: OutputFile, api: FigmaApi) => {
//   fsa.mkdirpSync(path.dirname(file.path));

//   if (file.content) {
//     fsa.writeFileSync(file.path, file.content);
//     logInfo(`Write ${path.relative(process.cwd(), file.path)}`);
//   }
// };

// const translateDesigns = (
//   graph: DependencyGraph,
//   outputDir: string,
//   includes: string[]
// ) => {
//   const files: OutputFile[] = [];
//   for (const dep of Object.values(graph)) {
//     files.push(...translateDesign(dep.fileKey, graph, outputDir, includes));
//   }
//   return files;
// };

// const translateDesign = (
//   fileKey: string,
//   graph: DependencyGraph,
//   outputDir: string,
//   includes: string[]
// ) => {
//   const dep = graph[fileKey];
//   const designDir = path.join(outputDir, kebabCase(dep.name));
//   const pageFiles: OutputFile[] = [];
//   const atomFiles = translateAtoms(fileKey, graph, designDir);
//   const pageIncludes = [...includes];
//   for (const page of dep.document.children) {
//     pageFiles.push(
//       ...translatePage(page, fileKey, graph, designDir, pageIncludes)
//     );
//   }
//   return [...atomFiles, ...pageFiles];
// };

// const translateAtoms = (
//   fileKey: string,
//   graph: DependencyGraph,
//   cwd: string
// ) => {
//   return translatePCAtoms(fileKey, graph, { cwd, includes: [] });
// };

// const translatePage = (
//   page: any,
//   fileKey: string,
//   graph: DependencyGraph,
//   cwd: string,
//   includes: string[]
// ) => {
//   const dep = graph[fileKey];

//   const content = translatePCPage(page, fileKey, graph, {
//     cwd: path.join(cwd, "pages"),
//     includes
//   });

//   return content;
// };

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
