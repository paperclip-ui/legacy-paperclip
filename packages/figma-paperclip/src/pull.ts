import {
  COMMAND_NAME,
  configFileExists,
  logError,
  extractSourceUrlInfo,
  readConfig,
  SourceUrlInfo,
  logInfo,
  logVerb
} from "./utils";
import * as chalk from "chalk";
import * as path from "path";
import * as fsa from "fs-extra";
import { FigmaApi } from "./api";
import { loadDependencies } from "./graph";
import { translateFigmaGraph } from "./translate";
import { DependencyGraph, DependencyKind, OutputFile } from "./state";

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

  logInfo(chalk.bold(`Loading dependency graph 🌎`));

  const graph: DependencyGraph = await loadDependencies(fileKeys, cwd, api);

  logInfo(chalk.bold(`Translating Designs into code 🔨`));

  // 2. translate graph into files
  const files = translateFigmaGraph(graph, {
    includes: config.includes || []
  });

  logInfo(chalk.bold(`Compiling to Paperclip code 💾`));

  // 3. write files
  writeFiles(files, cwd, config.outputDir);
};

const writeFiles = (files: OutputFile[], cwd: string, outputDir: string) => {
  for (const file of files) {
    const absoluePath = path.join(cwd, outputDir, file.relativePath);
    fsa.mkdirpSync(path.dirname(absoluePath));

    logVerb(`Write ${absoluePath.replace(cwd + "/", "")}`);
    fsa.writeFileSync(absoluePath, file.content);
  }
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
