import {
  COMMAND_NAME,
  configFileExists,
  logError,
  extractSourceUrlInfo,
  readConfig,
  SourceUrlInfo,
  logInfo
} from "./utils";
import * as chalk from "chalk";
import * as path from "path";
import * as fsa from "fs-extra";
import * as limit from "p-limit";
import { FigmaApi } from "./api";
import { kebabCase } from "lodash";
import { translate } from "./translate";
import { OutputFile } from "./base";
import { fstat } from "fs-extra";

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
  const designs = await downloadDesigns(info, api);

  const files: OutputFile[] = [];

  for (const design of designs) {
    files.push(...translateDesign(design, path.join(cwd, config.outputDir)));
  }

  for (const file of files) {
    await writeFile(file, api);
  }
};

const writeFile = (file: OutputFile, api: FigmaApi) => {
  fsa.mkdirpSync(path.dirname(file.path));

  if (file.content) {
    fsa.writeFileSync(file.path, file.content);
    logInfo(`Write ${path.relative(process.cwd(), file.path)}`);
  }
};

const translateDesign = (design: any, cwd: string) => {
  const files: OutputFile[] = [];
  for (const page of design.document.children) {
    files.push(...translatePage(page, design.name, cwd));
  }
  return files;
};

const translatePage = (page: any, designName: string, cwd: string) => {
  // const filePath = path.join(cwd, kebabCase(designName), kebabCase(page.name) + ".pc");

  const content = translate(page, {
    cwd: path.join(cwd, kebabCase(designName))
  });

  // return [{ path: filePath, content }]
  return content;
};

const downloadDesigns = async (info: SourceUrlInfo[], api: FigmaApi) => {
  const designs = [];
  for (const part of info) {
    if (part.fileKey) {
      designs.push(await api.getFile(part.fileKey));
    } else if (part.projectId) {
      const projectFiles = await api.getProjectFiles(part.projectId);
      for (const projectFile of projectFiles) {
        designs.push(await api.getFile(projectFile.fileKey));
      }
    }
  }

  return designs;
};
